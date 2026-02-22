import mongoose from "mongoose";

/**
 * Notification Badge Service
 * Manages badge counts for users across the app
 * Used to display notification alerts on app icons
 */

const notificationBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  badgeCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  unreadNotifications: [
    {
      id: mongoose.Schema.Types.ObjectId,
      type: {
        type: String,
        enum: ["order", "message", "system", "alert"],
      },
      title: String,
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const NotificationBadge = mongoose.model(
  "NotificationBadge",
  notificationBadgeSchema
);

/**
 * Increment badge count for a user
 */
const incrementBadge = async (userId, notification) => {
  try {
    let badge = await NotificationBadge.findOne({ userId });

    if (!badge) {
      badge = new NotificationBadge({
        userId,
        badgeCount: 1,
        unreadNotifications: [notification],
      });
    } else {
      badge.badgeCount += 1;
      badge.unreadNotifications.push(notification);
    }

    await badge.save();
    return badge;
  } catch (error) {
    console.error("Error incrementing badge:", error);
    throw error;
  }
};

/**
 * Decrement badge count (mark notification as read)
 */
const decrementBadge = async (userId) => {
  try {
    const badge = await NotificationBadge.findOne({ userId });
    if (badge && badge.badgeCount > 0) {
      badge.badgeCount -= 1;
      await badge.save();
    }
    return badge;
  } catch (error) {
    console.error("Error decrementing badge:", error);
    throw error;
  }
};

/**
 * Reset badge count to 0 (user opened the app)
 */
const resetBadge = async (userId) => {
  try {
    const badge = await NotificationBadge.findOneAndUpdate(
      { userId },
      {
        badgeCount: 0,
        unreadNotifications: [],
      },
      { new: true, upsert: true }
    );
    return badge;
  } catch (error) {
    console.error("Error resetting badge:", error);
    throw error;
  }
};

/**
 * Get current badge count for a user
 */
const getBadgeCount = async (userId) => {
  try {
    const badge = await NotificationBadge.findOne({ userId });
    return badge ? badge.badgeCount : 0;
  } catch (error) {
    console.error("Error getting badge count:", error);
    throw error;
  }
};

/**
 * Get all unread notifications for a user
 */
const getUnreadNotifications = async (userId) => {
  try {
    const badge = await NotificationBadge.findOne({ userId });
    return badge ? badge.unreadNotifications : [];
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw error;
  }
};

/**
 * Add a new notification for a user
 */
const addNotification = async (userId, notification) => {
  try {
    const badge = await incrementBadge(userId, notification);
    // In a real app, you'd also send a push notification here using Firebase or APNS
    return badge;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export {
  NotificationBadge,
  incrementBadge,
  decrementBadge,
  resetBadge,
  getBadgeCount,
  getUnreadNotifications,
  addNotification,
};
