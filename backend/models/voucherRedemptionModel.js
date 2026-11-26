import mongoose from "mongoose";

const voucherRedemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  status: { type: String, enum: ["issued", "reserved", "redeemed"], default: "issued", index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  redeemedAt: { type: Date, default: null },
}, { timestamps: true });

const VoucherRedemption = mongoose.model("VoucherRedemption", voucherRedemptionSchema);
export default VoucherRedemption;
