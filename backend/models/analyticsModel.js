import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      unique: true,
      index: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUsers: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalShops: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
      min: 0,
    },
    newOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "analytics",
  }
);

// Automatically delete documents older than 1 year
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model("Analytics", analyticsSchema);
