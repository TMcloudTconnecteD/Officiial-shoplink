import mongoose from "mongoose";

const rewardCreditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sequence: { type: Number, required: true, min: 1 },
  code: { type: String, required: true, unique: true, uppercase: true },
  pointsSpent: { type: Number, required: true, default: 1000 },
  discountAmount: { type: Number, required: true, default: 100 },
  status: { type: String, enum: ["available", "disabled", "reserved", "redeemed"], default: "available", index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  redeemedAt: { type: Date, default: null },
}, { timestamps: true });

rewardCreditSchema.index({ user: 1, sequence: 1 }, { unique: true });

const RewardCredit = mongoose.model("RewardCredit", rewardCreditSchema);
export default RewardCredit;
