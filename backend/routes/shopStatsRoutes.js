import express from "express";
import {
  getShopStats,
  getTopShops,
  getShopPerformance,
} from "../controllers/shopStatsController.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// @route   GET /api/shop-stats/:shopId
// @desc    Get shop statistics
// @access  Private/Admin
router.get("/:shopId", protect, admin, getShopStats);

// @route   GET /api/shop-stats
// @desc    Get top shops
// @access  Private/Admin
router.get("/", protect, admin, getTopShops);

// @route   GET /api/shop-stats/performance/:shopId
// @desc    Get shop performance metrics
// @access  Private/Admin
router.get("/performance/:shopId", protect, admin, getShopPerformance);

export default router;
