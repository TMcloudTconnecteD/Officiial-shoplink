import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';

dotenv.config();
const port = process.env.PORT || 8000;
//console.log("MONGO_URI:", process.env.MONGO_URI.);

connectDB();

// Configure Cloudinary centrally so routes do not need to re-configure
import { v2 as cloudinary } from 'cloudinary';
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured.');
} else {
  console.warn('Cloudinary not fully configured - missing env vars.');
}

const app = express()

// Add CORS middleware
const corsOptions = {
  origin: ['http://localhost:8000', 'http://localhost:5173',' https://b075-129-222-187-221.ngrok-free.app'], // Added localhost:5173 and localtunnel URL
  credentials: true,
};
app.use(cors(corsOptions));

// Startup env validation for critical services
const requiredEnvs = [
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('⚠️  Missing required environment variables:', missing.join(', '));
  console.warn('Uploads or DB connections may fail until these are set.');
}

// Simple request logger to help reproduce 500s during development
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

// Add request logging middleware
//app.use((req, res, next) => {
  //console.log(`Incoming request: ${req.method} ${req.url}`);
  //next();
//});

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api/users', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/shops', shopRoutes)
app.use("/api/orders", orderRoutes)
app.use('/api/payments', mpesaRoutes)

// Health check endpoint for smoke tests (safe: doesn't expose secrets)
app.get('/api/health', (req, res) => {
  const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  const mongoConfigured = Boolean(process.env.MONGO_URI);
  res.json({
    status: 'ok',
    cloudinaryConfigured,
    mongoConfigured,
    env: process.env.NODE_ENV || 'development',
  });
});

app.get("/api/config/paypal", (req, res) => {
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname + '/uploads')))

app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`))
