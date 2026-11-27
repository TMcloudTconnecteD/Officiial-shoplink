// controllers/orderController.js
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import axios from "axios";
import PDFDocument from "pdfkit"; // npm i pdfkit
import { sendWatiMessage } from "../utils/wati.js";
import { generateOrderReceiptNumber } from "../utils/orderReceipt.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";
import VoucherRedemption from "../models/voucherRedemptionModel.js";
import RewardCredit from "../models/rewardCreditModel.js";
import PromoSettings from "../models/promoSettingsModel.js";
import awardPaidOrderPoints, {
  awardMallCartBonus,
  awardShopOwnerReceiptPoints,
  refundOrderPoints,
  releaseReservedPoints,
} from "../services/rewardService.js";

const sendOrderNotifications = async (notifications) => {
  const results = await Promise.allSettled(notifications);
  results.filter((result) => result.status === "rejected")
    .forEach((result) => console.error("Order notification failed:", result.reason));
};

const getActorRole = (user) => {
  if (!user) return "system";
  if (user.isSuperAdmin) return "super_admin";
  if (user.isAdmin) return "shop_admin";
  return "customer";
};

const paymentConfirmedHistory = (timestamp, actor = null, actorRole = "system") => ({
  status: "payment_confirmed",
  timestamp,
  actor,
  actorRole,
});

const fulfillmentSteps = [
  "payment_confirmed",
  "prepared_for_shipping",
  "shipped",
  "arrived",
  "delivered",
  "receipt_confirmed",
];
const sellerStatusLabels = {
  prepared_for_shipping: "Prepared for Shipping",
  shipped: "Shipped",
  arrived: "Arrived",
  delivered: "Delivered",
};

const isOrderShopAdmin = (user, order) => Boolean(
  (user?.isAdmin || user?.isSuperAdmin)
  && (user.isSuperAdmin || order.shop?.owner?.toString() === user._id.toString())
);

const isShopAdminForShop = (user, shop) => Boolean(
  (user?.isAdmin || user?.isSuperAdmin)
  && (user.isSuperAdmin || shop?.owner?.toString() === user._id.toString())
);

const getShopOrderFilter = async (user) => {
  if (user.isSuperAdmin) return {};
  const shops = await Shop.find({ owner: user._id }).select("_id").lean();
  const shopIds = shops.map((shop) => shop._id);
  return {
    $or: [
      { shop: { $in: shopIds } },
      { "shopFulfillments.shop": { $in: shopIds } },
    ],
  };
};

const getOrderShareForShops = (order, shopIds) => {
  if (!shopIds) return 1;
  const subtotal = (order.orderItems || []).reduce((total, item) => {
    const itemShopId = item.shop?._id || item.shop || order.shop;
    return shopIds.has(String(itemShopId))
      ? total + Number(item.price || 0) * Number(item.qty || 0)
      : total;
  }, 0);
  return order.itemsPrice > 0 ? Math.min(1, subtotal / order.itemsPrice) : 1;
};

const notifyOrderStatusChanged = async (order, status, shopId = null) => {
  const label = sellerStatusLabels[status] || "Receipt Confirmed";
  const fulfillment = order.shopFulfillments?.find(
    (entry) => shopId && String(entry.shop?._id || entry.shop) === String(shopId)
  );
  const shop = fulfillment?.shop || order.shop;
  const notice = {
    type: "order",
    title: `Order ${label.toLowerCase()}`,
    message: `Order ${order._id} at ${shop?.name || "the shop"} is now ${label}.`,
    link: `/order/${order._id}`,
  };
  const notifications = [notifyAdmins(notice, order.user)];
  if (order.user) notifications.push(notifyUser(order.user, notice));
  await sendOrderNotifications(notifications);
};

const notifyShopOwnerReceiptPoints = async (order, shopId = null) => {
  const fulfillment = order.shopFulfillments?.find(
    (entry) => shopId && String(entry.shop?._id || entry.shop) === String(shopId)
  );
  const shop = fulfillment?.shop || order.shop;
  const ownerId = shop?.owner?._id || shop?.owner;
  if (!ownerId) return;
  await sendOrderNotifications([
    notifyUser(ownerId, {
      type: "reward",
      title: "10 shop loyalty points earned",
      message: `The customer confirmed receipt of order ${order._id}. 10 loyalty points were added to your shop dashboard.`,
      link: "/admin/dashboard",
    }),
  ]);
};

const getShopFulfillment = (order, shopId) => {
  const fulfillments = order?.shopFulfillments || [];
  if (fulfillments.length === 0) return null;
  if (shopId) {
    return fulfillments.find((entry) => String(entry.shop?._id || entry.shop) === String(shopId)) || null;
  }
  return fulfillments.length === 1 ? fulfillments[0] : null;
};

const getOverallFulfillmentStatus = (fulfillments) => fulfillments.reduce(
  (overall, fulfillment) => {
    const status = fulfillment.fulfillmentStatus || "payment_confirmed";
    return fulfillmentSteps.indexOf(status) < fulfillmentSteps.indexOf(overall) ? status : overall;
  },
  "receipt_confirmed"
);

const updateShopFulfillmentStatus = async (order, fulfillment, status, actor) => {
  const shopId = fulfillment.shop?._id || fulfillment.shop;
  const timestamp = new Date();
  const entry = {
    status,
    timestamp,
    actor: actor._id,
    actorRole: getActorRole(actor),
  };
  const nextFulfillments = order.shopFulfillments.map((current) => ({
    fulfillmentStatus: String(current.shop?._id || current.shop) === String(shopId)
      ? status
      : current.fulfillmentStatus || "payment_confirmed",
    deliveredAt: String(current.shop?._id || current.shop) === String(shopId) && status === "delivered"
      ? timestamp
      : current.deliveredAt,
    receiptConfirmedAt: String(current.shop?._id || current.shop) === String(shopId) && status === "receipt_confirmed"
      ? timestamp
      : current.receiptConfirmedAt,
  }));
  const overallStatus = getOverallFulfillmentStatus(nextFulfillments);
  const currentOverallStatus = order.fulfillmentStatus || "payment_confirmed";
  const overallAdvanced = fulfillmentSteps.indexOf(overallStatus) > fulfillmentSteps.indexOf(currentOverallStatus);
  const allDelivered = nextFulfillments.every((current) => (
    fulfillmentSteps.indexOf(current.fulfillmentStatus) >= fulfillmentSteps.indexOf("delivered")
  ));
  const allReceived = nextFulfillments.every((current) => current.fulfillmentStatus === "receipt_confirmed");
  const set = {
    "shopFulfillments.$.fulfillmentStatus": status,
    fulfillmentStatus: overallStatus,
    isDelivered: allDelivered,
  };
  const push = { "shopFulfillments.$.statusHistory": entry };
  if (status === "delivered") set["shopFulfillments.$.deliveredAt"] = timestamp;
  if (status === "receipt_confirmed") {
    set["shopFulfillments.$.receiptConfirmedAt"] = timestamp;
    set["shopFulfillments.$.receiptConfirmedBy"] = actor._id;
  }
  if (allDelivered) set.deliveredAt = timestamp;
  if (allReceived) {
    set.receiptConfirmedAt = timestamp;
    set.receiptConfirmedBy = actor._id;
  }
  if (overallAdvanced) push.statusHistory = entry;

  return Order.findOneAndUpdate(
    {
      _id: order._id,
      __v: order.__v,
      isPaid: true,
      shopFulfillments: {
        $elemMatch: {
          shop: shopId,
          fulfillmentStatus: fulfillment.fulfillmentStatus || "payment_confirmed",
        },
      },
    },
    { $set: set, $push: push, $inc: { __v: 1 } },
    { new: true }
  )
    .populate("shop", "owner name")
    .populate("shopFulfillments.shop", "owner name");
};

const verifyPaypalOrder = async (paypalOrderId, order) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const kesToUsdRate = Number(process.env.PAYPAL_KES_TO_USD_RATE || 0.0077);
  if (!clientId || !clientSecret) {
    const error = new Error("PayPal server verification is not configured. Set PAYPAL_CLIENT_SECRET on the backend.");
    error.statusCode = 503;
    throw error;
  }
  if (!Number.isFinite(kesToUsdRate) || kesToUsdRate <= 0) {
    const error = new Error("PAYPAL_KES_TO_USD_RATE must be a positive number.");
    error.statusCode = 503;
    throw error;
  }

  const paypalApi = process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
  try {
    const tokenResponse = await axios.post(
      `${paypalApi}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        auth: { username: clientId, password: clientSecret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );
    const verifiedResponse = await axios.get(
      `${paypalApi}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
        timeout: 10000,
      }
    );
    const paypalOrder = verifiedResponse.data;
    const purchaseUnit = paypalOrder.purchase_units?.find(
      (unit) => unit.reference_id === order._id.toString()
        && unit.custom_id === order._id.toString()
    );
    const capture = purchaseUnit?.payments?.captures?.find((item) => item.status === "COMPLETED");
    const expectedUsd = Number((Number(order.totalPrice) * kesToUsdRate).toFixed(2));
    const capturedUsd = Number(capture?.amount?.value);
    const amountMatches = Number.isFinite(capturedUsd)
      && Math.abs(capturedUsd - expectedUsd) <= 0.01;
    const merchantMatches = !process.env.PAYPAL_MERCHANT_ID
      || purchaseUnit?.payee?.merchant_id === process.env.PAYPAL_MERCHANT_ID;

    if (
      paypalOrder.id !== paypalOrderId
      || paypalOrder.status !== "COMPLETED"
      || !capture?.id
      || capture.amount?.currency_code !== "USD"
      || !amountMatches
      || !merchantMatches
    ) {
      const error = new Error("PayPal did not verify a completed payment for this order and amount.");
      error.statusCode = 400;
      throw error;
    }

    return { paypalOrder, capture };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("PayPal payment verification failed:", error.response?.data || error.message);
    const verificationError = new Error("Could not verify the PayPal payment. Please retry or contact support.");
    verificationError.statusCode = 502;
    throw verificationError;
  }
};

// Utility Function - returns numbers (not strings)
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0
  );

  const shippingPrice = itemsPrice > 5000 ? 0 : 100;
  const taxRate = 0.08
  ;
  const taxPrice = Number((itemsPrice * taxRate).toFixed(2));

  const totalPrice = Number(
    (itemsPrice + shippingPrice + taxPrice).toFixed(2)
  );

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
}



const createOrder = async (req, res) => {
  let reservedRedemptionId = null;
  let reservedRewardCreditId = null;
  let reservedPoints = 0;
  try {
    const { orderItems, shippingAddress, paymentMethod, shop, voucherCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Ensure required shipping fields exist
    if (!shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        message: "Incomplete shipping info",
        missingFields: [
          !shippingAddress?.city && "city",
          !shippingAddress?.postalCode && "postalCode",
          !shippingAddress?.country && "country",
        ].filter(Boolean),
      });
    }

    // Fetch products from DB
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );

      if (!matchingItemFromDB) {
        throw new Error(`Product not found: ${itemFromClient._id}`);
      }

      return {
        name: itemFromClient.name,
        qty: Number(itemFromClient.qty),
        image: itemFromClient.image || matchingItemFromDB.image,
        price: Number(matchingItemFromDB.price),
        product: itemFromClient._id,
        shop: matchingItemFromDB.shop || shop,
      };
    });

    // Calculate prices
    const prices = calcPrices(dbOrderItems);
    let discountAmount = 0;
    let rewardPointsToUse = Number(req.body?.rewardPointsToUse || 0);
    if (!Number.isSafeInteger(rewardPointsToUse) || rewardPointsToUse < 0) {
      return res.status(400).json({ message: "Reward points must be a non-negative whole number." });
    }
    let voucherRedemption = null;
    let rewardCredit = null;
    const rewardsEnabled = (await PromoSettings.findOne({ key: "global" }).select("rewardProgramEnabled").lean())
      ?.rewardProgramEnabled !== false;
    const isCustomer = req.user && !req.user.isAdmin && !req.user.isSuperAdmin;
    if (voucherCode) {
      if (!req.user) {
        return res.status(401).json({ message: "Sign in to use a reward voucher." });
      }
      const code = String(voucherCode).trim().toUpperCase();
      if (rewardsEnabled && isCustomer) {
        rewardCredit = await RewardCredit.findOne({
          user: req.user._id,
          code,
          status: "available",
        });
      }
      if (rewardCredit) {
        discountAmount = Math.min(prices.totalPrice, rewardCredit.discountAmount);
      } else {
        voucherRedemption = await VoucherRedemption.findOne({
        user: req.user._id,
        code,
        status: "issued",
      }).populate("voucher");
        const voucher = voucherRedemption?.voucher;
        if (
          !voucher
          || !voucher.active
          || (voucher.expiresAt && voucher.expiresAt <= new Date())
        ) {
          return res.status(400).json({ message: "This voucher code is invalid, expired, or already used." });
        }
        discountAmount = voucher.discountType === "percent"
          ? Number((prices.totalPrice * voucher.discountValue / 100).toFixed(2))
          : Math.min(prices.totalPrice, voucher.discountValue);
      }
    } else if (rewardsEnabled && isCustomer && rewardPointsToUse === 0) {
      rewardCredit = await RewardCredit.findOne({
        user: req.user._id,
        status: "available",
      }).sort({ createdAt: 1 });
      if (rewardCredit) discountAmount = Math.min(prices.totalPrice, rewardCredit.discountAmount);
    }

    const voucherDiscountAmount = discountAmount;
    let pointsDiscount = 0;
    if (rewardPointsToUse > 0) {
      if (!req.user) {
        return res.status(401).json({ message: "Sign in to use ShopLink reward points." });
      }
      if (!rewardsEnabled) {
        return res.status(409).json({ message: "ShopLink Rewards are temporarily paused." });
      }
      const pointsUser = await User.findById(req.user._id)
        .select("pointsBalance pointsReserved").lean();
      const availablePoints = Math.max(0, Number(pointsUser?.pointsBalance || 0) - Number(pointsUser?.pointsReserved || 0));
      if (rewardPointsToUse > availablePoints) {
        return res.status(409).json({ message: `Only ${availablePoints} reward points are available.` });
      }
      const discountableTotal = Math.max(0, prices.totalPrice - discountAmount);
      rewardPointsToUse = Math.min(rewardPointsToUse, availablePoints, Math.floor(discountableTotal * 10));
      pointsDiscount = Number((rewardPointsToUse / 10).toFixed(2));
      discountAmount = Number((discountAmount + pointsDiscount).toFixed(2));
    }

    const { itemsPrice, taxPrice, shippingPrice } = prices;
    const totalPrice = Number((prices.totalPrice - discountAmount).toFixed(2));
    const settledByVoucher = totalPrice === 0 && Boolean(voucherRedemption || rewardCredit);
    const settledByPoints = totalPrice === 0 && rewardPointsToUse > 0;
    const settledPaymentMethod = settledByPoints ? "ShopLink points" : "ShopLink voucher";
    const paidAt = settledByVoucher || settledByPoints ? new Date() : undefined;
    let receiptNumber = null;

    // Fetch shop details
    const shopDoc = await Shop.findById(shop);
    const cartShopIds = [...new Set(itemsFromDB.map((product) => String(product.shop || shop)))];
    const shopFulfillments = cartShopIds.map((shopId) => ({
      shop: shopId,
      fulfillmentStatus: settledByVoucher || settledByPoints ? "payment_confirmed" : null,
      statusHistory: settledByVoucher || settledByPoints
        ? [paymentConfirmedHistory(paidAt, req.user._id, getActorRole(req.user))]
        : [],
    }));
    let mallBonusEligibility = { mall: null, shops: [], eligible: false };
    if (cartShopIds.length >= 2) {
      const mallShopRecords = await Shop.find({ _id: { $in: cartShopIds } })
        .select("_id type parentMall")
        .lean();
      const membershipByShop = new Map(mallShopRecords.map((record) => [
        String(record._id),
        record.parentMall ? String(record.parentMall) : record.type === "mall" ? String(record._id) : null,
      ]));
      const mallIds = new Set(cartShopIds.map((id) => membershipByShop.get(id)).filter(Boolean));
      const allShopsInSameMall = cartShopIds.every((id) => membershipByShop.get(id) && mallIds.size === 1);
      if (allShopsInSameMall) {
        mallBonusEligibility = {
          mall: [...mallIds][0],
          shops: cartShopIds,
          eligible: true,
        };
      }
    }

    // Clean shipping address: move old 'address' → 'apartment', ensure phone exists
    const shippingAddressCleaned = {
      ...shippingAddress,
      apartment: shippingAddress.apartment || shippingAddress.address || "",
      phone: shippingAddress.phone || "0000000000",
      shopName: shopDoc ? shopDoc.name : undefined,
    };
    delete shippingAddressCleaned.address; // remove old 'address'

    // Create new order
    const order = new Order({
      orderItems: dbOrderItems,
      // Support guest checkout - user is optional
      user: req.user ? req.user._id : undefined,
      shop,
      shippingAddress: shippingAddressCleaned,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: settledByVoucher || settledByPoints,
      paidAt,
      fulfillmentStatus: settledByVoucher || settledByPoints ? "payment_confirmed" : null,
      statusHistory: settledByVoucher || settledByPoints
        ? [paymentConfirmedHistory(paidAt, req.user._id, getActorRole(req.user))]
        : [],
      finalPaymentMethod: settledByVoucher || settledByPoints ? settledPaymentMethod : null,
      paymentConfirmation: settledByVoucher || settledByPoints
        ? {
          method: settledPaymentMethod,
          gatewayVerified: false,
          gatewayStatus: "REDEEMED",
          customerConfirmedAt: paidAt,
          customerConfirmedBy: req.user._id,
          shopConfirmedAt: null,
          shopConfirmedBy: null,
          receiptNumber: null,
        }
        : undefined,
      paymentResult: settledByVoucher
        || settledByPoints
        ? { status: "COMPLETED", method: settledPaymentMethod }
        : undefined,
      referralVoucher: voucherRedemption || rewardCredit
        ? {
          redemption: voucherRedemption?._id || null,
          rewardCredit: rewardCredit?._id || null,
          discountAmount: voucherDiscountAmount,
        }
        : undefined,
      rewardRedemption: {
        pointsReserved: rewardPointsToUse,
        discountAmount: pointsDiscount,
        reservedAt: rewardPointsToUse > 0 ? new Date() : null,
      },
      mallBonusEligibility,
      shopFulfillments,
    });
    if (settledByVoucher || settledByPoints) {
      receiptNumber = generateOrderReceiptNumber(order._id, paidAt);
      order.paymentConfirmation.receiptNumber = receiptNumber;
    }

    if (rewardPointsToUse > 0) {
      const pointsUser = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          $expr: {
            $gte: [
              { $subtract: ["$pointsBalance", { $ifNull: ["$pointsReserved", 0] }] },
              rewardPointsToUse,
            ],
          },
        },
        { $inc: { pointsReserved: rewardPointsToUse } },
        { new: true }
      );
      if (!pointsUser) {
        return res.status(409).json({ message: "Your available reward points changed. Refresh checkout and try again." });
      }
      reservedPoints = rewardPointsToUse;
    }

    const createdOrder = await order.save();
    if (voucherRedemption) {
      const reservedRedemption = await VoucherRedemption.findOneAndUpdate(
        { _id: voucherRedemption._id, user: req.user._id, status: "issued" },
        { $set: { status: "reserved", order: createdOrder._id } },
        { new: true }
      );
      if (!reservedRedemption) {
        await Order.deleteOne({ _id: createdOrder._id });
        if (reservedPoints) {
          await releaseReservedPoints(req.user._id, reservedPoints);
          reservedPoints = 0;
        }
        return res.status(409).json({ message: "This voucher has already been used. Refresh your cart and try again." });
      }
      reservedRedemptionId = reservedRedemption._id;
    }
    if (rewardCredit) {
      const reservedCredit = await RewardCredit.findOneAndUpdate(
        { _id: rewardCredit._id, user: req.user._id, status: "available" },
        { $set: { status: "reserved", order: createdOrder._id } },
        { new: true }
      );
      if (!reservedCredit) {
        await Order.deleteOne({ _id: createdOrder._id });
        if (reservedPoints) {
          await releaseReservedPoints(req.user._id, reservedPoints);
          reservedPoints = 0;
        }
        return res.status(409).json({ message: "This reward has already been used. Refresh your cart and try again." });
      }
      reservedRewardCreditId = reservedCredit._id;
    }

    reservedPoints = 0;
    if (createdOrder.isPaid) await awardPaidOrderPoints(createdOrder);

    const orderNotice = {
      type: "order",
      title: "New order received",
      message: `Order ${createdOrder._id} has been placed${shopDoc?.name ? ` at ${shopDoc.name}` : ""}.`,
      link: "/admin/orderlist",
    };
    const notices = [notifyAdmins(orderNotice, [createdOrder.user, shopDoc?.owner])];
    if (createdOrder.user) {
      notices.push(notifyUser(createdOrder.user, {
        type: "order",
        title: "Order placed",
        message: `Your order ${createdOrder._id} has been received.`,
        link: `/order/${createdOrder._id}`,
      }));
    }
    if (createdOrder.isPaid) {
      const paymentNotice = {
        type: "payment",
        title: "Reward payment confirmed",
        message: settledByPoints
          ? `Your order was paid through ShopLink Rewards. ${rewardPointsToUse.toLocaleString()} points provided KES ${pointsDiscount.toFixed(2)} in discounts. Receipt ${receiptNumber}.`
          : `Your KES ${discountAmount.toFixed(2)} ShopLink voucher covered this order. Receipt ${receiptNumber}.`,
        link: `/order/${createdOrder._id}`,
      };
      notices.push(notifyAdmins(paymentNotice, [createdOrder.user, shopDoc?.owner]));
      if (createdOrder.user) notices.push(notifyUser(createdOrder.user, paymentNotice));
    }
    if (
      shopDoc?.owner
      && shopDoc.owner.toString() !== createdOrder.user?.toString()
    ) {
      notices.push(notifyUser(shopDoc.owner, orderNotice));
    }
    await sendOrderNotifications(notices);

    // Notify shop owner via WATI (if configured)
    try {
      if (shopDoc && shopDoc.telephone) {
        const phone = shopDoc.telephone.toString();
        sendWatiMessage(
          phone,
          `You have a new order (${createdOrder._id}). Please check your dashboard.`
        );
      }
    } catch (err) {
      console.error("WATI notification error:", err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error in createOrder:", error);
    if (reservedPoints && req.user?._id) {
      await releaseReservedPoints(req.user._id, reservedPoints);
    }
    if (reservedRedemptionId) {
      await VoucherRedemption.updateOne(
        { _id: reservedRedemptionId, status: "reserved" },
        { $set: { status: "issued", order: null } }
      );
    }
    if (reservedRewardCreditId) {
      await RewardCredit.updateOne(
        { _id: reservedRewardCreditId, status: "reserved" },
        { $set: { status: "available", order: null } }
      );
    }
    res.status(500).json({ error: error.message || "Server error" });
  }
};




const getAllOrders = async (req, res) => {
  try {
    const filter = await getShopOrderFilter(req.user);
    const orders = await Order.find(filter)
      .populate("user", "username email")
      .populate("shop", "name location owner")
      .populate("statusHistory.actor", "username")
      .populate("shopFulfillments.shop", "name location owner")
      .populate("shopFulfillments.statusHistory.actor", "username")
      .populate("orderItems.shop", "name")
      .populate({
        path: "orderItems.product",
        populate: { path: "shop", select: "name location" },
      });
    if (!req.user.isSuperAdmin) {
      const ownedShops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      const ownedShopIds = new Set(ownedShops.map((shop) => String(shop._id)));
      for (const order of orders) {
        if (!order.shopFulfillments?.length) continue;
        const totalFulfillmentCount = order.shopFulfillments.length;
        const visibleFulfillments = order.shopFulfillments.filter((fulfillment) => (
          ownedShopIds.has(String(fulfillment.shop?._id || fulfillment.shop))
        ));
        const visibleShopIds = new Set(
          visibleFulfillments.map((fulfillment) => String(fulfillment.shop?._id || fulfillment.shop))
        );
        const visibleItems = order.orderItems.filter((item) => {
          const itemShopId = item.shop?._id
            || item.shop
            || item.product?.shop?._id
            || item.product?.shop
            || order.shop?._id
            || order.shop;
          return ownedShopIds.has(String(itemShopId));
        });
        const ownSubtotal = visibleItems.reduce(
          (subtotal, item) => subtotal + Number(item.price || 0) * Number(item.qty || 0),
          0
        );
        const share = order.itemsPrice > 0
          ? Math.min(1, ownSubtotal / order.itemsPrice)
          : 1;
        order.shopFulfillments = visibleFulfillments;
        order.orderItems = visibleItems;
        order.shop = visibleFulfillments[0]?.shop || order.shop;
        if (visibleShopIds.size < totalFulfillmentCount) {
          for (const field of ["itemsPrice", "taxPrice", "shippingPrice", "totalPrice"]) {
            order[field] = Number((Number(order[field] || 0) * share).toFixed(2));
          }
        }
      }
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderFinancialSummary = async (req, res) => {
  try {
    const filter = { ...(await getShopOrderFilter(req.user)), isPaid: true };
    const shopIds = req.user.isSuperAdmin
      ? null
      : new Set((await Shop.find({ owner: req.user._id }).select("_id").lean()).map((shop) => String(shop._id)));

    const orders = await Order.find(filter).select(
      "shop itemsPrice taxPrice shippingPrice totalPrice finalPaymentMethod paymentMethod paymentResult checkoutRequestId referralVoucher.discountAmount rewardRedemption.discountAmount orderItems.shop orderItems.price orderItems.qty"
    ).lean();
    const summary = orders.reduce((totals, order) => {
      const share = getOrderShareForShops(order, shopIds);
      const method = order.finalPaymentMethod
        || order.paymentResult?.method
        || (order.checkoutRequestId ? "M-Pesa" : null)
        || (/^CASH-/i.test(order.paymentResult?.id || "") ? "Cash" : null)
        || (order.paymentResult?.email_address ? "PayPal" : null)
        || order.paymentMethod
        || "Unclassified";

      const itemsPrice = Number(order.itemsPrice || 0) * share;
      const taxPrice = Number(order.taxPrice || 0) * share;
      const shippingPrice = Number(order.shippingPrice || 0) * share;
      const grossAmount = itemsPrice + taxPrice + shippingPrice;
      const discountAmount = Math.min(
        Number(order.itemsPrice || 0) + Number(order.taxPrice || 0) + Number(order.shippingPrice || 0),
        Math.max(
          0,
          Number(order.referralVoucher?.discountAmount || 0)
            + Number(order.rewardRedemption?.discountAmount || 0)
        )
      ) * share;
      const netRatio = grossAmount > 0 ? (grossAmount - discountAmount) / grossAmount : 0;
      totals.productSales += itemsPrice * netRatio;
      totals.taxCollected += taxPrice * netRatio;
      totals.deliveryFees += shippingPrice * netRatio;
      totals.discountsGiven += discountAmount;
      totals.totalReceived += Number(order.totalPrice || 0) * share;
      totals.paymentMethods[method] = totals.paymentMethods[method] || { orderCount: 0, amount: 0 };
      totals.paymentMethods[method].orderCount += 1;
      totals.paymentMethods[method].amount += Number(order.totalPrice || 0) * share;
      return totals;
    }, {
      confirmedOrders: orders.length,
      productSales: 0,
      taxCollected: 0,
      deliveryFees: 0,
      discountsGiven: 0,
      totalReceived: 0,
      paymentMethods: {},
    });

    for (const field of ["productSales", "taxCollected", "deliveryFees", "discountsGiven", "totalReceived"]) {
      summary[field] = Number(summary[field].toFixed(2));
    }
    summary.grossPlatformIncome = Number((summary.taxCollected + summary.deliveryFees).toFixed(2));
    for (const method of Object.keys(summary.paymentMethods)) {
      summary.paymentMethods[method].amount = Number(summary.paymentMethods[method].amount.toFixed(2));
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("shop", "name")
      .populate("shopFulfillments.shop", "name")
      .populate("shopFulfillments.statusHistory.actor", "username")
      .populate("orderItems.shop", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    const filter = await getShopOrderFilter(req.user);
    const totalOrders = await Order.countDocuments(filter);
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    const filter = { ...(await getShopOrderFilter(req.user)), isPaid: true };
    const shopIds = req.user.isSuperAdmin
      ? null
      : new Set((await Shop.find({ owner: req.user._id }).select("_id").lean()).map((shop) => String(shop._id)));
    const orders = await Order.find(filter)
      .select("shop itemsPrice totalPrice orderItems.shop orderItems.price orderItems.qty")
      .lean();
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0) * getOrderShareForShops(order, shopIds),
      0
    );
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmCashPayment = async (req, res) => {
  try {
    const method = req.body?.method;
    if (method !== "Cash") {
      return res.status(400).json({ message: "Only cash payments can be manually confirmed." });
    }

    const order = await Order.findById(req.params.id)
      .populate("shop", "owner name")
      .populate("shopFulfillments.shop", "owner");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user._id.toString();
    const isBuyer = order.user?.toString() === userId;
    const isShopAdmin = Boolean(req.user.isAdmin || req.user.isSuperAdmin)
      && (
        req.user.isSuperAdmin
        || order.shop?.owner?.toString() === userId
        || order.shopFulfillments.some((fulfillment) => fulfillment.shop?.owner?.toString() === userId)
      );

    if (!isBuyer && !isShopAdmin) {
      return res.status(403).json({ message: "Only the customer or this shop's administrator can confirm cash payment." });
    }

    if (order.isPaid) {
      if (order.finalPaymentMethod !== "Cash") {
        return res.status(409).json({ message: `This order is already paid by ${order.finalPaymentMethod || "another method"}.` });
      }
      await awardPaidOrderPoints(order);
      return res.json(order);
    }

    if (order.paymentConfirmation?.gatewayStatus === "PENDING") {
      return res.status(409).json({
        message: "The M-Pesa request is still pending. Wait for its success or cancellation confirmation before recording cash.",
      });
    }

    if (order.paymentConfirmation?.method && order.paymentConfirmation.method !== method) {
      return res.status(409).json({ message: `The other party has already confirmed ${order.paymentConfirmation.method}.` });
    }

    const confirmedAt = new Date();
    const confirmationFields = isBuyer
      ? {
          "paymentConfirmation.customerConfirmedAt": confirmedAt,
          "paymentConfirmation.customerConfirmedBy": req.user._id,
        }
      : {
          "paymentConfirmation.shopConfirmedAt": confirmedAt,
          "paymentConfirmation.shopConfirmedBy": req.user._id,
        };
    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        isPaid: false,
        "paymentConfirmation.method": { $in: [null, method] },
      },
      {
        $set: {
          "paymentConfirmation.method": method,
          ...confirmationFields,
        },
      },
      { new: true }
    ).populate("shop", "owner name");

    if (!updated) {
      const latestOrder = await Order.findById(order._id).populate("shop", "owner name");
      if (latestOrder?.isPaid && latestOrder.finalPaymentMethod === "Cash") return res.json(latestOrder);
      return res.status(409).json({ message: "Payment confirmation changed. Refresh the order and try again." });
    }

    let settledOrder = updated;
    const hasBothConfirmations = Boolean(
      updated.paymentConfirmation?.customerConfirmedAt
      && updated.paymentConfirmation?.shopConfirmedAt
    );
    if (hasBothConfirmations) {
      const paidAt = new Date();
      const receiptNumber = generateOrderReceiptNumber(updated._id, paidAt);
      const paymentConfirmedEntry = paymentConfirmedHistory(paidAt, req.user._id, getActorRole(req.user));
      const settlementSet = {
        isPaid: true,
        paidAt,
        fulfillmentStatus: "payment_confirmed",
        paymentMethod: "Cash",
        finalPaymentMethod: "Cash",
        "paymentConfirmation.gatewayVerified": false,
        "paymentConfirmation.receiptNumber": receiptNumber,
        "paymentResult.id": receiptNumber,
        "paymentResult.status": "COMPLETED",
        "paymentResult.update_time": paidAt.toISOString(),
        "paymentResult.email_address": "",
        "paymentResult.method": "Cash",
      };
      const settlementPush = { statusHistory: paymentConfirmedEntry };
      if (updated.shopFulfillments?.length > 0) {
        settlementSet["shopFulfillments.$[].fulfillmentStatus"] = "payment_confirmed";
        settlementPush["shopFulfillments.$[].statusHistory"] = paymentConfirmedEntry;
      }
      settledOrder = await Order.findOneAndUpdate(
        {
          _id: updated._id,
          isPaid: false,
          "paymentConfirmation.method": "Cash",
          "paymentConfirmation.customerConfirmedAt": { $ne: null },
          "paymentConfirmation.shopConfirmedAt": { $ne: null },
        },
        {
          $set: settlementSet,
          $push: settlementPush,
        },
        { new: true }
      ).populate("shop", "owner name");

      if (!settledOrder) {
        settledOrder = await Order.findById(updated._id).populate("shop", "owner name");
      }
    }
    if (!settledOrder) {
      return res.status(409).json({ message: "Order changed while the payment confirmation was being saved. Refresh and verify its current status." });
    }
    if (settledOrder.isPaid) await awardPaidOrderPoints(settledOrder);

    const paymentNotice = settledOrder.isPaid
      ? {
          type: "payment",
          title: "Cash payment confirmed",
          message: `Cash payment for order ${settledOrder._id} is confirmed by the customer and shop. Receipt ${settledOrder.paymentConfirmation.receiptNumber}.`,
          link: `/order/${settledOrder._id}`,
        }
      : {
          type: "payment",
          title: "Cash confirmation received",
          message: `A ${isBuyer ? "customer" : "shop"} confirmation was recorded for cash payment on order ${settledOrder._id}. The other party must confirm.`,
          link: `/order/${settledOrder._id}`,
        };
    const notifications = [notifyAdmins(paymentNotice, settledOrder.user)];
    if (settledOrder.user) notifications.push(notifyUser(settledOrder.user, paymentNotice));
    const shopOwnerIds = new Set([
      settledOrder.shop?.owner?.toString(),
      ...settledOrder.shopFulfillments.map((fulfillment) => fulfillment.shop?.owner?.toString()),
    ].filter(Boolean));
    for (const ownerId of shopOwnerIds) {
      notifications.push(notifyUser(ownerId, paymentNotice));
    }
    await sendOrderNotifications(notifications);
    res.json(settledOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSalesByDate = async (req, res) => {
  try {
    const match = { ...(await getShopOrderFilter(req.user)), isPaid: true };
    const shopIds = req.user.isSuperAdmin
      ? null
      : (await Shop.find({ owner: req.user._id }).select("_id").lean()).map((shop) => shop._id);
    const salesByDate = await Order.aggregate([
      { $match: match },
      {
        $addFields: {
          orderItems: {
            $map: {
              input: { $ifNull: ["$orderItems", []] },
              as: "item",
              in: { $mergeObjects: ["$$item", { shop: { $ifNull: ["$$item.shop", "$shop"] } }] },
            },
          },
        },
      },
      { $unwind: "$orderItems" },
      ...(shopIds ? [{ $match: { "orderItems.shop": { $in: shopIds } } }] : []),
      {
        $group: {
          _id: {
            order: "$_id",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          },
          itemSubtotal: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          itemsPrice: { $first: "$itemsPrice" },
          totalPrice: { $first: "$totalPrice" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalSales: {
            $sum: {
              $cond: [
                { $gt: ["$itemsPrice", 0] },
                { $multiply: ["$totalPrice", { $divide: ["$itemSubtotal", "$itemsPrice"] }] },
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shop", "name location owner")
      .populate("statusHistory.actor", "username")
      .populate("shopFulfillments.shop", "name location owner")
      .populate("shopFulfillments.statusHistory.actor", "username")
      .populate("orderItems.shop", "name");

    if (order) {
      const isFulfillmentShopAdmin = order.shopFulfillments.some(
        (fulfillment) => fulfillment.shop?.owner?.toString() === req.user?._id?.toString()
      );
      if (
        req.user
        && !req.user.isSuperAdmin
        && order.shop?.owner?.toString() !== req.user._id.toString()
        && !isFulfillmentShopAdmin
        && order.user?._id?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "You cannot view another shop's order" });
      }
      if (!order.shippingAddress.shopName && order.shop && order.shop.name) {
        order.shippingAddress.shopName = order.shop.name;
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("shop", "owner");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the customer who placed this order can confirm PayPal payment." });
    }
    if (order.paymentConfirmation?.method === "Cash") {
      return res.status(409).json({ message: "Cash confirmation has already started. Complete or resolve that confirmation before using PayPal." });
    }

    if (!req.body?.id) {
      return res.status(400).json({ message: "A PayPal order reference is required." });
    }
    if (order.isPaid) {
      if (order.finalPaymentMethod === "PayPal") {
        await awardPaidOrderPoints(order);
        return res.json(order);
      }
      return res.status(409).json({ message: `This order has already been paid by ${order.finalPaymentMethod || "another method"}.` });
    }

    const { paypalOrder, capture } = await verifyPaypalOrder(req.body.id, order);
    const paidAt = new Date();
    const paymentConfirmation = {
      method: "PayPal",
      gatewayVerified: true,
      gatewayStatus: "COMPLETED",
      customerConfirmedAt: paidAt,
      customerConfirmedBy: req.user._id,
      shopConfirmedAt: null,
      shopConfirmedBy: null,
      receiptNumber: generateOrderReceiptNumber(order._id, paidAt),
    };
    const paymentResult = {
      id: capture?.id || req.body.id,
      status: capture.status || paypalOrder.status,
      update_time: capture.create_time || paidAt.toISOString(),
      email_address: paypalOrder.payer?.email_address || "",
      method: "PayPal",
    };

    const paymentConfirmedEntry = paymentConfirmedHistory(paidAt, req.user._id, getActorRole(req.user));
    const paymentSet = {
      isPaid: true,
      paidAt,
      fulfillmentStatus: "payment_confirmed",
      paymentMethod: "PayPal",
      finalPaymentMethod: "PayPal",
      paymentConfirmation,
      paymentResult,
    };
    const paymentPush = { statusHistory: paymentConfirmedEntry };
    if (order.shopFulfillments?.length > 0) {
      paymentSet["shopFulfillments.$[].fulfillmentStatus"] = "payment_confirmed";
      paymentPush["shopFulfillments.$[].statusHistory"] = paymentConfirmedEntry;
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, isPaid: false, "paymentConfirmation.method": { $ne: "Cash" } },
      {
        $set: paymentSet,
        $push: paymentPush,
      },
      { new: true }
    );
    if (!updatedOrder) {
      const currentOrder = await Order.findById(order._id);
      if (currentOrder?.isPaid && currentOrder.finalPaymentMethod === "PayPal") {
        await awardPaidOrderPoints(currentOrder);
        return res.json(currentOrder);
      }
      return res.status(409).json({ message: "This order's payment status changed. Refresh the order and verify its final payment method." });
    }
    await awardPaidOrderPoints(updatedOrder);
    const notice = {
      type: "payment",
      title: "PayPal payment confirmed",
      message: `PayPal payment for order ${updatedOrder._id} has been recorded. Receipt ${updatedOrder.paymentConfirmation.receiptNumber}.`,
      link: `/order/${updatedOrder._id}`,
    };
    const notices = [notifyAdmins(notice, updatedOrder.user)];
    notices.push(notifyUser(updatedOrder.user, notice));
    await sendOrderNotifications(notices);
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "PayPal payment verification failed." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["prepared_for_shipping", "shipped", "arrived", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Choose a valid order fulfillment status." });
    }

    const order = await Order.findById(req.params.id)
      .populate("shop", "owner name")
      .populate("shopFulfillments.shop", "owner name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.shopFulfillments.length > 0) {
      const fulfillment = getShopFulfillment(order, req.body?.shopId);
      if (!fulfillment) {
        return res.status(400).json({
          message: req.body?.shopId
            ? "That shop is not part of this order."
            : "Select which shop's items you are updating.",
        });
      }
      if (!isShopAdminForShop(req.user, fulfillment.shop)) {
        return res.status(403).json({ message: "You can only manage delivery for your own shop." });
      }
      if (!order.isPaid) {
        return res.status(409).json({ message: "Confirm payment before updating order fulfillment." });
      }
      const currentStatus = fulfillment.fulfillmentStatus || "payment_confirmed";
      const currentIndex = fulfillmentSteps.indexOf(currentStatus);
      if (currentIndex < 0 || currentIndex >= fulfillmentSteps.length - 1) {
        return res.status(409).json({ message: "This shop's items are already closed." });
      }
      const nextStatus = fulfillmentSteps[currentIndex + 1];
      if (status !== nextStatus) {
        return res.status(409).json({ message: `The next status must be ${sellerStatusLabels[nextStatus] || "Receipt Confirmed"}.` });
      }
      const updatedOrder = await updateShopFulfillmentStatus(order, fulfillment, status, req.user);
      if (!updatedOrder) {
        return res.status(409).json({ message: "Order status changed. Refresh and try again." });
      }
      await notifyOrderStatusChanged(updatedOrder, status, fulfillment.shop?._id || fulfillment.shop);
      return res.json(updatedOrder);
    }

    if (!isOrderShopAdmin(req.user, order)) {
      return res.status(403).json({ message: "You can only manage delivery for your own shop." });
    }
    if (!order.isPaid) {
      return res.status(409).json({ message: "Confirm payment before updating order fulfillment." });
    }

    const currentStatus = order.fulfillmentStatus || (order.isDelivered ? "delivered" : "payment_confirmed");
    const currentIndex = fulfillmentSteps.indexOf(currentStatus);
    if (currentIndex < 0 || currentIndex >= fulfillmentSteps.length - 1) {
      return res.status(409).json({ message: "This order is already closed." });
    }
    const nextStatus = fulfillmentSteps[currentIndex + 1];
    if (status !== nextStatus) {
      return res.status(409).json({ message: `The next status must be ${sellerStatusLabels[nextStatus] || "Receipt Confirmed"}.` });
    }

    const timestamp = new Date();
    const history = [];
    if (!order.fulfillmentStatus) {
      history.push(paymentConfirmedHistory(order.paidAt || order.createdAt));
    }
    history.push({
      status,
      timestamp,
      actor: req.user._id,
      actorRole: getActorRole(req.user),
    });

    const update = {
      $set: { fulfillmentStatus: status },
      $push: { statusHistory: { $each: history } },
    };
    if (status === "delivered") {
      update.$set.isDelivered = true;
      update.$set.deliveredAt = timestamp;
    }
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        isPaid: true,
        fulfillmentStatus: order.fulfillmentStatus || null,
        isDelivered: order.isDelivered,
      },
      update,
      { new: true }
    ).populate("shop", "owner name");

    if (!updatedOrder) {
      return res.status(409).json({ message: "Order status changed. Refresh and try again." });
    }
    await notifyOrderStatusChanged(updatedOrder, status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("shop", "owner name")
      .populate("shopFulfillments.shop", "owner name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.shopFulfillments.length > 0) {
      const fulfillment = getShopFulfillment(order, req.body?.shopId);
      if (!fulfillment) {
        return res.status(400).json({
          message: req.body?.shopId
            ? "That shop is not part of this order."
            : "Select which shop's items you are marking delivered.",
        });
      }
      if (!isShopAdminForShop(req.user, fulfillment.shop)) {
        return res.status(403).json({ message: "You can only manage delivery for your own shop." });
      }
      if (!order.isPaid) {
        return res.status(409).json({ message: "Confirm payment before marking this order delivered." });
      }
      if (
        fulfillment.fulfillmentStatus === "delivered"
        || fulfillment.fulfillmentStatus === "receipt_confirmed"
      ) {
        return res.json(order);
      }
      const updatedOrder = await updateShopFulfillmentStatus(order, fulfillment, "delivered", req.user);
      if (!updatedOrder) {
        return res.status(409).json({ message: "Order status changed. Refresh and try again." });
      }
      await notifyOrderStatusChanged(updatedOrder, "delivered", fulfillment.shop?._id || fulfillment.shop);
      return res.json(updatedOrder);
    }

    if (!isOrderShopAdmin(req.user, order)) {
      return res.status(403).json({ message: "You can only manage delivery for your own shop." });
    }
    if (!order.isPaid) {
      return res.status(409).json({ message: "Confirm payment before marking this order delivered." });
    }
    if (order.isDelivered || order.fulfillmentStatus === "delivered" || order.fulfillmentStatus === "receipt_confirmed") {
      return res.json(order);
    }

    const timestamp = new Date();
    const history = [];
    if (!order.fulfillmentStatus) {
      history.push(paymentConfirmedHistory(order.paidAt || order.createdAt));
    }
    history.push({
      status: "delivered",
      timestamp,
      actor: req.user._id,
      actorRole: getActorRole(req.user),
    });
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        isPaid: true,
        isDelivered: false,
        fulfillmentStatus: order.fulfillmentStatus || null,
      },
      {
        $set: { fulfillmentStatus: "delivered", isDelivered: true, deliveredAt: timestamp },
        $push: { statusHistory: { $each: history } },
      },
      { new: true }
    ).populate("shop", "owner name");

    if (!updatedOrder) {
      const currentOrder = await Order.findById(order._id).populate("shop", "owner name");
      if (currentOrder?.isDelivered) return res.json(currentOrder);
      return res.status(409).json({ message: "Order status changed. Refresh and try again." });
    }
    await notifyOrderStatusChanged(updatedOrder, "delivered");
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("shop", "owner name")
      .populate("shopFulfillments.shop", "owner name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the customer who placed this order can confirm receipt." });
    }
    if (order.shopFulfillments.length > 0) {
      const fulfillment = getShopFulfillment(order, req.body?.shopId);
      if (!fulfillment) {
        return res.status(400).json({
          message: req.body?.shopId
            ? "That shop is not part of this order."
            : "Select which shop's items you have received.",
        });
      }
      const shopId = fulfillment.shop?._id || fulfillment.shop;
      if (fulfillment.fulfillmentStatus === "receipt_confirmed" || fulfillment.receiptConfirmedAt) {
        await awardShopOwnerReceiptPoints(order, shopId);
        await awardMallCartBonus(order);
        return res.json(order);
      }
      if (fulfillment.fulfillmentStatus !== "delivered") {
        return res.status(409).json({ message: "You can confirm receipt after this shop marks its items delivered." });
      }
      const updatedOrder = await updateShopFulfillmentStatus(
        order,
        fulfillment,
        "receipt_confirmed",
        req.user
      );
      if (!updatedOrder) {
        const latestOrder = await Order.findById(order._id)
          .populate("shop", "owner name")
          .populate("shopFulfillments.shop", "owner name");
        const latestFulfillment = getShopFulfillment(latestOrder, shopId);
        if (latestFulfillment?.receiptConfirmedAt) {
          await awardShopOwnerReceiptPoints(latestOrder, shopId);
          await awardMallCartBonus(latestOrder);
          return res.json(latestOrder);
        }
        return res.status(409).json({ message: "Receipt confirmation changed. Refresh and try again." });
      }
      await notifyOrderStatusChanged(updatedOrder, "receipt_confirmed", shopId);
      if (await awardShopOwnerReceiptPoints(updatedOrder, shopId)) {
        await notifyShopOwnerReceiptPoints(updatedOrder, shopId);
      }
      await awardMallCartBonus(updatedOrder);
      return res.json(updatedOrder);
    }

    if (order.receiptConfirmedAt || order.fulfillmentStatus === "receipt_confirmed") {
      await awardShopOwnerReceiptPoints(order);
      await awardMallCartBonus(order);
      return res.json(order);
    }
    if (!(order.isDelivered || order.fulfillmentStatus === "delivered")) {
      return res.status(409).json({ message: "You can confirm receipt after the seller marks the order delivered." });
    }

    const timestamp = new Date();
    const history = [];
    if (!order.fulfillmentStatus) {
      history.push(paymentConfirmedHistory(order.paidAt || order.createdAt));
      history.push({
        status: "delivered",
        timestamp: order.deliveredAt || order.updatedAt || timestamp,
        actor: null,
        actorRole: "system",
      });
    }
    history.push({
      status: "receipt_confirmed",
      timestamp,
      actor: req.user._id,
      actorRole: getActorRole(req.user),
    });

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        isDelivered: true,
        fulfillmentStatus: order.fulfillmentStatus || null,
        $or: [{ receiptConfirmedAt: null }, { receiptConfirmedAt: { $exists: false } }],
      },
      {
        $set: {
          fulfillmentStatus: "receipt_confirmed",
          receiptConfirmedAt: timestamp,
          receiptConfirmedBy: req.user._id,
        },
        $push: { statusHistory: { $each: history } },
      },
      { new: true }
    ).populate("shop", "owner name");

    if (!updatedOrder) {
      const currentOrder = await Order.findById(order._id).populate("shop", "owner name");
      if (currentOrder?.receiptConfirmedAt) {
        await awardShopOwnerReceiptPoints(currentOrder);
        await awardMallCartBonus(currentOrder);
        return res.json(currentOrder);
      }
      return res.status(409).json({ message: "Receipt confirmation changed. Refresh and try again." });
    }

    await notifyOrderStatusChanged(updatedOrder, "receipt_confirmed");
    if (await awardShopOwnerReceiptPoints(updatedOrder)) {
      await notifyShopOwnerReceiptPoints(updatedOrder);
    }
    await awardMallCartBonus(updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const restoreOrderRewardPoints = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("shop", "owner name");
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!isOrderShopAdmin(req.user, order)) {
      return res.status(403).json({ message: "Only this shop administrator or the super admin can restore order points." });
    }
    if (!order.isPaid) {
      return res.status(409).json({ message: "Only a paid order can have reward points restored." });
    }
    const refundReference = String(req.body?.refundReference || "").trim();
    if (!refundReference) {
      return res.status(400).json({ message: "Provide the external payment refund reference before restoring points." });
    }
    const restored = await refundOrderPoints(order, refundReference);
    if (!restored) {
      return res.status(409).json({ message: "No unrefunded reward-point redemption was found for this order." });
    }
    res.json({
      message: `${order.rewardRedemption.pointsRedeemed} reward points restored.`,
      pointsRestored: order.rewardRedemption.pointsRedeemed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not restore order reward points." });
  }
};

const getReceipt = async (req, res) => {
  try {
    console.log(`getReceipt called for order id: ${req.params.id}`);
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shop", "name location");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.isPaid) return res.status(400).json({ message: "Order not paid yet" });

    // force a single A5 sheet – prevent automatic multi-page output
    const doc = new PDFDocument({ size: 'A5', margin: 20, autoFirstPage: false });
    doc.addPage();

    // Ensure PDFs are never cached by CDNs
    // Ensure PDFs are never cached by CDNs
    // Mark origin for debugging (helps identify when a CDN is returning stale HTML)
    res.setHeader('X-Receipt-Source', 'origin');
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${order._id}.pdf`
    );
    // also explicitly prevent caching for PDF
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');

    doc.pipe(res);

    // Try to include logo as a watermark (semi-transparent, centered behind text)
    const logoUrl = (order.shop && order.shop.image) || process.env.SITE_LOGO_URL || 'https://res.cloudinary.com/tmcloud/image/upload/v1765073472/shoplink_uploads/zhj9iddpymn8z441krtg.png';
    try {
      if (typeof fetch === 'function') {
        const logoResp = await fetch(logoUrl);
        if (logoResp.ok) {
          const arrayBuffer = await logoResp.arrayBuffer();
          const buf = Buffer.from(arrayBuffer);
          // place a small semi-transparent watermark for A5 format
          const watermarkSize = 60; // smaller for A5 page
          const pageWidth = doc.page.width;
          const pageHeight = doc.page.height;
          const left = (pageWidth - watermarkSize) / 2;
          const top = (pageHeight - watermarkSize) / 2;
          // set opacity to ~10% for a subtle watermark effect
          doc.opacity(0.1);
          doc.image(buf, left, top, { fit: [watermarkSize, watermarkSize] });
          // restore full opacity for content
          doc.opacity(1);
          console.log(`Receipt watermark placed at center with opacity=0.1 size=${watermarkSize}`);
        }
      }
    } catch (err) {
      console.warn('Could not fetch logo for watermark:', err.message || err);
    }

    // Luxurious centered title with a gold accent (starts below logo)
    try {
      doc.font('Times-Roman');
    } catch (e) {
      // Times-Roman is built-in, but ignore if unavailable
    }
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor('#b58b28').text((order.shop && order.shop.name) ? String(order.shop.name) : 'Shop_Link', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#111827').text('RECEIPT', { align: 'center', characterSpacing: 1 });
    doc.moveDown(0.3);

    doc.fontSize(9).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.paidAt).toLocaleString()}`);
    // Determine customer info: prefer recorded order user, then request-authenticated user, else Guest
    let customerSource = 'guest';
    let customerName = 'Guest';
    let customerEmail = 'N/A';

    if (order.user && (order.user.username || order.user.email)) {
      customerSource = 'order.user';
      customerName = order.user.username || `User:${order.user._id}`;
      customerEmail = order.user.email || 'N/A';
    } else if (req.user) {
      customerSource = 'request.user';
      customerName = req.user.username || `User:${req.user._id}`;
      customerEmail = req.user.email || 'N/A';
    }

    console.log(`Receipt customer source: ${customerSource} (name=${customerName}, email=${customerEmail})`);

    doc.text(`Customer: ${customerName}`);
    doc.text(`Email: ${customerEmail}`);
    doc.text(`Shop: ${order.shop?.name || "N/A"}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    const finalPaymentMethod = order.finalPaymentMethod || order.paymentMethod;
    const receiptNumber = order.paymentConfirmation?.receiptNumber || order.paymentResult?.id || order._id;
    doc.text(`Payment: ${finalPaymentMethod}`);
    doc.text(`Receipt number: ${receiptNumber}`);
    if (order.paymentResult?.id && order.paymentResult.id !== receiptNumber) {
      doc.text(`Gateway reference: ${order.paymentResult.id}`);
    }
    doc.moveDown(0.2);


    doc.fontSize(9).text("Items:", { underline: true });
    order.orderItems.forEach((item) => {
      doc.fontSize(8).text(
        `${item.name} x${item.qty} = KES ${(item.qty * item.price).toFixed(2)}`
      );
    });
    doc.moveDown(0.1);

    doc.fontSize(9).text(`Items: KES ${order.itemsPrice.toFixed(2)}`);
    doc.text(`Shipping: KES ${order.shippingPrice.toFixed(2)}`);
    doc.text(`Tax: KES ${order.taxPrice.toFixed(2)}`);
    if (Number(order.referralVoucher?.discountAmount) > 0) {
      doc.text(`Reward voucher: -KES ${Number(order.referralVoucher.discountAmount).toFixed(2)}`);
    }
    if (Number(order.rewardRedemption?.discountAmount) > 0) {
      doc.text(`ShopLink points (${Number(order.rewardRedemption.pointsRedeemed || order.rewardRedemption.pointsReserved)} points): -KES ${Number(order.rewardRedemption.discountAmount).toFixed(2)}`);
    }
    doc.moveDown(0.1);
    doc.fontSize(11).text(`Total: KES ${order.totalPrice.toFixed(2)}`, {
      align: "right",
    });

    // Footer helper - compact footer for A5 format
    const addFooter = (docInstance) => {
      try {
        const footerY = docInstance.page.height - 30; // compact for A5
        const shopName = (order.shop && order.shop.name) ? String(order.shop.name) : 'Shop_Link';
        const contact = (order.shop && order.shop.telephone) ? String(order.shop.telephone) : (process.env.SUPPORT_PHONE || 'N/A');
        const center = `© ${new Date().getFullYear()} ${shopName} — ${contact}`;

        // separator line (subtle but visible)
        docInstance.strokeColor('#d1d5db').lineWidth(0.5);
        docInstance.moveTo(docInstance.page.margins.left, footerY - 8)
          .lineTo(docInstance.page.width - docInstance.page.margins.right, footerY - 8)
          .stroke();

        // footer text
        docInstance.fontSize(7).fillColor('#374151');
        docInstance.text(center, docInstance.page.margins.left, footerY - 4, { align: 'center' });

        // reset color for body content
        docInstance.fillColor('#111827');
      } catch (e) {
        console.warn('Failed to render footer:', e.message || e);
      }
    };

    // Only add footer to single A5 page (don't trigger pageAdded event for unwanted extra pages)
    addFooter(doc);

    doc.end();
  } catch (err) {
    console.error("getReceipt error:", err);
    res.status(500).json({ message: err.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getOrderFinancialSummary,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  confirmCashPayment,
  updateOrderStatus,
  markOrderAsDelivered,
  confirmOrderReceipt,
  restoreOrderRewardPoints,
  getReceipt,
};
