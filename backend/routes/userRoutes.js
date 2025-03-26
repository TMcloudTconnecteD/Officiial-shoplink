import express from "express";
import { createUser, logUser } from "../controllers/userController.js";
const router = express.Router();

router.route("/").post(createUser);

router.post("/auth", logUser)




export default router;

