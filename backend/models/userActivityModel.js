import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastLogout: {
      type: Date,
    },
    productsViewed: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        viewedAt: Date,
      },
    ],
    cartAdds: {
      type: Number,
      default: 0,
      min: 0,
    },
    ordersPlaced: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "useractivities",
  }
);

// Index for efficient queries
userActivitySchema.index({ lastLogin: -1 });
userActivitySchema.index({ lastActivityDate: -1 });
userActivitySchema.index({ isActive: 1 });

export default mongoose.model("UserActivity", userActivitySchema);
