import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";

const canManageShop = async (user, shop) => {
  if (user?.isSuperAdmin) return true;
  if (!shop) return false;
  if (shop.owner?.toString() === user?._id?.toString()) return true;
  if (!shop.parentMall) return false;
  return Boolean(await Shop.exists({ _id: shop.parentMall, owner: user._id, type: "mall" }));
};

// Create a new mall/shop
const createShop = asyncHandler(async (req, res) => {
  try {
    if (req.user.isSeller && !req.user.isSuperAdmin) {
      if (req.user.sellerShop) {
        return res.status(409).json({ error: "You already manage your approved shop" });
      }
      if (req.user.sellerStatus !== "approved") {
        return res.status(403).json({ error: "Your seller account is not approved" });
      }
    }
  console.log('createShop called', { fields: req.fields, body: req.body, user: req.user && { id: req.user._id, email: req.user.email } });
  const { name, location, telephone, category, image, coverImage = "", description = "", policies = "" } = req.fields || req.body;

    if (!name) return res.status(400).json({ error: "Name is required, come on!" });
    if (!location) return res.status(400).json({ error: "Location is required, come on!" });
    if (!telephone) return res.status(400).json({ error: "Phone No. is required, come on!" });
    if (!category) return res.status(400).json({ error: "Category is required, come on!" });
    if (!image) return res.status(400).json({ error: "Image is required, come on!" });

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ error: "Invalid category ID" });

    const telephoneNumber = Number(telephone);
    if (isNaN(telephoneNumber)) return res.status(400).json({ error: "Telephone must be a number" });

    const mall = new Shop({
      name: name.trim(),
      location: location.trim(),
      telephone: telephoneNumber,
      category,
      image,
      coverImage,
      description,
      policies,
      owner: req.user._id,
    });

    await mall.save();
    await Promise.allSettled([
      notifyAdmins({
        type: "seller",
        title: "Shop created",
        message: `${mall.name} was created and is ready for the super admin to review.`,
        link: "/admin/shops",
      }),
      notifyUser(req.user._id, {
        type: "seller",
        title: "Shop created",
        message: `Your shop "${mall.name}" was created successfully.`,
        link: `/shops/${mall._id}`,
      }),
    ]);
    res.json(mall);
  } catch (error) {
    console.error(error, 'error creating shop');
    res.status(400).json({ error: error.message });
  }
});

// Update existing mall
const updateShop = asyncHandler(async (req, res) => {
  try {
    const { name, location, telephone, category, image, coverImage, description, policies } = req.fields || req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Shop name is required." });
    if (!location?.trim()) return res.status(400).json({ message: "Shop location is required." });
    if (!telephone) return res.status(400).json({ message: "Shop phone number is required." });
    if (!category) return res.status(400).json({ message: "Choose a shop category." });
    if (!image) return res.status(400).json({ message: "Add a shop photo." });

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ message: "Choose a valid shop category." });

    const mall = await Shop.findById(req.params.id);
    if (!mall) return res.status(404).json({ message: "Shop not found." });

    if (!(await canManageShop(req.user, mall))) {
      return res.status(403).json({ message: "You can only edit a shop you manage." });
    }
    if (mall.parentMall && await Shop.exists({ parentMall: mall.parentMall, category, _id: { $ne: mall._id } })) {
      return res.status(409).json({ message: "Each shop in your mall needs a different category. Choose a category not already used by another shop in this mall." });
    }

    mall.name = name.trim();
    mall.location = location.trim();
    mall.telephone = telephone;
    mall.category = category;
    mall.image = image;
    if (coverImage !== undefined) mall.coverImage = coverImage;
    mall.description = description || "";
    mall.policies = policies || "";

    await mall.save();
    res.json(mall);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Each shop in your mall needs a different category. Choose a category not already used by another shop in this mall." });
    }
    res.status(400).json({ message: error.message || "Could not update this shop." });
  }
});

// Delete a mall
const deleteShop = asyncHandler(async (req, res) => {
  try {
    const mall = await Shop.findById(req.params.id);
    if (!mall) return res.status(404).json({ error: "Mall not found" });

    if (!(await canManageShop(req.user, mall))) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (mall.type === "mall" && await Shop.exists({ parentMall: mall._id })) {
      return res.status(409).json({ error: "Move or delete this mall's child shops before deleting the mall." });
    }

    await mall.deleteOne();
    if (mall.parentMall) {
      await Shop.updateOne({ _id: mall.parentMall }, { $pull: { childShops: mall._id } });
    }
    res.json({ message: "Mall deleted successfully", mall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting mall" });
  }
});

// Fetch all shops
const fetchAllShops = asyncHandler(async (req, res) => {
  try {
    const malls = await Shop.find({})
      .populate("category")
      .populate("owner", "email telephone")
      .sort({ createdAt: -1 });
    res.json(malls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting malls" });
  }
});

const getMallOverview = asyncHandler(async (_req, res) => {
  const normalizeLocationExpression = { $toLower: { $trim: { input: "$shop.location" } } };
  const getOrderCounts = async (since, groupByShop = false) => {
    const match = { isPaid: true };
    if (since) match.createdAt = { $gte: since };
    return Order.aggregate([
      { $match: match },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "shops",
          localField: "product.shop",
          foreignField: "_id",
          as: "shop",
        },
      },
      { $unwind: "$shop" },
      {
        $group: {
          _id: groupByShop
            ? { shop: "$shop._id", order: "$_id" }
            : { location: normalizeLocationExpression, order: "$_id" },
        },
      },
      {
        $group: {
          _id: groupByShop ? "$_id.shop" : "$_id.location",
          orderCount: { $sum: 1 },
        },
      },
    ]);
  };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const [shops, productCounts, weeklyOrders, lifetimeOrders, weeklyOrdersByShop, lifetimeOrdersByShop, productOrderCounts] = await Promise.all([
    Shop.find({}).populate("category", "name").populate("parentMall", "name").lean(),
    Product.aggregate([{ $group: { _id: "$shop", productCount: { $sum: 1 } } }]),
    getOrderCounts(weekStart),
    getOrderCounts(null),
    getOrderCounts(weekStart, true),
    getOrderCounts(null, true),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "shops",
          localField: "product.shop",
          foreignField: "_id",
          as: "shop",
        },
      },
      { $unwind: "$shop" },
      {
        $group: {
          _id: {
            shop: "$shop._id",
            product: "$product._id",
            order: "$_id",
          },
          unitsSold: { $sum: "$orderItems.qty" },
        },
      },
      {
        $group: {
          _id: { shop: "$_id.shop", product: "$_id.product" },
          orderCount: { $sum: 1 },
          unitsSold: { $sum: "$unitsSold" },
        },
      },
      { $sort: { orderCount: -1, unitsSold: -1 } },
    ]),
  ]);

  const countsByShop = new Map(productCounts.map(({ _id, productCount }) => [String(_id), productCount]));
  const weeklyByLocation = new Map(weeklyOrders.map(({ _id, orderCount }) => [_id, orderCount]));
  const lifetimeByLocation = new Map(lifetimeOrders.map(({ _id, orderCount }) => [_id, orderCount]));
  const weeklyByShop = new Map(weeklyOrdersByShop.map(({ _id, orderCount }) => [String(_id), orderCount]));
  const lifetimeByShop = new Map(lifetimeOrdersByShop.map(({ _id, orderCount }) => [String(_id), orderCount]));
  const productStatsByShop = new Map();
  const productStatsByLocation = new Map();
  const shopLocationById = new Map(shops.map((shop) => [
    String(shop._id),
    typeof shop.location === "string" ? shop.location.trim().toLowerCase() : "",
  ]));
  for (const stat of productOrderCounts) {
    const shopKey = String(stat._id.shop);
    const productStat = {
      productId: String(stat._id.product),
      orderCount: stat.orderCount,
      unitsSold: stat.unitsSold,
    };
    const shopStats = productStatsByShop.get(shopKey) || [];
    shopStats.push(productStat);
    productStatsByShop.set(shopKey, shopStats);

    const locationKey = shopLocationById.get(shopKey);
    if (locationKey) {
      const locationStats = productStatsByLocation.get(locationKey) || [];
      locationStats.push(productStat);
      productStatsByLocation.set(locationKey, locationStats);
    }
  }

  const mallMap = new Map();
  for (const shop of shops) {
    const location = typeof shop.location === "string" ? shop.location.trim() : "";
    if (!location) continue;
    const normalizedLocation = location.toLowerCase();
    const mall = mallMap.get(normalizedLocation) || {
      location,
      normalizedLocation,
      shops: [],
      productCount: 0,
    };
    const productCount = countsByShop.get(String(shop._id)) || 0;
    mall.shops.push({
      _id: shop._id,
      name: shop.name,
      image: shop.image,
      coverImage: shop.coverImage || "",
      description: shop.description || "",
      category: shop.category,
      location: shop.location,
      type: shop.type || "shop",
      parentMall: shop.parentMall || null,
      childShopCount: shop.childShops?.length || 0,
      productCount,
      orderCountThisWeek: weeklyByShop.get(String(shop._id)) || 0,
      lifetimeOrderCount: lifetimeByShop.get(String(shop._id)) || 0,
      productOrderCounts: productStatsByShop.get(String(shop._id)) || [],
    });
    mall.productCount += productCount;
    mallMap.set(normalizedLocation, mall);
  }

  const malls = [...mallMap.values()].map((mall) => ({
    ...mall,
    shopCount: mall.shops.length,
    orderCountThisWeek: weeklyByLocation.get(mall.normalizedLocation) || 0,
    lifetimeOrderCount: lifetimeByLocation.get(mall.normalizedLocation) || 0,
    productOrderCounts: productStatsByLocation.get(mall.normalizedLocation) || [],
  })).sort((a, b) => b.lifetimeOrderCount - a.lifetimeOrderCount || a.location.localeCompare(b.location));

  const mostLovedMall = malls.reduce((best, mall) => (
    mall.lifetimeOrderCount > (best?.lifetimeOrderCount || 0) ? mall : best
  ), null);

  res.json({ malls, mostLovedMallLocation: mostLovedMall?.location || null });
});

export {
  createShop,
  updateShop,
  deleteShop,
  fetchAllShops,
  getMallOverview,
};
