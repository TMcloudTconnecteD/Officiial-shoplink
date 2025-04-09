import express from "express";
import { createUser, deleteUserById, getAllUsers, getCurrentUserProfile, getUserById, logUser,logoutCurrentUser, updateCurrentUserProfile, updateUserById } from "../controllers/userController.js";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import { get } from "mongoose";
const router = express.Router();

router.route("/").post(createUser)
.get(authenticate, authorizeAdmin, authorizeSuperAdmin, getAllUsers)

router.post("/auth", logUser)
router.post('/logout', logoutCurrentUser)


router.route('/profile')
.get(authenticate, getCurrentUserProfile)
.put( authenticate, updateCurrentUserProfile)


//admin routes!!👇
router.route('/:id')
.delete(authenticate, authorizeAdmin, authorizeSuperAdmin,deleteUserById)
.get(authenticate, authorizeAdmin,authorizeSuperAdmin, getUserById)
.put(authenticate, authorizeAdmin, authorizeSuperAdmin,updateUserById)

export default router;

