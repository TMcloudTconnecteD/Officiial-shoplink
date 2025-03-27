import express from "express";
import { createUser, getAllUsers, logUser,logoutCurrentUser } from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import { get } from "mongoose";
const router = express.Router();

router.route("/").post(createUser).get(authenticate, authorizeAdmin, getAllUsers)

router.post("/auth", logUser)
router.post('/logout', logoutCurrentUser)





export default router;

