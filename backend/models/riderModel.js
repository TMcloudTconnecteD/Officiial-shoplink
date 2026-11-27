import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    vehicleType: { type: String, required: true, enum: ["Motorbike", "Bicycle", "On foot"] },
    plateNumber: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    suspensionReason: { type: String, trim: true, default: "" },
    appealStatus: {
      type: String,
      enum: ["none", "pending", "accepted", "rejected"],
      default: "none",
      index: true,
    },
    appealMessage: { type: String, trim: true, default: "" },
    appealedAt: { type: Date, default: null },
    appealReviewedAt: { type: Date, default: null },
    appealReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    appealDecision: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Rider", riderSchema);
