import express from "express";
import {
  createCrop,
  fetchCrops,
  fetchCropById,
  updateCrop,
  deleteCrop,
} from "../controllers/cropController.js";
import { authenticate } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// All crop routes require authentication
router.post("/", authenticate, createCrop);
router.get("/", authenticate, fetchCrops);
router.get("/:id", authenticate, fetchCropById);
router.put("/:id", authenticate, updateCrop);
router.delete("/:id", authenticate, deleteCrop);

export default router;
