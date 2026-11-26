import express from "express";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import { applyAsSeller, getMySellerApplication, getSellerAnalytics, getSellerApplications, getSellerWorkspace, reviewSellerApplication } from "../controllers/sellerController.js";

const router = express.Router();

router.post("/apply", authenticate, applyAsSeller);
router.get("/mine", authenticate, getMySellerApplication);
router.get("/workspace", authenticate, authorizeAdmin, getSellerWorkspace);
router.get("/analytics", authenticate, authorizeAdmin, getSellerAnalytics);
router.get("/applications", authenticate, authorizeSuperAdmin, getSellerApplications);
router.patch("/applications/:id", authenticate, authorizeSuperAdmin, reviewSellerApplication);

export default router;
