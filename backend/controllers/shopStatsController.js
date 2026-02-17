import ShopStats from "../models/shopStatsModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Get shop statistics
// @route   GET /api/shop-stats/:shopId
// @access  Private/Admin
export const getShopStats = asyncHandler(async (req, res) => {
  const { shopId } = req.params;

  const stats = await ShopStats.findOne({ shopId }).populate("shopId", "name");

  if (!stats) {
    return res.status(200).json({
      success: true,
      data: {
        totalSales: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalProductsSold: 0,
        averageRating: 0,
        ratingCount: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get top shops by revenue
// @route   GET /api/shop-stats/top-shops
// @access  Private/Admin
export const getTopShops = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const shops = await ShopStats.find()
    .sort({ totalRevenue: -1 })
    .limit(parseInt(limit))
    .populate("shopId", "name image rating");

  res.status(200).json({
    success: true,
    data: shops,
  });
});

// @desc    Update shop stats after order
// @route   Called internally
// @access  Private (internal service only)
export const updateShopStatsAfterOrder = async (
  shopId,
  orderAmount,
  productCount = 1
) => {
  try {
    let shopStats = await ShopStats.findOne({ shopId });

    if (!shopStats) {
      shopStats = new ShopStats({ shopId });
    }

    // Update stats
    shopStats.totalOrders += 1;
    shopStats.totalRevenue += orderAmount;
    shopStats.totalProductsSold += productCount;
    shopStats.lastUpdated = new Date();

    // Calculate average order value
    shopStats.averageOrderValue = shopStats.totalRevenue / shopStats.totalOrders;

    await shopStats.save();
    return shopStats;
  } catch (error) {
    console.error("Error updating shop stats:", error);
    throw error;
  }
};

// @desc    Get shop performance metrics
// @route   GET /api/shop-stats/performance/:shopId
// @access  Private/Admin
export const getShopPerformance = asyncHandler(async (req, res) => {
  const { shopId } = req.params;

  const stats = await ShopStats.findOne({ shopId });

  if (!stats) {
    return res.status(404).json({
      success: false,
      message: "Shop stats not found",
    });
  }

  const performance = {
    totalRevenue: stats.totalRevenue,
    totalOrders: stats.totalOrders,
    averageOrderValue: stats.averageOrderValue,
    totalProductsSold: stats.totalProductsSold,
    averageRating: stats.averageRating,
    ratingCount: stats.ratingCount,
    conversionRate:
      stats.totalProductsSold > 0 ? (stats.totalOrders / stats.totalProductsSold) * 100 : 0,
    monthlyStats: stats.monthlyStats || [],
  };

  res.status(200).json({
    success: true,
    data: performance,
  });
});

export default {
  getShopStats,
  getTopShops,
  updateShopStatsAfterOrder,
  getShopPerformance,
};
