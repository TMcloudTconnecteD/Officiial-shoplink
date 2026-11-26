import { randomBytes } from "crypto";
import Order from "../models/orderModel.js";
import PromoSettings from "../models/promoSettingsModel.js";
import Referral from "../models/referralModel.js";
import RewardCredit from "../models/rewardCreditModel.js";
import User from "../models/userModel.js";
import VoucherRedemption from "../models/voucherRedemptionModel.js";
import { notifyUser } from "./notificationBadgeService.js";

const POINTS_PER_REWARD = 1000;
const REWARD_DISCOUNT_KES = 100;
const randomCode = () => randomBytes(5).toString("hex").toUpperCase();

const issueAutomaticRewardCredits = async (userId) => {
  const settings = await PromoSettings.findOne({ key: "global" }).select("rewardProgramEnabled").lean();
  if (settings?.rewardProgramEnabled === false) return [];

  const credits = [];
  while (true) {
    const user = await User.findOneAndUpdate(
      { _id: userId, pointsBalance: { $gte: POINTS_PER_REWARD } },
      { $inc: { pointsBalance: -POINTS_PER_REWARD, pointsVouchersIssued: 1 } },
      { new: true, projection: { pointsVouchersIssued: 1 } }
    );
    if (!user) break;

    try {
      const credit = await RewardCredit.create({
        user: userId,
        sequence: user.pointsVouchersIssued,
        code: `SL100-${randomCode()}`,
        pointsSpent: POINTS_PER_REWARD,
        discountAmount: REWARD_DISCOUNT_KES,
      });
      credits.push(credit);
    } catch (error) {
      await User.updateOne(
        { _id: userId },
        { $inc: { pointsBalance: POINTS_PER_REWARD } }
      );
      throw error;
    }
  }

  if (credits.length) {
    try {
      await notifyUser(userId, {
        type: "reward",
        title: "KES 100 reward unlocked",
        message: "Your points automatically unlocked a KES 100 discount for your next ShopLink order. Find its code in Student Friendly.",
        link: "/student-friendly",
      });
    } catch (error) {
      console.error("Could not send automatic reward notification:", error.message);
    }
  }
  return credits;
};

const awardPaidOrderPoints = async (order) => {
  if (!order?.isPaid) return;

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

  const claimed = await Order.findOneAndUpdate(
    {
      _id: order._id,
      isPaid: true,
      $or: [{ pointsAwardedAt: null }, { pointsAwardedAt: { $exists: false } }],
    },
    { $set: { pointsAwardedAt: new Date() } },
    { new: false }
  );
  if (!claimed) return;

  await User.updateOne({ _id: order.user }, { $inc: { pointsBalance: 10 } });
  await issueAutomaticRewardCredits(order.user);
  const notices = [notifyUser(order.user, {
    type: "reward",
    title: "10 ShopLink points earned",
    message: "Your paid order earned 10 points. View your rewards balance.",
    link: "/student-friendly",
  })];

  const referral = await Referral.findOneAndUpdate(
    { referredUser: order.user, status: "pending" },
    { $set: { status: "converted", successfulOrder: order._id, rewardedAt: new Date() } },
    { new: true }
  );
  if (referral) {
    await User.updateOne({ _id: referral.referrer }, { $inc: { pointsBalance: 100 } });
    await issueAutomaticRewardCredits(referral.referrer);
    notices.push(notifyUser(referral.referrer, {
      type: "referral",
      title: "Referral reward earned",
      message: "Your friend completed their first paid order. 100 points were added to your balance.",
      link: "/student-friendly",
    }));
  }

  const notificationResults = await Promise.allSettled(notices);
  notificationResults
    .filter((result) => result.status === "rejected")
    .forEach((result) => console.error("Could not send rewards notification:", result.reason));
};

export default awardPaidOrderPoints;
export { issueAutomaticRewardCredits };
