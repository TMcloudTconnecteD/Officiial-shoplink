import express from "express";
import {
  getFeaturedProducts,
  getFeaturedByCategory,
  setFeaturedProduct,
  removeFeaturedProduct,
  trackProductClick,
  trackProductImpression,
} from "../controllers/featuredProductController.js";
import { protect, admin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// @route   GET /api/featured-products
// @desc    Get featured products
// @access  Public
router.get("/", getFeaturedProducts);

// @route   GET /api/featured-products/category/:category
// @desc    Get featured products by category
// @access  Public
router.get("/category/:category", getFeaturedByCategory);

// @route   POST /api/featured-products
// @desc    Set product as featured
// @access  Private/Admin
router.post("/", protect, admin, setFeaturedProduct);

// @route   DELETE /api/featured-products/:productId
// @desc    Remove product from featured
// @access  Private/Admin
router.delete("/:productId", protect, admin, removeFeaturedProduct);

// @route   PUT /api/featured-products/track-click/:productId
// @desc    Track product click
// @access  Public (internal)
router.put("/track-click/:productId", trackProductClick);

// @route   PUT /api/featured-products/track-impression/:productId
// @desc    Track product impression
// @access  Public (internal)
router.put("/track-impression/:productId", trackProductImpression);

export default router;
