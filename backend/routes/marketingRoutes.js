import express from "express";
import {
  getAdminCatalog,
  getAdminRewardCredits,
  getAllReferrals,
  getCartNudgeStatus,
  getFreshDrops,
  getFeaturedProducts,
  getPromoAnalytics,
  getPublicPromoSettings,
  getRewards,
  getSellerSpotlight,
  getTrendingProducts,
  getWelcomeToast,
  logPromoEvent,
  toggleProductFeature,
  updateCartActivity,
  updateFeaturedSlot,
  updatePromoModules,
  updateRewardCreditStatus,
  updateRewardProgram,
} from "../controllers/marketingController.js";
import { authenticate, authorizeAdmin, authorizeSuperAdmin, optionalAuthenticate } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/public/settings", getPublicPromoSettings);
router.get("/public/fresh-drops", getFreshDrops);
router.get("/public/featured-products", getFeaturedProducts);
router.get("/public/trending", getTrendingProducts);
router.get("/public/seller-spotlight", getSellerSpotlight);
router.get("/public/welcome", authenticate, getWelcomeToast);
router.post("/impressions", optionalAuthenticate, logPromoEvent);
router.post("/cart/activity", authenticate, updateCartActivity);
router.get("/cart/status", authenticate, getCartNudgeStatus);

router.get("/rewards/me", authenticate, getRewards);

router.get("/admin/catalog", authenticate, authorizeAdmin, getAdminCatalog);
router.get("/admin/reward-credits", authenticate, authorizeSuperAdmin, getAdminRewardCredits);
router.patch("/admin/modules", authenticate, authorizeSuperAdmin, updatePromoModules);
router.patch("/admin/rewards", authenticate, authorizeSuperAdmin, updateRewardProgram);
router.patch("/admin/reward-credits/:creditId", authenticate, authorizeSuperAdmin, updateRewardCreditStatus);
router.patch("/admin/featured", authenticate, authorizeSuperAdmin, updateFeaturedSlot);
router.patch("/admin/products/:productId/feature", authenticate, authorizeAdmin, toggleProductFeature);
router.get("/admin/analytics", authenticate, authorizeSuperAdmin, getPromoAnalytics);
router.get("/admin/referrals", authenticate, authorizeSuperAdmin, getAllReferrals);

export default router;
