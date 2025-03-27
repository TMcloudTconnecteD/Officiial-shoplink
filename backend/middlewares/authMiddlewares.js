import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';


const authenticate = asyncHandler(async (req, res, next) => {
let token;
//read jwt token from jwt cookie

token = req.cookies.jwt;
if (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password')
          return  next();

        
    } catch (error) {
        return res.status(401)
         throw new Error('Not authorized, token failed')


        
    }
    
} else {
    return res.status(401)
    throw new Error('Not authorized, no token')

}

})

//check for admin
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401).send('Not Admin bruuh!😊')

    }
}

export { authenticate, authorizeAdmin };