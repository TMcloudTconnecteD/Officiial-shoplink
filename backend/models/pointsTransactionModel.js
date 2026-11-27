import mongoose from "mongoose";

const pointsTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["earned", "spent", "refunded"], required: true },
  points: { type: Number, required: true, min: 1 },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  referenceKey: { type: String, required: true, unique: true },
  description: { type: String, required: true },
}, { timestamps: true });

pointsTransactionSchema.index({ user: 1, createdAt: -1 });
pointsTransactionSchema.index({ type: 1, createdAt: -1 });

const PointsTransaction = mongoose.model("PointsTransaction", pointsTransactionSchema);
export default PointsTransaction;
