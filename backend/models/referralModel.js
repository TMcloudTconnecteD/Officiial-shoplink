import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  code: { type: String, required: true, uppercase: true, trim: true, index: true },
  status: { type: String, enum: ["pending", "converted"], default: "pending", index: true },
  successfulOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  rewardedAt: { type: Date, default: null },
}, { timestamps: true });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
