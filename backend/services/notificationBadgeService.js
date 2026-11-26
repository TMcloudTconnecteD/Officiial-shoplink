import mongoose from "mongoose";
import User from "../models/userModel.js";

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
        enum: ["order", "payment", "rider", "seller", "message", "system", "alert", "cart", "reward", "referral"],
      },
      title: String,
      message: String,
      link: String,
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
    const update = {
      $inc: { badgeCount: 1 },
      $push: { unreadNotifications: notification },
    };

    try {
      return await NotificationBadge.findOneAndUpdate({ userId }, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      return await NotificationBadge.findOneAndUpdate({ userId }, update, { new: true });
    }
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
    const result = await NotificationBadge.updateOne(
      { userId },
      {
        $set: {
          badgeCount: 0,
          "unreadNotifications.$[].read": true,
        },
      }
    );
    if (result.matchedCount > 0) return NotificationBadge.findOne({ userId });

    await NotificationBadge.updateOne(
      { userId },
      { $setOnInsert: { badgeCount: 0, unreadNotifications: [] } },
      { upsert: true }
    );
    return NotificationBadge.findOne({ userId });
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
    return badge
      ? badge.unreadNotifications.filter((notification) => !notification.read).length
      : 0;
  } catch (error) {
    console.error("Error getting badge count:", error);
    throw error;
  }
};

/**
 * Get notification history for a user
 */
const getUnreadNotifications = async (userId) => {
  try {
    const badge = await NotificationBadge.findOne({ userId });
    return badge
      ? [...badge.unreadNotifications].sort((a, b) => b.createdAt - a.createdAt)
      : [];
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw error;
  }
};

const markNotificationRead = async (userId, notificationId) => {
  try {
    return NotificationBadge.findOneAndUpdate(
      {
        userId,
        badgeCount: { $gt: 0 },
        unreadNotifications: {
          $elemMatch: { _id: notificationId, read: false },
        },
      },
      {
        $set: { "unreadNotifications.$.read": true },
        $inc: { badgeCount: -1 },
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
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

const notifyUser = async (userId, notification) => {
  if (!userId) return null;
  return addNotification(userId, {
    ...notification,
    read: false,
    createdAt: new Date(),
  });
};

const notifyAdmins = async (notification, excludeUserId) => {
  const filter = { $or: [{ isAdmin: true }, { isSuperAdmin: true }] };
  const excludedUserIds = Array.isArray(excludeUserId)
    ? excludeUserId.filter(Boolean)
    : excludeUserId ? [excludeUserId] : [];
  if (excludedUserIds.length > 0) filter._id = { $nin: excludedUserIds };
  const admins = await User.find(filter).select("_id").lean();
  return Promise.all(admins.map(({ _id }) => notifyUser(_id, notification)));
};

export {
  NotificationBadge,
  incrementBadge,
  decrementBadge,
  resetBadge,
  getBadgeCount,
  getUnreadNotifications,
  markNotificationRead,
  addNotification,
  notifyUser,
  notifyAdmins,
};
