import express from "express";
import {
  getUserBadgeCount,
  getUserNotifications,
  resetUserBadge,
  markUserNotificationRead,
  sendNotificationToUser,
  getAnyUserBadge,
} from "../controllers/notificationController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Public routes (authenticated users)
router.get("/badge/count", authenticate, getUserBadgeCount);
router.get("/notifications", authenticate, getUserNotifications);
router.patch("/notifications/:notificationId/read", authenticate, markUserNotificationRead);
router.put("/badge/reset", authenticate, resetUserBadge);

// Admin routes
router.post("/send", authenticate, authorizeAdmin, sendNotificationToUser);
router.get("/badge/:userId", authenticate, authorizeAdmin, getAnyUserBadge);

export default router;
