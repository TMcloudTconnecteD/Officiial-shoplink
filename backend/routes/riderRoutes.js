import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import {
  applyAsRider,
  getApprovedRiders,
  getMyRiderApplication,
  getRiderApplications,
  reviewRiderApplication,
} from "../controllers/riderController.js";

const router = express.Router();

router.get("/approved", getApprovedRiders);
router.post("/apply", authenticate, applyAsRider);
router.get("/mine", authenticate, getMyRiderApplication);
router.get("/applications", authenticate, authorizeAdmin, getRiderApplications);
router.patch("/applications/:id", authenticate, authorizeAdmin, reviewRiderApplication);

export default router;
