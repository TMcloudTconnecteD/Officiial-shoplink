import mongoose from "mongoose";

const shopStatsSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProductsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    monthlyStats: [
      {
        month: String,
        revenue: Number,
        orders: Number,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
    collection: "shopstats",
  }
);

// Index for efficient queries
shopStatsSchema.index({ totalRevenue: -1 });
shopStatsSchema.index({ totalOrders: -1 });
shopStatsSchema.index({ averageRating: -1 });

export default mongoose.model("ShopStats", shopStatsSchema);
