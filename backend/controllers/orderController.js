// controllers/orderController.js
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import axios from "axios";
import PDFDocument from "pdfkit"; // npm i pdfkit
import { sendWatiMessage } from "../utils/wati.js";
import { generateOrderReceiptNumber } from "../utils/orderReceipt.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";
import VoucherRedemption from "../models/voucherRedemptionModel.js";
import RewardCredit from "../models/rewardCreditModel.js";
import PromoSettings from "../models/promoSettingsModel.js";
import awardPaidOrderPoints from "../services/rewardService.js";

const sendOrderNotifications = async (notifications) => {
  const results = await Promise.allSettled(notifications);
  results.filter((result) => result.status === "rejected")
    .forEach((result) => console.error("Order notification failed:", result.reason));
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
      };
    });

    // Calculate prices
    const prices = calcPrices(dbOrderItems);
    let discountAmount = 0;
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
    } else if (rewardsEnabled && isCustomer) {
      rewardCredit = await RewardCredit.findOne({
        user: req.user._id,
        status: "available",
      }).sort({ createdAt: 1 });
      if (rewardCredit) discountAmount = Math.min(prices.totalPrice, rewardCredit.discountAmount);
    }

    const { itemsPrice, taxPrice, shippingPrice } = prices;
    const totalPrice = Number((prices.totalPrice - discountAmount).toFixed(2));
    const settledByVoucher = totalPrice === 0 && Boolean(voucherRedemption || rewardCredit);
    const paidAt = settledByVoucher ? new Date() : undefined;
    let receiptNumber = null;

    // Fetch shop details
    const shopDoc = await Shop.findById(shop);

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
      isPaid: settledByVoucher,
      paidAt,
      finalPaymentMethod: settledByVoucher ? "ShopLink voucher" : null,
      paymentConfirmation: settledByVoucher
        ? {
          method: "ShopLink voucher",
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
        ? { status: "COMPLETED", method: "ShopLink voucher" }
        : undefined,
      referralVoucher: voucherRedemption || rewardCredit
        ? {
          redemption: voucherRedemption?._id || null,
          rewardCredit: rewardCredit?._id || null,
          discountAmount,
        }
        : undefined,
    });
    if (settledByVoucher) {
      receiptNumber = generateOrderReceiptNumber(order._id, paidAt);
      order.paymentConfirmation.receiptNumber = receiptNumber;
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
        return res.status(409).json({ message: "This reward has already been used. Refresh your cart and try again." });
      }
      reservedRewardCreditId = reservedCredit._id;
    }

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
        message: `Your KES ${discountAmount.toFixed(2)} ShopLink voucher covered this order. Receipt ${receiptNumber}.`,
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
    let filter = {};
    if (!req.user.isSuperAdmin) {
      const shops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      filter.shop = { $in: shops.map((shop) => shop._id) };
    }
    const orders = await Order.find(filter)
      .populate("user", "username email")
      .populate("shop", "name location")
      .populate({
        path: "orderItems.product",
        populate: { path: "shop", select: "name location" },
      });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderFinancialSummary = async (req, res) => {
  try {
    let filter = { isPaid: true };
    if (!req.user.isSuperAdmin) {
      const shops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      filter.shop = { $in: shops.map((shop) => shop._id) };
    }

    const orders = await Order.find(filter).select(
      "itemsPrice taxPrice shippingPrice totalPrice finalPaymentMethod paymentMethod paymentResult checkoutRequestId referralVoucher.discountAmount"
    ).lean();
    const summary = orders.reduce((totals, order) => {
      const method = order.finalPaymentMethod
        || order.paymentResult?.method
        || (order.checkoutRequestId ? "M-Pesa" : null)
        || (/^CASH-/i.test(order.paymentResult?.id || "") ? "Cash" : null)
        || (order.paymentResult?.email_address ? "PayPal" : null)
        || order.paymentMethod
        || "Unclassified";

      const grossAmount = Number(order.itemsPrice || 0)
        + Number(order.taxPrice || 0)
        + Number(order.shippingPrice || 0);
      const discountAmount = Math.min(
        grossAmount,
        Math.max(0, Number(order.referralVoucher?.discountAmount || 0))
      );
      const netRatio = grossAmount > 0 ? (grossAmount - discountAmount) / grossAmount : 0;
      totals.productSales += Number(order.itemsPrice || 0) * netRatio;
      totals.taxCollected += Number(order.taxPrice || 0) * netRatio;
      totals.deliveryFees += Number(order.shippingPrice || 0) * netRatio;
      totals.discountsGiven += discountAmount;
      totals.totalReceived += Number(order.totalPrice || 0);
      totals.paymentMethods[method] = totals.paymentMethods[method] || { orderCount: 0, amount: 0 };
      totals.paymentMethods[method].orderCount += 1;
      totals.paymentMethods[method].amount += Number(order.totalPrice || 0);
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
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    let filter = {};
    if (!req.user.isSuperAdmin) {
      const shops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      filter.shop = { $in: shops.map((shop) => shop._id) };
    }
    const totalOrders = await Order.countDocuments(filter);
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    let filter = {};
    if (!req.user.isSuperAdmin) {
      const shops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      filter.shop = { $in: shops.map((shop) => shop._id) };
    }
    filter.isPaid = true;
    const orders = await Order.find(filter).select("totalPrice");
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
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

    const order = await Order.findById(req.params.id).populate("shop", "owner name");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user._id.toString();
    const isBuyer = order.user?.toString() === userId;
    const isShopAdmin = Boolean(req.user.isAdmin || req.user.isSuperAdmin)
      && (req.user.isSuperAdmin || order.shop?.owner?.toString() === userId);

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
      settledOrder = await Order.findOneAndUpdate(
        {
          _id: updated._id,
          isPaid: false,
          "paymentConfirmation.method": "Cash",
          "paymentConfirmation.customerConfirmedAt": { $ne: null },
          "paymentConfirmation.shopConfirmedAt": { $ne: null },
        },
        {
          $set: {
            isPaid: true,
            paidAt,
            paymentMethod: "Cash",
            finalPaymentMethod: "Cash",
            "paymentConfirmation.gatewayVerified": false,
            "paymentConfirmation.receiptNumber": receiptNumber,
            "paymentResult.id": receiptNumber,
            "paymentResult.status": "COMPLETED",
            "paymentResult.update_time": paidAt.toISOString(),
            "paymentResult.email_address": "",
            "paymentResult.method": "Cash",
          },
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
    if (settledOrder.shop?.owner) {
      notifications.push(notifyUser(settledOrder.shop.owner, paymentNotice));
    }
    await sendOrderNotifications(notifications);
    res.json(settledOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSalesByDate = async (req, res) => {
  try {
    const match = { isPaid: true };
    if (!req.user.isSuperAdmin) {
      const shops = await Shop.find({ owner: req.user._id }).select("_id").lean();
      match.shop = { $in: shops.map((shop) => shop._id) };
    }
    const salesByDate = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          totalSales: { $sum: "$totalPrice" },
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
      .populate("shop", "name location owner");

    if (order) {
      if (
        req.user
        && !req.user.isSuperAdmin
        && order.shop?.owner?.toString() !== req.user._id.toString()
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

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, isPaid: false, "paymentConfirmation.method": { $ne: "Cash" } },
      {
        $set: {
          isPaid: true,
          paidAt,
          paymentMethod: "PayPal",
          finalPaymentMethod: "PayPal",
          paymentConfirmation,
          paymentResult,
        },
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

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("shop", "owner");

    if (order) {
      if (
        !req.user.isSuperAdmin
        && order.shop?.owner?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "You can only manage delivery for your own shop" });
      }
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      if (order.user) {
        await sendOrderNotifications([notifyUser(order.user, {
          type: "order",
          title: "Order delivered",
          message: `Your order ${order._id} has been marked as delivered.`,
          link: `/order/${order._id}`,
        })]);
      }
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  markOrderAsDelivered,
  getReceipt,
};
