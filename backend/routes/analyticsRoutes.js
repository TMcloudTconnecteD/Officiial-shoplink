import express from "express";
import {
  getPlatformStats,
  getRevenueTrend,
  getOrderStats,
  updateAnalytics,
} from "../controllers/analyticsController.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// @route   GET /api/analytics/summary
// @desc    Get platform summary
// @access  Private/Admin
router.get("/summary", protect, admin, getPlatformStats);

// @route   GET /api/analytics/revenue-trend
// @desc    Get revenue trend
// @access  Private/Admin
router.get("/revenue-trend", protect, admin, getRevenueTrend);

// @route   GET /api/analytics/orders-by-category
// @desc    Get order stats by category
// @access  Private/Admin
router.get("/orders-by-category", protect, admin, getOrderStats);

// @route   PUT /api/analytics/update
// @desc    Update analytics (called internally)
// @access  Private
router.put("/update", updateAnalytics);

export default router;
