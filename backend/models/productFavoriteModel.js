import mongoose from "mongoose";

const productFavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true });

productFavoriteSchema.index({ user: 1, product: 1 }, { unique: true });
productFavoriteSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("ProductFavorite", productFavoriteSchema);
