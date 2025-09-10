import jwt from 'jsonwebtoken';

const createToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // In production the frontend and backend are on different origins.
    // Cookies must be set with SameSite='none' and secure=true to be sent cross-site.
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProd, // true in production
        sameSite: isProd ? 'none' : 'lax', // allow cross-site in prod; use lax for dev convenience
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export default createToken;