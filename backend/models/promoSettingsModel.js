import mongoose from "mongoose";

const moduleSwitchSchema = new mongoose.Schema({
  freshDrops: { type: Boolean, default: true },
  welcomeToast: { type: Boolean, default: true },
  trendingNow: { type: Boolean, default: true },
  cartNudge: { type: Boolean, default: true },
  referralRibbon: { type: Boolean, default: true },
  sellerSpotlight: { type: Boolean, default: true },
  postOrderDelight: { type: Boolean, default: true },
}, { _id: false });

const promoSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  modules: { type: moduleSwitchSchema, default: () => ({}) },
  rewardProgramEnabled: { type: Boolean, default: true },
  featuredShop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
  featuredProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
}, { timestamps: true });

const PromoSettings = mongoose.model("PromoSettings", promoSettingsSchema);
export default PromoSettings;
