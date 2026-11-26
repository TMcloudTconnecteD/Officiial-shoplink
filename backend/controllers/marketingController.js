import { randomBytes } from "crypto";
import asyncHandler from "../middlewares/asyncHandler.js";
import CartActivity from "../models/cartActivityModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import PromoImpression from "../models/promoImpressionModel.js";
import PromoSettings from "../models/promoSettingsModel.js";
import Referral from "../models/referralModel.js";
import RewardCredit from "../models/rewardCreditModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import VoucherRedemption from "../models/voucherRedemptionModel.js";
import { notifyUser } from "../services/notificationBadgeService.js";
import { issueAutomaticRewardCredits } from "../services/rewardService.js";

const MODULES = [
  "freshDrops",
  "welcomeToast",
  "trendingNow",
  "cartNudge",
  "referralRibbon",
  "sellerSpotlight",
  "postOrderDelight",
];
const getSettings = () => PromoSettings.findOneAndUpdate(
  { key: "global" },
  { $setOnInsert: { key: "global" } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
).populate("featuredShop", "name image location").populate("featuredProduct", "name image price shop");
const startOfUtcDay = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const getPublicPromoSettings = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json({ modules: settings.modules, rewardProgramEnabled: settings.rewardProgramEnabled });
});

const getFreshDrops = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const products = await Product.find({ createdAt: { $gte: since }, inStock: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(16)
    .populate("shop", "name location")
    .lean();
  res.json(products);
});

const getFeaturedProducts = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  const featuredId = settings.featuredProduct?._id;
  const products = await Product.find({
    inStock: { $gt: 0 },
    $or: [
      { isPromoFeatured: true },
      ...(featuredId ? [{ _id: featuredId }] : []),
    ],
  })
    .sort({ isPromoFeatured: -1, createdAt: -1 })
    .limit(8)
    .populate("shop", "name")
    .lean();
  res.json(products);
});

const getTrendingProducts = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const products = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: since } } },
    { $unwind: "$orderItems" },
    { $group: { _id: "$orderItems.product", orderCount: { $sum: 1 }, unitsSold: { $sum: "$orderItems.qty" } } },
    { $sort: { orderCount: -1, unitsSold: -1 } },
    { $limit: 8 },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $match: { "product.inStock": { $gt: 0 } } },
    { $lookup: { from: "shops", localField: "product.shop", foreignField: "_id", as: "shop" } },
    { $unwind: { path: "$shop", preserveNullAndEmptyArrays: true } },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$product", { orderCount: "$orderCount", unitsSold: "$unitsSold", shop: "$shop" }] } } },
  ]);
  res.json(products);
});

const getSellerSpotlight = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  let shop = settings.featuredShop;
  if (!shop) {
    const shops = await Shop.find({}).sort({ _id: 1 }).lean();
    if (!shops.length) return res.json(null);
    const dayIndex = Math.floor(startOfUtcDay().getTime() / 86400000);
    shop = shops[dayIndex % shops.length];
  }
  const productCount = await Product.countDocuments({ shop: shop._id });
  const spotlight = typeof shop.toObject === "function" ? shop.toObject() : shop;
  res.json({ ...spotlight, productCount });
});

const getWelcomeToast = asyncHandler(async (req, res) => {
  if (req.user.isAdmin || req.user.isSuperAdmin) return res.json({ show: false });
  const settings = await getSettings();
  if (!settings.modules?.welcomeToast) return res.json({ show: false });
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const shopCount = await Product.distinct("shop", { createdAt: { $gte: since } });
  const start = startOfUtcDay();
  const user = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      $or: [{ welcomeToastShownAt: null }, { welcomeToastShownAt: { $lt: start } }],
    },
    { $set: { welcomeToastShownAt: new Date() } },
    { new: true, projection: { username: 1 } }
  );
  if (!user) return res.json({ show: false });
  res.json({ show: true, name: user.username, shopCount: shopCount.length });
});

const logPromoEvent = asyncHandler(async (req, res) => {
  const { module, event, shop, product } = req.body || {};
  if (!MODULES.includes(module) || !["impression", "click"].includes(event)) {
    return res.status(400).json({ message: "Invalid promotion event." });
  }
  const settings = await getSettings();
  if (!settings.modules?.[module]) return res.status(204).end();
  await PromoImpression.create({
    module,
    event,
    user: req.user?._id || null,
    shop: shop || null,
    product: product || null,
  });
  res.status(202).json({ recorded: true });
});

const updateCartActivity = asyncHandler(async (req, res) => {
  if (req.user.isAdmin || req.user.isSuperAdmin) return res.status(403).json({ message: "Cart reminders are for customer accounts." });
  const itemCount = Number(req.body?.itemCount);
  if (!Number.isInteger(itemCount) || itemCount < 0 || itemCount > 500) {
    return res.status(400).json({ message: "Cart item count must be between 0 and 500." });
  }
  if (itemCount === 0) {
    await CartActivity.deleteOne({ user: req.user._id });
    return res.json({ active: false, itemCount: 0 });
  }
  const activity = await CartActivity.findOneAndUpdate(
    { user: req.user._id },
    { $set: { itemCount, cartUpdatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ active: true, itemCount: activity.itemCount, cartUpdatedAt: activity.cartUpdatedAt });
});

const getCartNudgeStatus = asyncHandler(async (req, res) => {
  if (req.user.isAdmin || req.user.isSuperAdmin) return res.json({ show: false, itemCount: 0 });
  const activity = await CartActivity.findOne({ user: req.user._id }).lean();
  const today = new Date().toISOString().slice(0, 10);
  const oldEnough = activity && Date.now() - new Date(activity.cartUpdatedAt).getTime() >= 30 * 60 * 1000;
  res.json({
    show: Boolean(oldEnough && activity.lastNudgeDate === today),
    itemCount: oldEnough && activity.lastNudgeDate === today ? activity.itemCount : 0,
  });
});

const getAdminCatalog = asyncHandler(async (req, res) => {
  const shops = req.user.isSuperAdmin
    ? await Shop.find({}).select("name image location").lean()
    : await Shop.find({ owner: req.user._id }).select("name image location").lean();
  const shopIds = shops.map((shop) => shop._id);
  const products = await Product.find(req.user.isSuperAdmin ? {} : { shop: { $in: shopIds } })
    .select("name image price shop isPromoFeatured")
    .sort({ createdAt: -1 })
    .limit(300)
    .populate("shop", "name")
    .lean();
  const settings = await getSettings();
  res.json({
    shops,
    products,
    settings: req.user.isSuperAdmin ? {
      modules: settings.modules,
      rewardProgramEnabled: settings.rewardProgramEnabled,
      featuredShop: settings.featuredShop?._id || null,
      featuredProduct: settings.featuredProduct?._id || null,
    } : null,
  });
});

const updatePromoModules = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Only a super admin can change global promotion settings." });
  const modules = req.body?.modules;
  if (!modules || typeof modules !== "object") return res.status(400).json({ message: "Promotion module settings are required." });
  const update = {};
  for (const module of MODULES) {
    if (typeof modules[module] !== "boolean") {
      return res.status(400).json({ message: `A boolean setting is required for ${module}.` });
    }
    update[`modules.${module}`] = modules[module];
  }
  const settings = await PromoSettings.findOneAndUpdate(
    { key: "global" },
    { $set: update, $setOnInsert: { key: "global" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ modules: settings.modules });
});

const updateRewardProgram = asyncHandler(async (req, res) => {
  if (typeof req.body?.enabled !== "boolean") {
    return res.status(400).json({ message: "Reward program status must be a boolean." });
  }
  const settings = await PromoSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { rewardProgramEnabled: req.body.enabled }, $setOnInsert: { key: "global" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ enabled: settings.rewardProgramEnabled });
});

const getAdminRewardCredits = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Only a super admin can view all reward vouchers." });
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(10, Number.parseInt(req.query.limit, 10) || 25));
  const status = ["available", "disabled", "reserved", "redeemed"].includes(req.query.status)
    ? req.query.status
    : null;
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const userIds = search
    ? await User.find({
      $or: [
        { email: { $regex: escapedSearch, $options: "i" } },
        { username: { $regex: escapedSearch, $options: "i" } },
      ],
    }).distinct("_id")
    : null;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.user = { $in: userIds };
  const [credits, total, statusTotals] = await Promise.all([
    RewardCredit.find(filter)
      .populate("user", "username email")
      .populate("order", "totalPrice paidAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    RewardCredit.countDocuments(filter),
    RewardCredit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  res.json({
    credits,
    total,
    page,
    pages: Math.ceil(total / limit),
    statusTotals: statusTotals.reduce((totals, item) => ({ ...totals, [item._id]: item.count }), {}),
  });
});

const updateRewardCreditStatus = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Only a super admin can disable reward vouchers." });
  const { enabled } = req.body || {};
  if (typeof enabled !== "boolean") return res.status(400).json({ message: "Voucher enabled status must be a boolean." });
  const credit = await RewardCredit.findOneAndUpdate(
    { _id: req.params.creditId, status: enabled ? "disabled" : "available" },
    { $set: { status: enabled ? "available" : "disabled" } },
    { new: true }
  ).populate("user", "username email");
  if (!credit) return res.status(409).json({ message: "Only unused available vouchers can be enabled or disabled." });
  res.json({ credit });
});

const updateFeaturedSlot = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Only a super admin can set global featured items." });
  const { shopId = null, productId = null } = req.body || {};
  if ((shopId && !/^[a-f\d]{24}$/i.test(String(shopId))) || (productId && !/^[a-f\d]{24}$/i.test(String(productId)))) {
    return res.status(400).json({ message: "Featured items must use valid shop and product IDs." });
  }
  if (shopId && !(await Shop.exists({ _id: shopId }))) return res.status(404).json({ message: "Shop not found." });
  if (productId && !(await Product.exists({ _id: productId }))) return res.status(404).json({ message: "Product not found." });
  const settings = await PromoSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { featuredShop: shopId, featuredProduct: productId }, $setOnInsert: { key: "global" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("featuredShop", "name image location").populate("featuredProduct", "name image price shop");
  res.json({ featuredShop: settings.featuredShop, featuredProduct: settings.featuredProduct });
});

const toggleProductFeature = asyncHandler(async (req, res) => {
  if (typeof req.body?.featured !== "boolean") {
    return res.status(400).json({ message: "Featured status must be a boolean." });
  }
  const product = await Product.findById(req.params.productId).populate("shop", "owner");
  if (!product) return res.status(404).json({ message: "Product not found." });
  if (!req.user.isSuperAdmin && product.shop?.owner?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only feature products from your own shop." });
  }
  product.isPromoFeatured = Boolean(req.body?.featured);
  await product.save();
  res.json({ productId: product._id, featured: product.isPromoFeatured });
});

const getPromoAnalytics = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Promotion analytics are available to the super admin only." });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const analytics = await PromoImpression.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { module: "$module", event: "$event" }, count: { $sum: 1 } } },
    { $project: { _id: 0, module: "$_id.module", event: "$_id.event", count: 1 } },
  ]);
  res.json(analytics);
});

const getRewards = asyncHandler(async (req, res) => {
  if (req.user.isAdmin || req.user.isSuperAdmin) return res.status(403).json({ message: "Rewards are available to customer accounts." });
  await issueAutomaticRewardCredits(req.user._id);
  const [user, settings] = await Promise.all([
    User.findById(req.user._id).select("referralCode pointsBalance username email"),
    PromoSettings.findOne({ key: "global" }).select("rewardProgramEnabled").lean(),
  ]);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (!user.referralCode) {
    user.referralCode = randomBytes(5).toString("hex").toUpperCase();
    await user.save();
  }
  const [referrals, redemptions, rewardCredits] = await Promise.all([
    Referral.find({ referrer: req.user._id }).populate("referredUser", "username").sort({ createdAt: -1 }).limit(50).lean(),
    VoucherRedemption.find({ user: req.user._id }).populate("voucher", "title description discountType discountValue").sort({ createdAt: -1 }).limit(50).lean(),
    RewardCredit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  res.json({
    user: { username: user.username, email: user.email, referralCode: user.referralCode, pointsBalance: user.pointsBalance || 0 },
    rewardProgramEnabled: settings?.rewardProgramEnabled !== false,
    referrals,
    redemptions,
    rewardCredits,
  });
});

const getAllReferrals = asyncHandler(async (req, res) => {
  if (!req.user.isSuperAdmin) return res.status(403).json({ message: "Only the super admin can view all referrals." });
  const [referrals, totals] = await Promise.all([
    Referral.find({}).populate("referrer", "username email").populate("referredUser", "username email").populate("successfulOrder", "totalPrice paidAt").sort({ createdAt: -1 }).limit(500).lean(),
    Referral.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  res.json({ referrals, totals });
});

const updateCartNudges = async () => {
  const settings = await getSettings();
  if (!settings.modules?.cartNudge) return;
  const today = new Date().toISOString().slice(0, 10);
  const staleAt = new Date(Date.now() - 30 * 60 * 1000);
  const eligible = await CartActivity.find({
    itemCount: { $gt: 0 },
    cartUpdatedAt: { $lte: staleAt },
    $or: [{ lastNudgeDate: null }, { lastNudgeDate: { $ne: today } }],
  }).select("_id user itemCount").limit(200).lean();

  for (const activity of eligible) {
    const claimed = await CartActivity.findOneAndUpdate(
      {
        _id: activity._id,
        itemCount: { $gt: 0 },
        cartUpdatedAt: { $lte: staleAt },
        $or: [{ lastNudgeDate: null }, { lastNudgeDate: { $ne: today } }],
      },
      { $set: { lastNudgeDate: today } },
      { new: true }
    );
    if (!claimed) continue;
    try {
      await notifyUser(activity.user, {
        type: "cart",
        title: "Your items miss you",
        message: "Your items miss you — checkout takes 2 minutes.",
        link: "/cart",
      });
    } catch (error) {
      console.error("Could not send cart reminder:", error.message);
      await CartActivity.updateOne({ _id: activity._id, lastNudgeDate: today }, { $set: { lastNudgeDate: null } });
    }
  }
};

const startCartNudgeWorker = () => {
  const timer = setInterval(() => {
    updateCartNudges().catch((error) => console.error("Cart nudge worker failed:", error.message));
  }, 5 * 60 * 1000);
  timer.unref?.();
  updateCartNudges().catch((error) => console.error("Initial cart nudge check failed:", error.message));
};

export {
  getPublicPromoSettings,
  getFreshDrops,
  getFeaturedProducts,
  getTrendingProducts,
  getSellerSpotlight,
  getWelcomeToast,
  logPromoEvent,
  updateCartActivity,
  getCartNudgeStatus,
  getAdminCatalog,
  getAdminRewardCredits,
  updatePromoModules,
  updateRewardProgram,
  updateRewardCreditStatus,
  updateFeaturedSlot,
  toggleProductFeature,
  getPromoAnalytics,
  getRewards,
  getAllReferrals,
  startCartNudgeWorker,
};
