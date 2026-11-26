import asyncHandler from "../middlewares/asyncHandler.js";
import {
  getBadgeCount,
  getUnreadNotifications,
  resetBadge,
  markNotificationRead,
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
 * GET notification history and unread count for the authenticated user
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await getUnreadNotifications(userId);

    res.json({
      notifications,
      count: await getBadgeCount(userId),
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

/**
 * Mark all notifications read without deleting notification history
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

const markUserNotificationRead = asyncHandler(async (req, res) => {
  try {
    const badge = await markNotificationRead(req.user._id, req.params.notificationId);
    if (!badge) {
      return res.status(404).json({ message: "Unread notification not found" });
    }
    return res.json({
      message: "Notification marked as read",
      badgeCount: badge.badgeCount,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

/**
 * ADMIN: Add a notification for a specific user
 * Used by backend services to push notifications
 */
const sendNotificationToUser = asyncHandler(async (req, res) => {
  try {
    const { userId, type, title, message, link } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        error: "userId, type, title, and message are required",
      });
    }
    if (link !== undefined && (typeof link !== "string" || !link.startsWith("/") || link.startsWith("//"))) {
      return res.status(400).json({ error: "link must be a local application path" });
    }

    const notification = {
      type,
      title,
      message,
      link,
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
  markUserNotificationRead,
  sendNotificationToUser,
  getAnyUserBadge,
};
