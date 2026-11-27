import express from "express";
import { authenticate, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import {
  applyAsRider,
  getApprovedRiders,
  getMyRiderApplication,
  getRiderApplications,
  reviewRiderApplication,
  suspendRider,
  submitRiderAppeal,
  reviewRiderAppeal,
} from "../controllers/riderController.js";

const router = express.Router();

router.get("/approved", getApprovedRiders);
router.post("/apply", authenticate, applyAsRider);
router.get("/mine", authenticate, getMyRiderApplication);
router.get("/applications", authenticate, authorizeSuperAdmin, getRiderApplications);
router.patch("/applications/:id", authenticate, authorizeSuperAdmin, reviewRiderApplication);
router.patch("/applications/:id/suspend", authenticate, authorizeSuperAdmin, suspendRider);
router.post("/mine/appeal", authenticate, submitRiderAppeal);
router.patch("/applications/:id/appeal", authenticate, authorizeSuperAdmin, reviewRiderAppeal);

export default router;
