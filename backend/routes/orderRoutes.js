// routes/orderRoutes.js
import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  getReceipt,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin, optionalAuthenticate } from "../middlewares/authMiddlewares.js";

router
  .route("/")
  .post(optionalAuthenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.route("/mine").get(authenticate, getUserOrders);
router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calculateTotalSalesByDate);

// receipt route (no auth required so guests can download receipts)
router.get("/:id/receipt", getReceipt);
// temporary v2 route (helps bypass stale CDN caches while you purge)
router.get("/v2/:id/receipt", getReceipt);

// allow anyone to fetch an order by id (useful for guests after checkout)
router.route("/:id").get(findOrderById);
router.route("/:id/pay").put(authenticate, markOrderAsPaid);
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;
