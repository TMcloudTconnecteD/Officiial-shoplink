import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';


const authenticate = asyncHandler(async (req, res, next) => {
    let token;
    //read jwt token from jwt cookie first
    token = req.cookies && req.cookies.jwt;
    // fallback: Authorization header Bearer <token>
    if (!token && req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password')
          return  next();

        
    } catch (error) {
        console.warn('Authentication failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });


        
    }
    
} else {
    return res.status(401).json({ message: 'Not authorized, no token' });
}


})

// optional authenticate: set req.user when a valid token is present but do NOT fail when missing/invalid
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
    let token;
    // read jwt token from cookie first
    token = req.cookies && req.cookies.jwt;
    // fallback: Authorization header Bearer <token>
    if (!token && req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
        } catch (error) {
            // Do not block the request on optional auth failure
            console.warn('Optional authentication failed:', error.message);
        }
    }

    return next();
});

//check for admin
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401).send('Not Authorized as Shop Admin!😊')

    }
}

const authorizeSuperAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin && req.user.isSuperAdmin) {
        next()
    } else {
        res.status(401).send('Not Authorized!😊')

    }
}

export { authenticate, authorizeAdmin, authorizeSuperAdmin, optionalAuthenticate };