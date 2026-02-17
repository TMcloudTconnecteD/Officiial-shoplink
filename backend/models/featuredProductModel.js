import mongoose from "mongoose";

const featuredProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    section: {
      type: String,
      enum: ["homepage", "category", "trending", "new", "sale"],
      default: "homepage",
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    impressionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "featuredproducts",
  }
);

// Index for efficient queries
featuredProductSchema.index({ isFeatured: 1, priority: -1 });
featuredProductSchema.index({ section: 1, isFeatured: 1 });
featuredProductSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("FeaturedProduct", featuredProductSchema);
