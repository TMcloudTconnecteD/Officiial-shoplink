import Analytics from "../models/analyticsModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Get platform summary statistics
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getPlatformStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get today's stats or create new ones
  let todayStats = await Analytics.findOne({ date: { $gte: startOfDay } });

  if (!todayStats) {
    // Get previous day stats as baseline
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStats = await Analytics.findOne({
      date: { $gte: yesterday, $lt: startOfDay },
    });

    todayStats = new Analytics({
      date: startOfDay,
      totalRevenue: yesterdayStats?.totalRevenue || 0,
      totalOrders: yesterdayStats?.totalOrders || 0,
      totalUsers: yesterdayStats?.totalUsers || 0,
      totalShops: yesterdayStats?.totalShops || 0,
      totalProducts: yesterdayStats?.totalProducts || 0,
    });
    await todayStats.save();
  }

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: todayStats.totalRevenue,
      totalOrders: todayStats.totalOrders,
      totalUsers: todayStats.totalUsers,
      totalShops: todayStats.totalShops,
      totalProducts: todayStats.totalProducts,
      newOrders: todayStats.newOrders,
      newUsers: todayStats.newUsers,
      averageOrderValue: todayStats.averageOrderValue,
    },
  });
});

// @desc    Get revenue trend over time
// @route   GET /api/analytics/revenue-trend
// @access  Private/Admin
export const getRevenueTrend = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const trend = await Analytics.find({ date: { $gte: startDate } })
    .sort({ date: 1 })
    .select("date totalRevenue totalOrders averageOrderValue");

  res.status(200).json({
    success: true,
    data: trend,
  });
});

// @desc    Get order statistics by category
// @route   GET /api/analytics/orders-by-category
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Analytics.findOne()
    .sort({ date: -1 })
    .select("totalOrders newOrders"); // These would need to store category breakdowns

  res.status(200).json({
    success: true,
    data: stats || { totalOrders: 0, newOrders: 0 },
  });
});

// @desc    Update platform analytics (called after order)
// @route   PUT /api/analytics/update
// @access  Private (internal service only)
export const updateAnalytics = asyncHandler(async (req, res) => {
  const { revenue = 0, orderCount = 1, userCount = 0, productCount = 0 } =
    req.body;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const analytics = await Analytics.findOneAndUpdate(
    { date: { $gte: startOfDay } },
    {
      $inc: {
        totalRevenue: revenue,
        totalOrders: orderCount,
        totalUsers: userCount,
        totalProducts: productCount,
        newOrders: orderCount,
        newUsers: userCount,
      },
    },
    { new: true, upsert: true }
  );

  // Calculate average order value
  if (analytics.totalOrders > 0) {
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
    await analytics.save();
  }

  res.status(200).json({
    success: true,
    data: analytics,
  });
});

// Internal function (can be called from other services)
export const updateAnalyticsInternal = async (
  revenue = 0,
  orderCount = 1,
  userCount = 0,
  productCount = 0
) => {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const analytics = await Analytics.findOneAndUpdate(
      { date: { $gte: startOfDay } },
      {
        $inc: {
          totalRevenue: revenue,
          totalOrders: orderCount,
          totalUsers: userCount,
          totalProducts: productCount,
          newOrders: orderCount,
          newUsers: userCount,
        },
      },
      { new: true, upsert: true }
    );

    // Calculate average order value
    if (analytics.totalOrders > 0) {
      analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
      await analytics.save();
    }

    return analytics;
  } catch (error) {
    console.error("Error updating analytics:", error);
    throw error;
  }
};

export default {
  getPlatformStats,
  getRevenueTrend,
  getOrderStats,
  updateAnalytics,
  updateAnalyticsInternal,
};
