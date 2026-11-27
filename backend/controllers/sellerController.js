import SellerApplication from "../models/sellerApplicationModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ProductFavorite from "../models/productFavoriteModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";

const applyAsSeller = async (req, res) => {
  try {
    const { fullName, phone, shopName, location, category, description, image } = req.body || {};
    if (!fullName?.trim() || !phone?.trim() || !shopName?.trim() || !location?.trim() || !category || !image?.trim()) {
      return res.status(400).json({ message: "Name, phone, shop name, location, category, and shop photo are required" });
    }
    let photoUrl;
    try {
      photoUrl = new URL(image.trim());
    } catch {
      return res.status(400).json({ message: "Upload a valid shop photo before submitting" });
    }
    if (photoUrl.protocol !== "https:" || photoUrl.hostname !== "res.cloudinary.com") {
      return res.status(400).json({ message: "Shop photos must be uploaded to Cloudinary" });
    }

    const existing = await SellerApplication.findOne({ user: req.user._id });
    if (existing && existing.status !== "rejected") {
      return res.status(existing.status === "approved" ? 409 : 409).json({
        message: existing.status === "approved" ? "Seller application is already approved" : "Seller application is already under review",
        application: existing,
      });
    }

    const payload = {
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: req.user.email,
      shopName: shopName.trim(),
      location: location.trim(),
      category,
      image: photoUrl.toString(),
      description: description?.trim() || "",
      status: "pending",
      reviewedAt: undefined,
      reviewedBy: undefined,
    };

    const application = existing
      ? await SellerApplication.findByIdAndUpdate(existing._id, payload, { new: true })
      : await SellerApplication.create(payload);

    req.user.sellerStatus = "pending";
    await req.user.save();

    await Promise.allSettled([
      notifyAdmins({
        type: "seller",
        title: "New seller application",
        message: `${application.fullName} applied to open ${application.shopName}.`,
        link: "/admin/sellers",
      }),
      notifyUser(req.user._id, {
        type: "seller",
        title: "Seller application received",
        message: "Your shop application is under review by the super administrator.",
        link: "/seller/apply",
      }),
    ]);

    return res.status(201).json({ message: "Seller application submitted", application });
  } catch (error) {
    console.error("Seller application failed:", error);
    return res.status(500).json({ message: "Unable to submit seller application" });
  }
};

const getMySellerApplication = asyncHandler(async (req, res) => {
  const application = await SellerApplication.findOne({ user: req.user._id });
  res.json(application);
});

const getSellerWorkspace = asyncHandler(async (req, res) => {
  const shops = req.user.isSuperAdmin
    ? await Shop.find({}).populate("category", "name").sort({ createdAt: -1 }).lean()
    : await Shop.find({ owner: req.user._id }).populate("category", "name").sort({ createdAt: -1 }).lean();
  res.json({ shops });
});

const getSellerAnalytics = asyncHandler(async (req, res) => {
  const shops = await Shop.find(
    req.user.isSuperAdmin ? {} : { owner: req.user._id }
  ).select("_id name").lean();
  const shopIds = shops.map((shop) => shop._id);
  const shopFilter = { shop: { $in: shopIds } };
  const orderFilter = { shop: { $in: shopIds } };

  const [
    productCount,
    orderCount,
    pendingOrderCount,
    paidSummary,
    bestSellers,
    mostReviewed,
    mostFavorited,
    salesTrend,
    recentOrders,
    loyaltyPointsSummary,
  ] = await Promise.all([
    Product.countDocuments(shopFilter),
    Order.countDocuments(orderFilter),
    Order.countDocuments({ ...orderFilter, isPaid: false }),
    Order.aggregate([
      { $match: { ...orderFilter, isPaid: true } },
      { $group: { _id: null, sales: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...orderFilter, isPaid: true } },
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.product", unitsSold: { $sum: "$orderItems.qty" }, orderCount: { $sum: 1 } } },
      { $sort: { unitsSold: -1, orderCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { _id: "$product._id", name: "$product.name", image: "$product.image", unitsSold: 1, orderCount: 1 } },
    ]),
    Product.find(shopFilter).sort({ numReviews: -1, rating: -1 }).limit(5)
      .select("name image rating numReviews").lean(),
    ProductFavorite.aggregate([
      { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $match: { "product.shop": { $in: shopIds } } },
      { $group: { _id: "$product._id", favoriteCount: { $sum: 1 }, name: { $first: "$product.name" }, image: { $first: "$product.image" } } },
      { $sort: { favoriteCount: -1, name: 1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { ...orderFilter, isPaid: true, paidAt: { $ne: null } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } }, sales: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 30 },
      { $sort: { _id: 1 } },
    ]),
    Order.find(orderFilter).sort({ createdAt: -1 }).limit(8)
      .populate("shop", "name").populate("user", "username").lean(),
    Order.aggregate([
      { $match: { ...orderFilter, sellerLoyaltyPointsAwardedAt: { $ne: null } } },
      { $group: { _id: null, points: { $sum: "$sellerLoyaltyPointsAwarded" } } },
    ]),
  ]);
  const paid = paidSummary[0] || { sales: 0, count: 0 };

  res.json({
    shops,
    summary: {
      shopCount: shops.length,
      productCount,
      orderCount,
      pendingOrderCount,
      paidOrderCount: paid.count,
      totalSales: Number(paid.sales.toFixed(2)),
      sellerLoyaltyPoints: loyaltyPointsSummary[0]?.points || 0,
    },
    bestSellers,
    mostReviewed,
    mostFavorited,
    salesTrend,
    recentOrders,
  });
});

const getSellerApplications = asyncHandler(async (_req, res) => {
  const applications = await SellerApplication.find({})
    .populate("user", "username email isAdmin isSuperAdmin")
    .populate("category", "name")
    .sort({ createdAt: -1 });
  res.json(applications);
});

const reviewSellerApplication = async (req, res) => {
  try {
    if (!["approved", "rejected"].includes(req.body?.status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }
    const application = await SellerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Seller application not found" });
    if (application.status !== "pending") return res.status(409).json({ message: "This seller application was already reviewed" });

    application.status = req.body.status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    await application.save();

    const user = await User.findById(application.user);
    if (!user) return res.status(404).json({ message: "Applicant account not found" });

    if (application.status === "approved") {
      const shop = await Shop.create({
        name: application.shopName,
        location: application.location,
        description: application.description || "",
        telephone: Number(String(application.phone).replace(/\D/g, "")),
        category: application.category,
        image: application.image || "https://res.cloudinary.com/tmcloud/image/upload/w_900,q_auto,f_auto/v1/shop-placeholder",
        owner: user._id,
      });
      user.isAdmin = true;
      user.isSeller = true;
      user.sellerStatus = "approved";
      user.sellerShop = shop._id;
    } else {
      user.isSeller = false;
      user.sellerStatus = "rejected";
    }
    await user.save();

    await notifyUser(user._id, {
      type: "seller",
      title: application.status === "approved" ? "Seller application approved" : "Seller application update",
      message: application.status === "approved"
        ? `Your shop "${application.shopName}" is approved. You can now manage your shop and products.`
        : "Your seller application was not approved. You may update it and apply again.",
      link: application.status === "approved" ? "/admin/my-shop" : "/seller/apply",
    });

    return res.json({ message: `Seller application ${application.status}`, application });
  } catch (error) {
    console.error("Seller review failed:", error);
    return res.status(500).json({ message: "Unable to review seller application" });
  }
};

export {
  applyAsSeller,
  getMySellerApplication,
  getSellerAnalytics,
  getSellerApplications,
  getSellerWorkspace,
  reviewSellerApplication,
};
