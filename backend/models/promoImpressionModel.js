import mongoose from "mongoose";

const promoImpressionSchema = new mongoose.Schema({
  module: {
    type: String,
    enum: ["freshDrops", "welcomeToast", "trendingNow", "cartNudge", "referralRibbon", "sellerSpotlight", "postOrderDelight"],
    required: true,
    index: true,
  },
  event: { type: String, enum: ["impression", "click"], required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const PromoImpression = mongoose.model("PromoImpression", promoImpressionSchema);
export default PromoImpression;
