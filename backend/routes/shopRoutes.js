import express from "express";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import { createShop, deleteShop, fetchAllShops, getMallOverview, updateShop } from "../controllers/shopController.js";
import ExpressFormidable from "express-formidable";

const router = express.Router();

// Add logging middleware for all /api/shops requests
router.use((req, res, next) => {
  console.log(`ShopRoutes: ${req.method} ${req.originalUrl}`);
  next();
});

// Route for creating a new shop (admin only)
router.route("/")
  .post(authenticate, authorizeAdmin, ExpressFormidable(), createShop);

// Route for updating shop details (only owner or admin)
router.route("/:id")
  .put(authenticate, authorizeAdmin, ExpressFormidable(), updateShop)
  .delete(authenticate, authorizeAdmin, deleteShop);

// Route for fetching all shops (admin only)
router.get("/mall-overview", getMallOverview);
router.route("/all")
  .get(fetchAllShops);

export default router;
