import asyncHandler from "../middlewares/asyncHandler.js";
import {
  getBadgeCount,
  getUnreadNotifications,
  resetBadge,
  addNotification,
  NotificationBadge,
} from "../services/notificationBadgeService.js";

/**
 * GET badge count for the authenticated user
 * Called when the app launches to display the badge number
 */
const getUserBadgeCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const badgeCount = await getBadgeCount(userId);

    res.json({
      badgeCount,
      userId,
    });
  } catch (error) {
    console.error("Error getting badge count:", error);
    res.status(500).json({ error: "Failed to get badge count" });
  }
});

/**
 * GET all unread notifications for the user
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await getUnreadNotifications(userId);

    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

/**
 * RESET badge count (user opened the app or read all notifications)
 */
const resetUserBadge = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const badge = await resetBadge(userId);

    res.json({
      message: "Badge count reset",
      badgeCount: badge.badgeCount,
    });
  } catch (error) {
    console.error("Error resetting badge:", error);
    res.status(500).json({ error: "Failed to reset badge" });
  }
});

/**
 * ADMIN: Add a notification for a specific user
 * Used by backend services to push notifications
 */
const sendNotificationToUser = asyncHandler(async (req, res) => {
  try {
    const { userId, type, title, message } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        error: "userId, type, title, and message are required",
      });
    }

    const notification = {
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    const badge = await addNotification(userId, notification);

    res.status(201).json({
      message: "Notification sent successfully",
      badge,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

/**
 * ADMIN: Get badge info for any user (admin only)
 */
const getAnyUserBadge = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const badge = await NotificationBadge.findOne({ userId })
      .populate("userId", "username email");

    if (!badge) {
      return res.json({
        userId,
        badgeCount: 0,
        unreadNotifications: [],
      });
    }

    res.json(badge);
  } catch (error) {
    console.error("Error getting user badge:", error);
    res.status(500).json({ error: "Failed to get badge information" });
  }
});

export {
  getUserBadgeCount,
  getUserNotifications,
  resetUserBadge,
  sendNotificationToUser,
  getAnyUserBadge,
};
