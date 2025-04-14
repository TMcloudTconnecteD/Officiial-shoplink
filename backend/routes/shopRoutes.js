import express from "express";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import {   createShop,  deleteShop,  fetchAllShops, updateShop } from "../controllers/shopController.js";

const router = express.Router();

// Route for creating a new shop (admin only)
router.route("/")
  .post( createShop);

// Route for updating shop details (only owner or admin)


// Route for fetching all shops (admin only)
router.route("/all")
  .get( fetchAllShops);

// Route for fetching shops by category
//router.route("/category/:categoryId")
//  .get(fetchShopsByCategory);

// Route for fetching all shops owned by the current user
//router.route("/myshops")
//  .get(authenticate, fetchUserShops);

  router.route("/:id")
  .put(authenticate, authorizeAdmin, updateShop)
  .delete(authenticate, authorizeAdmin, deleteShop)
  //.get(fetchShopById);

export default router;
