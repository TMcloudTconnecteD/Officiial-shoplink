import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";


const createUser = asyncHandler(async (req, res) => {
const {username, password} = req.body;
const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";


if(!username || !email || !password){
    throw new Error("All fields are required..bruuuh!🤦‍♀️")
}

const userExists = await User.findOne({email});
if (userExists) return res.status(400).send( "User already exists!💜")

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({username, email, password: hashedPassword});

        try {
            await newUser.save()
            createToken(res, newUser._id)
            res.status(201).json({
                _id: newUser._id,
                 username: newUser.username, 
                 email: newUser.email,
                  isAdmin: newUser.isAdmin, 
                  
                  })



        } catch (error) {
            res.status(400)
             throw new Error("User not created!💔")
            
    }


})

const logUser = asyncHandler(async (req, res) => {
const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
const {password} = req.body || {};
if (!email || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required" });
}

const existingUser = await User.findOne({email});
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
         })
        } else {
            res.status(404)
            throw new Error("User not found!💔")

        }


})
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
const user = await User.findById(req.user._id);
if (user) {
    user.username = req.body.username || user.username
    user.email = req.body.email || user.email
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;

    }
const updatedUser = await user.save();
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
    user.username = req.body.username || user.username
    user.email = req.body.email || user.email
    user.isAdmin = Boolean(req.body.isAdmin)
    const updatedUser = await user.save()

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
        deleteUserById,
        getUserById,
        updateUserById
    };
