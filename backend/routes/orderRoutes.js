// routes/orderRoutes.js
import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getOrderFinancialSummary,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  confirmCashPayment,
  markOrderAsDelivered,
  getReceipt,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin, optionalAuthenticate } from "../middlewares/authMiddlewares.js";

router
  .route("/")
  .post(optionalAuthenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.route("/mine").get(authenticate, getUserOrders);
router.route("/total-orders").get(authenticate, countTotalOrders);
router.route("/total-sales").get(authenticate, calculateTotalSales);
router.route("/total-sales-by-date").get(authenticate, calculateTotalSalesByDate);
router.route("/financial-summary").get(authenticate, authorizeAdmin, getOrderFinancialSummary);
router.route("/:id/confirm-cash").put(authenticate, confirmCashPayment);

// receipt route: allow optional authentication so logged-in users' details can be used in receipts
router.get("/:id/receipt", optionalAuthenticate, getReceipt);
// temporary v2 route (helps bypass stale CDN caches while you purge) with optional auth
router.get("/v2/:id/receipt", optionalAuthenticate, getReceipt);

// allow anyone to fetch an order by id (useful for guests after checkout)
router.route("/:id").get(optionalAuthenticate, findOrderById);
router.route("/:id/pay").put(authenticate, markOrderAsPaid);
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;
