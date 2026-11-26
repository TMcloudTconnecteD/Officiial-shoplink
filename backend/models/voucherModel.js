import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  description: { type: String, trim: true, maxlength: 300, default: "" },
  pointsCost: { type: Number, required: true, min: 1 },
  discountType: { type: String, enum: ["fixed", "percent"], required: true },
  discountValue: { type: Number, required: true, min: 0.01 },
  active: { type: Boolean, default: true, index: true },
  expiresAt: { type: Date, default: null },
  maxRedemptions: { type: Number, default: null, min: 1 },
  redeemedCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
