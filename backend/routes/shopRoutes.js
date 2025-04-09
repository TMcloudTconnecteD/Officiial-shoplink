import express from "express";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import { createShop, updateShop, deleteShop, fetchAllShops, fetchShopById, fetchShopsByCategory, fetchUserShops } from "../controllers/shopController.js";

const router = express.Router();

// Route for creating a new shop (admin only)
router.route("/")
  .post(authenticate, authorizeAdmin, authorizeSuperAdmin , createShop);

// Route for updating shop details (only owner or admin)
router.route("/:id")
  .put(authenticate, authorizeAdmin, updateShop)
  .delete(authenticate, authorizeAdmin, deleteShop)
  .get(fetchShopById);

// Route for fetching all shops (admin only)
router.route("/all")
  .get(authenticate, authorizeAdmin, fetchAllShops);

// Route for fetching shops by category
router.route("/category/:categoryId")
  .get(fetchShopsByCategory);

// Route for fetching all shops owned by the current user
router.route("/myshops")
  .get(authenticate, fetchUserShops);

export default router;
