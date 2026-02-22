import express from "express";
import {
  getUserBadgeCount,
  getUserNotifications,
  resetUserBadge,
  sendNotificationToUser,
  getAnyUserBadge,
} from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Public routes (authenticated users)
router.get("/badge/count", authenticate, getUserBadgeCount);
router.get("/notifications", authenticate, getUserNotifications);
router.put("/badge/reset", authenticate, resetUserBadge);

// Admin routes
router.post("/send", authenticate, sendNotificationToUser);
router.get("/badge/:userId", authenticate, getAnyUserBadge);

export default router;
