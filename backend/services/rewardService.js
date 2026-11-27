import Order from "../models/orderModel.js";
import PointsTransaction from "../models/pointsTransactionModel.js";
import Referral from "../models/referralModel.js";
import RewardCredit from "../models/rewardCreditModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import VoucherRedemption from "../models/voucherRedemptionModel.js";
import { notifyUser } from "./notificationBadgeService.js";

const addPoints = async ({ userId, points, orderId = null, type = "earned", referenceKey, description }) => {
  if (!userId || !Number.isInteger(points) || points <= 0) return false;
  let transaction;
  try {
    transaction = await PointsTransaction.create({
      user: userId,
      order: orderId,
      type,
      points,
      referenceKey,
      description,
    });
  } catch (error) {
    if (error.code === 11000) return false;
    throw error;
  }

  const delta = type === "spent" ? -points : points;
  const increments = { pointsBalance: delta };
  if (type === "earned") increments.lifetimePointsEarned = points;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, ...(delta < 0 ? { pointsBalance: { $gte: points } } : {}) },
      { $inc: increments },
      { new: true }
    );
    if (!updatedUser) {
      await PointsTransaction.deleteOne({ _id: transaction._id });
      if (delta < 0) throw new Error("Not enough reward points are available for this order.");
      throw new Error("The points owner account could not be updated.");
    }
    return true;
  } catch (error) {
    if (error.code !== 11000) await PointsTransaction.deleteOne({ _id: transaction._id });
    throw error;
  }
};

const releaseReservedPoints = async (userId, points) => {
  if (!userId || !Number.isInteger(points) || points <= 0) return;
  const result = await User.updateOne(
    { _id: userId, pointsReserved: { $gte: points } },
    { $inc: { pointsReserved: -points } }
  );
  if (!result.modifiedCount) {
    throw new Error("Could not release the reserved reward points.");
  }
};

const redeemOrderPoints = async (order) => {
  const points = Number(order?.rewardRedemption?.pointsReserved || 0);
  if (!order?.isPaid || !order.user || points <= 0 || order.rewardRedemption?.redeemedAt) return;

  const redeemedAt = new Date();
  const claimed = await Order.findOneAndUpdate(
    {
      _id: order._id,
      isPaid: true,
      "rewardRedemption.pointsReserved": points,
      $or: [
        { "rewardRedemption.redeemedAt": null },
        { "rewardRedemption.redeemedAt": { $exists: false } },
      ],
    },
    { $set: { "rewardRedemption.redeemedAt": redeemedAt, "rewardRedemption.pointsRedeemed": points } },
    { new: false }
  );
  if (!claimed) return;

  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: order.user,
        pointsBalance: { $gte: points },
        pointsReserved: { $gte: points },
      },
      { $inc: { pointsBalance: -points, pointsReserved: -points } },
      { new: true }
    );
    if (!updatedUser) throw new Error("The reserved reward points are no longer available.");
    await PointsTransaction.create({
      user: order.user,
      order: order._id,
      type: "spent",
      points,
      referenceKey: `order-spend:${order._id}`,
      description: `Used ${points} points on order ${order._id}.`,
    });
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, "rewardRedemption.redeemedAt": redeemedAt },
      { $set: { "rewardRedemption.redeemedAt": null, "rewardRedemption.pointsRedeemed": 0 } }
    );
    if (error.code !== 11000) {
      await User.updateOne(
        { _id: order.user },
        { $inc: { pointsBalance: points, pointsReserved: points } }
      );
      throw error;
    }
  }
};

const awardShopOwnerReceiptPoints = async (order, shopId = null) => {
  const points = 10;
  const fulfillments = order?.shopFulfillments || [];
  if (fulfillments.length > 0) {
    const fulfillment = fulfillments.find(
      (entry) => shopId && String(entry.shop?._id || entry.shop) === String(shopId)
    ) || (!shopId && fulfillments.length === 1 ? fulfillments[0] : null);
    if (!fulfillment?.receiptConfirmedAt) return false;
    const fulfillmentShopId = fulfillment.shop?._id || fulfillment.shop;
    const shop = fulfillment.shop?.owner
      ? fulfillment.shop
      : await Shop.findById(fulfillmentShopId).select("owner name");
    const ownerId = shop?.owner?._id || shop?.owner;
    if (!ownerId) return false;
    const awarded = await addPoints({
      userId: ownerId,
      points,
      orderId: order._id,
      referenceKey: `shop-receipt:${order._id}:${fulfillmentShopId}`,
      description: `Earned ${points} shop loyalty points for receipt-confirmed order ${order._id} at ${shop.name || "your shop"}.`,
    });
    await Order.updateOne(
      { _id: order._id, "shopFulfillments.shop": fulfillmentShopId },
      {
        $set: {
          "shopFulfillments.$.sellerLoyaltyPointsAwarded": points,
          "shopFulfillments.$.sellerLoyaltyPointsAwardedAt": fulfillment.receiptConfirmedAt,
        },
      }
    );
    return awarded;
  }

  if (!order?.receiptConfirmedAt) return false;
  const ownerId = order?.shop?.owner?._id || order?.shop?.owner;
  if (!ownerId) return false;
  const awarded = await addPoints({
    userId: ownerId,
    points,
    orderId: order._id,
    referenceKey: `shop-receipt:${order._id}`,
    description: `Earned ${points} shop loyalty points for receipt-confirmed order ${order._id}.`,
  });
  await Order.updateOne(
    { _id: order._id, receiptConfirmedAt: { $ne: null } },
    {
      $set: {
        sellerLoyaltyPointsAwarded: points,
        sellerLoyaltyPointsAwardedAt: order.receiptConfirmedAt,
      },
    }
  );
  return awarded;
};

const awardMallCartBonus = async (order) => {
  const eligibility = order?.mallBonusEligibility;
  if (!order?.receiptConfirmedAt || !order.user || !eligibility?.eligible || eligibility.shops?.length < 2) return false;

  const claimTime = new Date();
  const claimed = await Order.findOneAndUpdate(
    {
      _id: order._id,
      receiptConfirmedAt: { $ne: null },
      $or: [
        { mallBonusPointsAwardedAt: null },
        { mallBonusPointsAwardedAt: { $exists: false } },
      ],
    },
    { $set: { mallBonusPointsAwardedAt: claimTime } },
    { new: false }
  );
  if (!claimed) return false;

  try {
    await addPoints({
      userId: order.user,
      points: 50,
      orderId: order._id,
      referenceKey: `mall-cart-bonus:${order._id}`,
      description: `Earned 50 bonus points for a receipt-confirmed order from multiple shops in mall ${eligibility.mall}.`,
    });
    await notifyUser(order.user, {
      type: "reward",
      title: "Mall shopping bonus earned",
      message: "You earned 50 bonus points for shopping from multiple shops in one mall.",
      link: "/my-rewards",
    });
    return true;
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, mallBonusPointsAwardedAt: claimTime },
      { $set: { mallBonusPointsAwardedAt: null } }
    );
    throw error;
  }
};

const refundOrderPoints = async (order, refundReference) => {
  const points = Number(order?.rewardRedemption?.pointsRedeemed || 0);
  if (!order?.user || points <= 0) return false;
  const alreadyClaimed = Boolean(order.rewardRedemption?.refundedAt);
  const refundedAt = new Date();
  let claimTimestamp = order.rewardRedemption?.refundedAt;
  if (!alreadyClaimed) {
    const claimed = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "rewardRedemption.pointsRedeemed": points,
        $or: [
          { "rewardRedemption.refundedAt": null },
          { "rewardRedemption.refundedAt": { $exists: false } },
        ],
      },
      {
        $set: {
          "rewardRedemption.refundedAt": refundedAt,
          "rewardRedemption.refundReference": refundReference,
        },
      },
      { new: false }
    );
    if (!claimed) return false;
    claimTimestamp = refundedAt;
  } else if (await PointsTransaction.exists({ referenceKey: `order-refund:${order._id}` })) {
    return false;
  }

  try {
    await addPoints({
      userId: order.user,
      points,
      orderId: order._id,
      type: "refunded",
      referenceKey: `order-refund:${order._id}`,
      description: `Refunded ${points} reward points for order ${order._id}.`,
    });
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, "rewardRedemption.refundedAt": claimTimestamp },
      { $set: { "rewardRedemption.refundedAt": null, "rewardRedemption.refundReference": null } }
    );
    throw error;
  }
  return true;
};

const awardPaidOrderPoints = async (order) => {
  if (!order?.isPaid) return;

  await redeemOrderPoints(order);

  if (order.referralVoucher?.rewardCredit) {
    await RewardCredit.updateOne(
      { _id: order.referralVoucher.rewardCredit, status: "reserved", order: order._id },
      { $set: { status: "redeemed", redeemedAt: new Date() } }
    );
  }
  if (order.referralVoucher?.redemption) {
    await VoucherRedemption.updateOne(
      { _id: order.referralVoucher.redemption, status: "reserved", order: order._id },
      { $set: { status: "redeemed", redeemedAt: new Date() } }
    );
  }
  if (!order.user) return;

  const notices = [];
  const customerPointsEarned = order.pointsAwardedAt ? false : await addPoints({
    userId: order.user,
    points: 10,
    orderId: order._id,
    referenceKey: `customer-order:${order._id}`,
    description: `Earned 10 customer points for paid order ${order._id}.`,
  });
  if (!order.pointsAwardedAt) {
    await Order.updateOne({ _id: order._id }, { $set: { pointsAwardedAt: new Date() } });
  }
  if (customerPointsEarned) {
    notices.push(notifyUser(order.user, {
      type: "reward",
      title: "10 ShopLink points earned",
      message: "Your paid order earned 10 points. View your rewards balance.",
      link: "/my-rewards",
    }));
  }

  const referral = await Referral.findOneAndUpdate(
    { referredUser: order.user, status: "pending" },
    { $set: { status: "converted", successfulOrder: order._id, rewardedAt: new Date() } },
    { new: true }
  );
  if (referral) {
    const referralPointsEarned = await addPoints({
      userId: referral.referrer,
      points: 100,
      orderId: order._id,
      referenceKey: `referral:${referral._id}`,
      description: `Earned 100 referral points for order ${order._id}.`,
    });
    if (referralPointsEarned) {
      notices.push(notifyUser(referral.referrer, {
        type: "referral",
        title: "Referral reward earned",
        message: "Your friend completed their first paid order. 100 points were added to your balance.",
        link: "/my-rewards",
      }));
    }
  }

  const notificationResults = await Promise.allSettled(notices);
  notificationResults
    .filter((result) => result.status === "rejected")
    .forEach((result) => console.error("Could not send rewards notification:", result.reason));
};

export default awardPaidOrderPoints;
export { awardMallCartBonus, awardShopOwnerReceiptPoints, refundOrderPoints, releaseReservedPoints };
