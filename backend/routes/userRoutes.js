import express from "express";
import { createUser, deleteUserById, getAllUsers, getCurrentUserProfile, getUserById, logUser,logoutCurrentUser, updateCurrentUserProfile, updateUserById } from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import { get } from "mongoose";
const router = express.Router();

router.route("/").post(createUser)
.get(authenticate, authorizeAdmin, getAllUsers)

router.post("/auth", logUser)
router.post('/logout', logoutCurrentUser)


router.route('/profile')
.get(authenticate, getCurrentUserProfile)
.put( authenticate, updateCurrentUserProfile)


//admin routes!!👇
router.route('/:id')
.delete(authenticate, authorizeAdmin, deleteUserById)
.get(authenticate, authorizeAdmin, getUserById)
.put(authenticate, authorizeAdmin, updateUserById)

export default router;

