import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";
import Referral from "../models/referralModel.js";


const createUser = asyncHandler(async (req, res) => {
const {username, password} = req.body;
const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
const referralCode = typeof req.body?.referralCode === "string"
    ? req.body.referralCode.trim().toUpperCase()
    : "";


if(!username || !email || !password){
    throw new Error("All fields are required..bruuuh!🤦‍♀️")
}

const userExists = await User.findOne({email});
if (userExists) return res.status(400).send( "User already exists!💜")

const referrer = referralCode ? await User.findOne({ referralCode }).select("_id") : null;
if (referralCode && !referrer) {
    return res.status(400).json({ message: "That referral code is not valid." });
}

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({username, email, password: hashedPassword});
    let userSaved = false;
    try {
        await newUser.save();
        userSaved = true;
        if (referrer && referrer._id.toString() !== newUser._id.toString()) {
            try {
                await Referral.create({
                    referrer: referrer._id,
                    referredUser: newUser._id,
                    code: referralCode,
                });
            } catch (error) {
                await User.deleteOne({ _id: newUser._id });
                userSaved = false;
                throw error;
            }
        }
        createToken(res, newUser._id);
        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            isSuperAdmin: newUser.isSuperAdmin,
            referralCode: newUser.referralCode,
            pointsBalance: newUser.pointsBalance,
        });
    } catch (error) {
        if (userSaved) await User.deleteOne({ _id: newUser._id });
        console.error("User registration failed:", error);
        res.status(500).json({ message: error.message || "User registration failed." });
    }


})

const logUser = asyncHandler(async (req, res) => {
const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
const {password} = req.body || {};
if (!email || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required" });
}

if (User.db.readyState !== 1) {
    return res.status(503).json({ message: "Login is temporarily unavailable while the database reconnects. Please retry shortly." });
}

let existingUser;
try {
    existingUser = await User.findOne({email}).maxTimeMS(8000);
} catch (error) {
    console.error("Login user lookup failed:", error.message);
    return res.status(503).json({ message: "Login could not reach the account database. Please retry shortly." });
}

if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
}

const token = createToken(res, existingUser._id);
return res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
    isSuperAdmin: existingUser.isSuperAdmin,
    isSeller: existingUser.isSeller,
    sellerStatus: existingUser.sellerStatus,
    sellerShop: existingUser.sellerShop,
    referralCode: existingUser.referralCode,
    pointsBalance: existingUser.pointsBalance,
    token,
});
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
    
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),

    })
    //CHECK FOR POSSBLY WRTNG RES,SEND LOGGED OUT SUCCESSFULLY....
    res.status(200).json("Logged out successfully!👋")

})

const getAllUsers = asyncHandler(async (req, res) => {
const users = await User.find({});
res.status(200).json(users)



})
const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
         res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            isSuperAdmin: user.isSuperAdmin,
            isSeller: user.isSeller,
            sellerStatus: user.sellerStatus,
            sellerShop: user.sellerShop,
            referralCode: user.referralCode,
            pointsBalance: user.pointsBalance,
            monthlyPasswordReminderEnabled: user.monthlyPasswordReminderEnabled,
         })
        } else {
            res.status(404)
            throw new Error("User not found!💔")

        }


})
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "password")) {
        return res.status(400).json({ message: "Change your password using the password form." });
    }

    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required." });
    }
    if (typeof req.body?.monthlyPasswordReminderEnabled !== "boolean") {
        return res.status(400).json({ message: "Choose whether to enable monthly password reminders." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.username = username;
    user.email = email;
    if (req.body.monthlyPasswordReminderEnabled && !user.monthlyPasswordReminderEnabled) {
        user.lastPasswordReminderAt = new Date();
    }
    user.monthlyPasswordReminderEnabled = req.body.monthlyPasswordReminderEnabled;

    try {
        const updatedUser = await user.save();
        return res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isSuperAdmin: updatedUser.isSuperAdmin,
            isSeller: updatedUser.isSeller,
            sellerStatus: updatedUser.sellerStatus,
            sellerShop: updatedUser.sellerShop,
            referralCode: updatedUser.referralCode,
            pointsBalance: updatedUser.pointsBalance,
            monthlyPasswordReminderEnabled: updatedUser.monthlyPasswordReminderEnabled,
        });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "That username or email is already in use." });
        throw error;
    }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || !currentPassword || typeof newPassword !== "string" || !newPassword) {
        return res.status(400).json({ message: "Enter your current password and a new password." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Your new password must be at least 6 characters." });
    }
    if (currentPassword === newPassword) {
        return res.status(400).json({ message: "Choose a new password different from your current password." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: "Your current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    return res.json({ message: "Password updated successfully." });
});

const deleteUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
        if (user.isAdmin) {
            res.status(400)
            throw new Error("You can't delete an admin!💔")
        }
        await User.deleteOne({_id: user._id})
        res.json({message: "User deleted successfully!👋"})

    } else {
        res.status(404)
        throw new Error("User not found!💔")

    }



})

const getUserById = asyncHandler(async (req, res) => {
    //get all user data but user password!!
const user = await User.findById(req.params.id).select("-password")
if (user) {
    res.json(user)
} else {
    res.status(404)
    throw new Error("User not found!💔")

}



})

const updateUserById = asyncHandler(async (req, res) => {
const user = await User.findById(req.params.id)
if (user) {
    const wasAdmin = user.isAdmin;
    user.username = req.body.username || user.username
    user.email = req.body.email || user.email
    if (typeof req.body.isAdmin === "boolean") {
        user.isAdmin = req.body.isAdmin;
    }
    const updatedUser = await user.save()

    if (!wasAdmin && updatedUser.isAdmin) {
        const notice = {
            type: "system",
            title: "ShopLink admin access approved",
            message: "Your account has been granted ShopLink admin access.",
        };
        const results = await Promise.allSettled([
            notifyUser(updatedUser._id, { ...notice, link: "/admin/dashboard" }),
            notifyAdmins({ ...notice, link: "/admin/users" }, updatedUser._id),
        ]);
        results.filter((result) => result.status === "rejected")
            .forEach((result) => console.error("Seller approval notification failed:", result.reason));
    }

    res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
})
} else {
    res.status(404)
    throw new Error("User not found!💔")

}



})

export {createUser, 
        logUser,
        logoutCurrentUser,
        getAllUsers,
        getCurrentUserProfile,
        updateCurrentUserProfile,
        changeCurrentUserPassword,
        deleteUserById,
        getUserById,
        updateUserById
    };
