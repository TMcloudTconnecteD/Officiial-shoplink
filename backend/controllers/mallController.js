import asyncHandler from "../middlewares/asyncHandler.js";
import Category from "../models/categoryModel.js";
import MallVisit from "../models/mallVisitModel.js";
import Order from "../models/orderModel.js";
import PointsTransaction from "../models/pointsTransactionModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";

const UNLOCK_POINTS = 5000;
const POINTS_PER_SLOT = 1000;

const getLevelAndSlots = (lifetimePointsEarned) => (
  lifetimePointsEarned < UNLOCK_POINTS
    ? { level: 0, slotsAvailable: 0 }
    : {
      level: Math.floor((lifetimePointsEarned - UNLOCK_POINTS) / POINTS_PER_SLOT) + 1,
      slotsAvailable: Math.floor((lifetimePointsEarned - UNLOCK_POINTS) / POINTS_PER_SLOT) + 1,
    }
);

const getLifetimePointsEarned = async (userId) => {
  const legacyUser = await User.collection.findOne(
    { _id: userId, lifetimePointsEarned: { $exists: false } },
    { projection: { _id: 1 } }
  );
  if (legacyUser) {
    const [earned = { points: 0 }] = await PointsTransaction.aggregate([
      { $match: { user: userId, type: "earned" } },
      { $group: { _id: null, points: { $sum: "$points" } } },
    ]);
    await User.updateOne(
      { _id: userId, lifetimePointsEarned: { $exists: false } },
      { $set: { lifetimePointsEarned: earned.points || 0 } }
    );
  }
  const user = await User.findById(userId).select("lifetimePointsEarned").lean();
  return Math.max(0, Number(user?.lifetimePointsEarned || 0));
};

const getWeekStart = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date;
};

const getMallOrderStats = async (shopIds) => {
  if (!shopIds.length) return { orderCountThisWeek: 0, lifetimeOrderCount: 0, totalSales: 0 };
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [stats] = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        $or: [
          { shop: { $in: shopIds } },
          { "shopFulfillments.shop": { $in: shopIds } },
          { "orderItems.shop": { $in: shopIds } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        lifetimeOrderCount: { $sum: 1 },
        orderCountThisWeek: { $sum: { $cond: [{ $gte: ["$createdAt", weekStart] }, 1, 0] } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
  return {
    orderCountThisWeek: stats?.orderCountThisWeek || 0,
    lifetimeOrderCount: stats?.lifetimeOrderCount || 0,
    totalSales: Number((stats?.totalSales || 0).toFixed(2)),
  };
};

const getMostLovedMallId = async () => {
  const mallShops = await Shop.find({ $or: [{ type: "mall" }, { parentMall: { $ne: null } }] })
    .select("_id type parentMall")
    .lean();
  if (!mallShops.length) return null;
  const mallByShop = new Map(mallShops.map((shop) => [
    String(shop._id),
    String(shop.parentMall || shop._id),
  ]));
  const shopOrders = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        $or: [
          { shop: { $in: mallShops.map((shop) => shop._id) } },
          { "shopFulfillments.shop": { $in: mallShops.map((shop) => shop._id) } },
          { "orderItems.shop": { $in: mallShops.map((shop) => shop._id) } },
        ],
      },
    },
    {
      $project: {
        orderShops: {
          $setUnion: [
            {
              $map: {
                input: { $ifNull: ["$shopFulfillments", []] },
                as: "fulfillment",
                in: "$$fulfillment.shop",
              },
            },
            {
              $map: {
                input: { $ifNull: ["$orderItems", []] },
                as: "item",
                in: { $ifNull: ["$$item.shop", "$shop"] },
              },
            },
            ["$shop"],
          ],
        },
      },
    },
    { $unwind: "$orderShops" },
    { $match: { orderShops: { $in: mallShops.map((shop) => shop._id) } } },
    { $group: { _id: "$orderShops", orders: { $addToSet: "$_id" } } },
  ]);
  const ordersByMall = new Map();
  for (const shopOrder of shopOrders) {
    const mallId = mallByShop.get(String(shopOrder._id));
    if (!mallId) continue;
    if (!ordersByMall.has(mallId)) ordersByMall.set(mallId, new Set());
    for (const orderId of shopOrder.orders) ordersByMall.get(mallId).add(String(orderId));
  }
  const top = [...ordersByMall.entries()].sort((a, b) => b[1].size - a[1].size)[0];
  return top ? top[0] : null;
};

const getMallDirectory = asyncHandler(async (_req, res) => {
  const malls = await Shop.find({ type: "mall" })
    .select("name image coverImage description location owner level isFeaturedMall childShops")
    .populate("owner", "username")
    .sort({ isFeaturedMall: -1, createdAt: -1 })
    .lean();

  const directory = await Promise.all(malls.map(async (mall) => {
    const childShopIds = mall.childShops || [];
    const shopIds = [mall._id, ...childShopIds];
    const [stats, productCount, visitsThisWeek] = await Promise.all([
      getMallOrderStats(shopIds),
      Product.countDocuments({ shop: { $in: shopIds } }),
      MallVisit.countDocuments({ mall: mall._id, weekStart: getWeekStart() }),
    ]);
    return {
      ...mall,
      childShopCount: childShopIds.length,
      shopCount: shopIds.length,
      productCount,
      visitsThisWeek,
      ...stats,
    };
  }));
  const mostLoved = [...directory]
    .filter((mall) => mall.lifetimeOrderCount > 0)
    .sort((a, b) => b.lifetimeOrderCount - a.lifetimeOrderCount)[0];
  res.json({ malls: directory, mostLovedMallId: mostLoved?._id || null });
});

const getMallDetails = asyncHandler(async (req, res) => {
  const mall = await Shop.findOne({ _id: req.params.mallId, type: "mall" })
    .populate("owner", "username")
    .populate({ path: "childShops", select: "name image coverImage description location category", populate: { path: "category", select: "name" } })
    .lean();
  if (!mall) return res.status(404).json({ message: "Mall not found." });

  const shops = [mall, ...(mall.childShops || [])];
  const shopIds = shops.map((shop) => shop._id);
  const [stats, productCount, visitsThisWeek, products] = await Promise.all([
    getMallOrderStats(shopIds),
    Product.countDocuments({ shop: { $in: shopIds } }),
    MallVisit.countDocuments({ mall: mall._id, weekStart: getWeekStart() }),
    Product.aggregate([
      { $match: { shop: { $in: shopIds }, inStock: { $gt: 0 } } },
      {
        $setWindowFields: {
          partitionBy: "$shop",
          sortBy: { isPromoFeatured: -1, createdAt: -1, _id: 1 },
          output: { shopRank: { $documentNumber: {} } },
        },
      },
      { $match: { shopRank: { $lte: 12 } } },
      { $sort: { shop: 1, shopRank: 1 } },
      { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { shopRank: 0 } },
    ]),
  ]);

  const productsByShop = new Map(shops.map((shop) => [String(shop._id), []]));
  for (const product of products) {
    const key = String(product.shop);
    const shopProducts = productsByShop.get(key) || [];
    if (shopProducts.length < 12) shopProducts.push(product);
    productsByShop.set(key, shopProducts);
  }
  const shopSections = shops.map((shop) => ({
    ...shop,
    products: productsByShop.get(String(shop._id)) || [],
  }));
  const mostLovedMallId = await getMostLovedMallId();
  res.json({
    ...mall,
    shops: shopSections,
    childShopCount: mall.childShops?.length || 0,
    shopCount: shops.length,
    productCount,
    visitsThisWeek,
    mostLovedMallId,
    featuredProducts: products.filter((product) => product.isPromoFeatured).slice(0, 12),
    ...stats,
  });
});

const recordMallVisit = asyncHandler(async (req, res) => {
  const mall = await Shop.findOne({ _id: req.params.mallId, type: "mall" }).select("_id");
  if (!mall) return res.status(404).json({ message: "Mall not found." });
  const visitorKey = req.user?._id
    ? `user:${req.user._id}`
    : String(req.body?.visitorKey || "").trim();
  if (!visitorKey || visitorKey.length > 120) {
    return res.status(400).json({ message: "A valid visitor key is required." });
  }
  const weekStart = getWeekStart();
  try {
    await MallVisit.updateOne(
      { mall: mall._id, visitorKey, weekStart },
      { $setOnInsert: { mall: mall._id, visitorKey, weekStart } },
      { upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  res.json({ recorded: true });
});

const convertShopToMall = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.shopId);
  if (!shop) return res.status(404).json({ message: "Shop not found." });
  if (!req.user.isSuperAdmin && shop.owner?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only convert a shop you manage." });
  }
  if (shop.type === "mall") return res.json({ mall: shop, alreadyMall: true });
  if (shop.parentMall) return res.status(409).json({ message: "A child shop cannot be converted into a nested mall." });

  const lifetimePointsEarned = await getLifetimePointsEarned(shop.owner);
  if (lifetimePointsEarned < UNLOCK_POINTS && !req.user.isSuperAdmin) {
    return res.status(403).json({ message: `Earn ${UNLOCK_POINTS.toLocaleString()} lifetime points to unlock your mall.` });
  }
  const { level } = getLevelAndSlots(lifetimePointsEarned);
  shop.type = "mall";
  shop.parentMall = null;
  shop.childShops = [];
  shop.level = level;
  await shop.save();
  res.json({ mall: shop, lifetimePointsEarned, slotsAvailable: level });
});

const getMallProgress = asyncHandler(async (req, res) => {
  const lifetimePointsEarned = await getLifetimePointsEarned(req.user._id);
  const shops = await Shop.find({ owner: req.user._id })
    .select("name image coverImage location type parentMall childShops level")
    .populate({ path: "childShops", select: "name image location category", populate: { path: "category", select: "name" } })
    .sort({ createdAt: 1 })
    .lean();
  const mall = shops.find((shop) => shop.type === "mall") || null;
  const sourceShop = shops.find((shop) => shop.type !== "mall" && !shop.parentMall) || null;
  const { level, slotsAvailable } = getLevelAndSlots(lifetimePointsEarned);
  if (mall && mall.level !== level) {
    await Shop.updateOne({ _id: mall._id }, { $set: { level } });
  }
  res.json({
    lifetimePointsEarned,
    milestonePoints: UNLOCK_POINTS,
    pointsToUnlock: Math.max(0, UNLOCK_POINTS - lifetimePointsEarned),
    level,
    slotsAvailable,
    slotsUsed: mall?.childShops?.length || 0,
    mall,
    sourceShop,
  });
});

const createChildShop = asyncHandler(async (req, res) => {
  const mall = await Shop.findOne({ _id: req.params.mallId, type: "mall" });
  if (!mall) return res.status(404).json({ message: "Mall not found." });
  if (!req.user.isSuperAdmin && mall.owner?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only create shops inside your own mall." });
  }

  const lifetimePointsEarned = await getLifetimePointsEarned(mall.owner);
  const { level, slotsAvailable } = getLevelAndSlots(lifetimePointsEarned);
  mall.level = level;
  if (!req.user.isSuperAdmin && !level) {
    return res.status(403).json({ message: `Earn ${UNLOCK_POINTS.toLocaleString()} lifetime points to unlock your mall.` });
  }
  const usedSlots = mall.childShops?.length || 0;
  if (!req.user.isSuperAdmin && usedSlots >= slotsAvailable) {
    const nextMilestone = UNLOCK_POINTS + (slotsAvailable * POINTS_PER_SLOT);
    return res.status(409).json({
      message: `Your mall has used all ${slotsAvailable} shop slot${slotsAvailable === 1 ? "" : "s"}. Earn ${Math.max(0, nextMilestone - lifetimePointsEarned).toLocaleString()} more lifetime points to unlock another.`,
      slotsAvailable,
      usedSlots,
    });
  }

  const { name, location, telephone, category, image, coverImage = "", description = "" } = req.fields || req.body || {};
  if (!name?.trim() || !location?.trim() || !telephone || !category || !image) {
    return res.status(400).json({ message: "Shop name, location, phone, category, and shop photo are required." });
  }
  if (!/^[a-f\d]{24}$/i.test(String(category))) {
    return res.status(400).json({ message: "Choose a valid shop category." });
  }
  const validCategory = await Category.exists({ _id: category });
  if (!validCategory) return res.status(400).json({ message: "Choose a valid shop category." });
  if (!Number.isFinite(Number(telephone))) {
    return res.status(400).json({ message: "Enter a valid phone number." });
  }

  const child = new Shop({
    name: name.trim(),
    location: location.trim(),
    telephone: Number(telephone),
    category,
    image,
    coverImage,
    description: String(description).trim(),
    owner: mall.owner,
    type: "shop",
    parentMall: mall._id,
  });
  try {
    await child.save();
    const updatedMall = await Shop.findOneAndUpdate(
      {
        _id: mall._id,
        type: "mall",
        ...(req.user.isSuperAdmin ? {} : {
          $expr: {
            $lt: [{ $size: { $ifNull: ["$childShops", []] } }, slotsAvailable],
          },
        }),
      },
      { $addToSet: { childShops: child._id }, $set: { level } },
      { new: true }
    );
    if (!updatedMall) {
      await child.deleteOne();
      return res.status(409).json({
        message: "All unlocked shop slots were just used. Refresh your mall dashboard and try again.",
        slotsAvailable,
        usedSlots,
      });
    }
    res.status(201).json({ shop: child, slotsAvailable, usedSlots: updatedMall.childShops.length });
  } catch (error) {
    if (error.code === 11000) {
      await child.deleteOne();
      return res.status(409).json({ message: "Each shop in your mall needs a different category. Choose a category not already used by another shop in this mall." });
    }
    throw error;
  }
});

const updateMallFeature = asyncHandler(async (req, res) => {
  if (typeof req.body?.featured !== "boolean") {
    return res.status(400).json({ message: "Featured status must be a boolean." });
  }
  if (!/^[a-f\d]{24}$/i.test(String(req.params.mallId))) {
    return res.status(400).json({ message: "Mall ID is invalid." });
  }
  const existingMall = await Shop.exists({ _id: req.params.mallId, type: "mall" });
  if (!existingMall) return res.status(404).json({ message: "Mall not found." });
  if (req.body.featured) {
    await Shop.updateMany(
      { type: "mall", _id: { $ne: req.params.mallId } },
      { $set: { isFeaturedMall: false } }
    );
  }
  const mall = await Shop.findOneAndUpdate(
    { _id: req.params.mallId, type: "mall" },
    { $set: { isFeaturedMall: req.body.featured } },
    { new: true }
  ).select("name isFeaturedMall");
  res.json(mall);
});

const getMallOwnerAnalytics = asyncHandler(async (req, res) => {
  const mall = await Shop.findOne({ _id: req.params.mallId, type: "mall" }).lean();
  if (!mall) return res.status(404).json({ message: "Mall not found." });
  if (!req.user.isSuperAdmin && mall.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only view analytics for your own mall." });
  }
  const children = await Shop.find({ parentMall: mall._id }).select("_id name").lean();
  const shops = [{ _id: mall._id, name: mall.name }, ...children];
  const shopIds = shops.map((shop) => shop._id);
  const [orders, points] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          isPaid: true,
          $or: [
            { shop: { $in: shopIds } },
            { "shopFulfillments.shop": { $in: shopIds } },
            { "orderItems.shop": { $in: shopIds } },
          ],
        },
      },
      {
        $addFields: {
          orderItems: {
            $map: {
              input: { $ifNull: ["$orderItems", []] },
              as: "item",
              in: { $mergeObjects: ["$$item", { shop: { $ifNull: ["$$item.shop", "$shop"] } }] },
            },
          },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: { order: "$_id", shop: "$orderItems.shop" },
          itemSubtotal: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          itemsPrice: { $first: "$itemsPrice" },
          totalPrice: { $first: "$totalPrice" },
        },
      },
      {
        $group: {
          _id: "$_id.shop",
          orderCount: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $gt: ["$itemsPrice", 0] },
                { $multiply: ["$totalPrice", { $divide: ["$itemSubtotal", "$itemsPrice"] }] },
                0,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          $or: [
            { shop: { $in: shopIds }, sellerLoyaltyPointsAwardedAt: { $ne: null } },
            { "shopFulfillments.shop": { $in: shopIds }, "shopFulfillments.sellerLoyaltyPointsAwardedAt": { $ne: null } },
          ],
        },
      },
      { $unwind: { path: "$shopFulfillments", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          shop: { $ifNull: ["$shopFulfillments.shop", "$shop"] },
          points: { $ifNull: ["$shopFulfillments.sellerLoyaltyPointsAwarded", "$sellerLoyaltyPointsAwarded"] },
        },
      },
      { $match: { shop: { $in: shopIds }, points: { $gt: 0 } } },
      { $group: { _id: "$shop", points: { $sum: "$points" } } },
    ]),
  ]);
  const orderMap = new Map(orders.map((entry) => [String(entry._id), entry]));
  const pointsMap = new Map(points.map((entry) => [String(entry._id), entry.points]));
  res.json({
    mall: { _id: mall._id, name: mall.name, level: mall.level || 0 },
    shops: shops.map((shop) => ({
      ...shop,
      orderCount: orderMap.get(String(shop._id))?.orderCount || 0,
      revenue: Number((orderMap.get(String(shop._id))?.revenue || 0).toFixed(2)),
      pointsEarned: pointsMap.get(String(shop._id)) || 0,
    })),
  });
});

export {
  convertShopToMall,
  createChildShop,
  getMallDetails,
  getMallDirectory,
  getMallOwnerAnalytics,
  getMallProgress,
  recordMallVisit,
  updateMallFeature,
};