import FeaturedProduct from "../models/featuredProductModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Get featured products
// @route   GET /api/featured-products
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { section = "homepage", limit = 10 } = req.query;

  const products = await FeaturedProduct.find({
    isFeatured: true,
    section: section,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } },
    ],
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate("productId");

  res.status(200).json({
    success: true,
    data: products,
  });
});

// @desc    Get featured products by category
// @route   GET /api/featured-products/category/:category
// @access  Public
export const getFeaturedByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const products = await FeaturedProduct.find({
    isFeatured: true,
    section: "category",
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } },
    ],
  })
    .sort({ priority: -1 })
    .limit(parseInt(limit))
    .populate({
      path: "productId",
      match: { category: category },
    });

  const filteredProducts = products.filter((p) => p.productId !== null);

  res.status(200).json({
    success: true,
    data: filteredProducts,
  });
});

// @desc    Set product as featured
// @route   POST /api/featured-products
// @access  Private/Admin
export const setFeaturedProduct = asyncHandler(async (req, res) => {
  const {
    productId,
    priority = 0,
    section = "homepage",
    endDate = null,
  } = req.body;

  let featured = await FeaturedProduct.findOne({ productId });

  if (featured) {
    featured.isFeatured = true;
    featured.priority = priority;
    featured.section = section;
    featured.endDate = endDate;
    featured.startDate = new Date();
    await featured.save();
  } else {
    featured = new FeaturedProduct({
      productId,
      priority,
      section,
      endDate,
      startDate: new Date(),
    });
    await featured.save();
  }

  await featured.populate("productId");

  res.status(201).json({
    success: true,
    message: "Product featured successfully",
    data: featured,
  });
});

// @desc    Remove product from featured
// @route   DELETE /api/featured-products/:productId
// @access  Private/Admin
export const removeFeaturedProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const featured = await FeaturedProduct.findOneAndUpdate(
    { productId },
    { isFeatured: false },
    { new: true }
  );

  if (!featured) {
    return res.status(404).json({
      success: false,
      message: "Featured product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product removed from featured",
    data: featured,
  });
});

// @desc    Track product click
// @route   PUT /api/featured-products/track-click/:productId
// @access  Public (internal)
export const trackProductClick = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const featured = await FeaturedProduct.findOneAndUpdate(
    { productId },
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (featured) {
    // Calculate CTR (Click-Through Rate)
    const ctr =
      featured.impressionCount > 0
        ? (featured.clickCount / featured.impressionCount) * 100
        : 0;
    featured.ctr = ctr;
  }

  res.status(200).json({
    success: true,
    data: featured,
  });
});

// @desc    Track product impression
// @route   PUT /api/featured-products/track-impression/:productId
// @access  Public (internal)
export const trackProductImpression = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const featured = await FeaturedProduct.findOneAndUpdate(
    { productId },
    { $inc: { impressionCount: 1 } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: featured,
  });
});

export default {
  getFeaturedProducts,
  getFeaturedByCategory,
  setFeaturedProduct,
  removeFeaturedProduct,
  trackProductClick,
  trackProductImpression,
};
