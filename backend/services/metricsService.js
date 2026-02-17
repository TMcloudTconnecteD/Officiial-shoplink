import { updateAnalyticsInternal } from "../controllers/analyticsController.js";
import { updateShopStatsAfterOrder } from "../controllers/shopStatsController.js";
import UserActivity from "../models/userActivityModel.js";

/**
 * Service to handle platform metrics updates after an order is placed
 * This should be called from orderController after a successful order creation
 */

export const updatePlatformMetricsAfterOrder = async (order, shop) => {
  try {
    const orderAmount = order.totalPrice || 0;
    const productCount = order.orderItems?.length || 1;

    // Update global analytics
    await updateAnalyticsInternal(
      orderAmount, // revenue
      1, // one order
      0, // don't increment users here (handle separately)
      0 // don't increment products here
    );

    // Update shop-specific stats
    if (shop && shop._id) {
      await updateShopStatsAfterOrder(shop._id, orderAmount, productCount);
    }

    // Update user activity
    if (order.user) {
      const userActivity = await UserActivity.findOneAndUpdate(
        { userId: order.user },
        {
          $inc: {
            ordersPlaced: 1,
            totalSpent: orderAmount,
          },
          lastActivityDate: new Date(),
        },
        { new: true, upsert: true }
      );
    }

    console.log(
      `✓ Platform metrics updated for order ${order._id} by shop ${shop?._id}`
    );
    return true;
  } catch (error) {
    console.error("Error updating platform metrics:", error);
    // Don't throw - we don't want order creation to fail if metrics update fails
    return false;
  }
};

/**
 * Track user login activity
 */
export const trackUserLogin = async (userId) => {
  try {
    const userActivity = await UserActivity.findOneAndUpdate(
      { userId },
      {
        lastLogin: new Date(),
        lastActivityDate: new Date(),
        isActive: true,
      },
      { new: true, upsert: true }
    );

    // Increment new users if first login today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (userActivity.lastLogin < today) {
      // First login today - update analytics for new active user
      // Only count if truly new user or hasn't logged in for 30 days
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);

      if (userActivity.createdAt > lastMonth) {
        await updateAnalyticsInternal(
          0, // no revenue
          0, // no orders
          1, // one new user activity
          0 // no products
        );
      }
    }

    return userActivity;
  } catch (error) {
    console.error("Error tracking user login:", error);
    return null;
  }
};

/**
 * Track product view
 */
export const trackProductView = async (userId, productId) => {
  try {
    if (!userId || !productId) return null;

    const userActivity = await UserActivity.findOneAndUpdate(
      { userId },
      {
        $push: {
          productsViewed: {
            productId,
            viewedAt: new Date(),
          },
        },
        lastActivityDate: new Date(),
      },
      { new: true, upsert: true }
    );

    return userActivity;
  } catch (error) {
    console.error("Error tracking product view:", error);
    return null;
  }
};

/**
 * Track cart additions
 */
export const trackCartAdd = async (userId) => {
  try {
    if (!userId) return null;

    const userActivity = await UserActivity.findOneAndUpdate(
      { userId },
      {
        $inc: { cartAdds: 1 },
        lastActivityDate: new Date(),
      },
      { new: true, upsert: true }
    );

    return userActivity;
  } catch (error) {
    console.error("Error tracking cart add:", error);
    return null;
  }
};

export default {
  updatePlatformMetricsAfterOrder,
  trackUserLogin,
  trackProductView,
  trackCartAdd,
};
