import express from "express";
import ExpressFormidable from "express-formidable";
import {
  convertShopToMall,
  createChildShop,
  getMallDetails,
  getMallDirectory,
  getMallOwnerAnalytics,
  getMallProgress,
  recordMallVisit,
  updateMallFeature,
} from "../controllers/mallController.js";
import { authenticate, authorizeAdmin, authorizeSuperAdmin, optionalAuthenticate } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", getMallDirectory);
router.get("/progress/me", authenticate, authorizeAdmin, getMallProgress);
router.get("/:mallId", getMallDetails);
router.post("/:mallId/visit", optionalAuthenticate, recordMallVisit);
router.post("/convert/:shopId", authenticate, authorizeAdmin, convertShopToMall);
router.post("/:mallId/shops", authenticate, authorizeAdmin, ExpressFormidable(), createChildShop);
router.get("/:mallId/analytics", authenticate, authorizeAdmin, getMallOwnerAnalytics);
router.patch("/:mallId/feature", authenticate, authorizeSuperAdmin, updateMallFeature);

export default router;
