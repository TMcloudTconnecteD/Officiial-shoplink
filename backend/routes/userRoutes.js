import express from "express";
import { createUser, logUser,logoutCurrentUser } from "../controllers/userController.js";
const router = express.Router();

router.route("/").post(createUser);

router.post("/auth", logUser)
router.post('/logout', logoutCurrentUser)




export default router;

