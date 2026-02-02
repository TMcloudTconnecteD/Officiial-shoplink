import express from "express";
import { createUser, deleteUserById, getAllUsers, getCurrentUserProfile, getUserById, logUser,logoutCurrentUser, updateCurrentUserProfile, updateUserById } from "../controllers/userController.js";
import { authenticate, authorizeAdmin, authorizeSuperAdmin } from "../middlewares/authMiddlewares.js";
import { get } from "mongoose";
const router = express.Router();

router.route("/").post(createUser)
.get(authenticate, authorizeAdmin, authorizeSuperAdmin, getAllUsers)

router.post("/auth", logUser)
router.post('/clerk', async (req, res) => {
	// Endpoint to create/find a user coming from Clerk.
	// If CLERK_SECRET_KEY is set and a Clerk token is provided in Authorization, attempt verification.
	try {
		const { email, username } = req.body;
		if (!email) return res.status(400).json({ message: 'Email required' });

		// optional verification
		const authHeader = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
		if (authHeader && process.env.CLERK_SECRET_KEY) {
			try {
				const { Clerk } = await import('@clerk/clerk-sdk-node');
				const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
				// best-effort verification: try to verify session token
				let verified = null;
				if (clerk?.sessions?.verifySessionToken) {
					verified = await clerk.sessions.verifySessionToken(authHeader);
				}
				// if verified has user_id we can trust it; else continue but log
				if (!verified) console.warn('Clerk token present but verification returned empty');
			} catch (err) {
				console.warn('Clerk verification skipped/failed:', err.message || err);
			}
		}

		// lazy import to avoid circular issues
		const User = (await import('../models/userModel.js')).default;
		const createToken = (await import('../utils/createToken.js')).default;

		let user = await User.findOne({ email });
		if (!user) {
			// create a random password (user will log in via Clerk)
			const bcrypt = await import('bcryptjs');
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
			user = new User({ username: username || email.split('@')[0], email, password: hashedPassword });
			await user.save();
		}

		const token = createToken(res, user._id);
		return res.status(200).json({ _id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, token });
	} catch (err) {
		console.error('clerk sync error', err);
		return res.status(500).json({ message: 'Clerk sync failed' });
	}
});
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



