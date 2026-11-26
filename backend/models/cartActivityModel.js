import mongoose from "mongoose";

const cartActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  itemCount: { type: Number, required: true, min: 0, default: 0 },
  cartUpdatedAt: { type: Date, required: true, default: Date.now },
  lastNudgeDate: { type: String, default: null },
}, { timestamps: true });

const CartActivity = mongoose.model("CartActivity", cartActivitySchema);
export default CartActivity;
