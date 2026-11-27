import mongoose from "mongoose";

const mallVisitSchema = new mongoose.Schema({
  mall: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  visitorKey: { type: String, required: true },
  weekStart: { type: Date, required: true },
}, { timestamps: true });

mallVisitSchema.index({ mall: 1, visitorKey: 1, weekStart: 1 }, { unique: true });
mallVisitSchema.index({ weekStart: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.model("MallVisit", mallVisitSchema);
