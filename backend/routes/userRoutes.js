import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getCurrentUserProfile,
  getUserById,
  logUser,
  logoutCurrentUser,
  updateCurrentUserProfile,
  updateUserById,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Public routes
router.post("/", createUser); // Register
router.post("/auth", logUser); // Login
router.post("/logout", authenticate, logoutCurrentUser); // Logout

// User profile routes
router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

// Admin routes
router.route("/")
  .get(authenticate, (req, res, next) => {
    if (req.user.isAdmin || req.user.isSuperAdmin) return next();
    res.status(403).json({ error: "Not authorized" });
  }, getAllUsers);

router.route("/:id")
  .get(authenticate, (req, res, next) => {
    if (req.user.isAdmin || req.user.isSuperAdmin) return next();
    res.status(403).json({ error: "Not authorized" });
  }, getUserById)
  .put(authenticate, (req, res, next) => {
    if (req.user.isAdmin || req.user.isSuperAdmin) return next();
    res.status(403).json({ error: "Not authorized" });
  }, updateUserById)
  .delete(authenticate, (req, res, next) => {
    if (req.user.isAdmin || req.user.isSuperAdmin) return next();
    res.status(403).json({ error: "Not authorized" });
  }, deleteUserById);

export default router;
