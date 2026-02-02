// server.js
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

const app = express();

// Ensure uploads directory exists at startup (safety for multer)
import fs from 'fs';
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  }
} catch (e) {
  console.warn('Could not create uploads directory at startup', e.message);
}

// Add CORS middleware
const defaultOrigins = ['http://localhost:8000', 'http://localhost:5173'];
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      console.warn('CORS: ALLOW_ALL_ORIGINS is enabled — allowing any origin for this run');
      return cb(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) return cb(null, true);
    console.warn(`CORS blocked request from origin: ${origin}`);
    return cb(null, false);
  },
  credentials: true,
};

app.use((req, res, next) => {
  res.setHeader('X-Allowed-Origins', allowedOrigins.join(','));
  next();
});

app.use(cors(corsOptions));

// Prevent CDN/Edge caching of API endpoints. Some CDNs (e.g. Cloudflare, Render)
// may cache responses for paths that look static — explicitly disable caching
// for all /api/* responses so clients always get fresh data.
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  next();
});

// Startup env validation for critical services
const requiredEnvs = [
  'MONGO_URI',
  // cloudinary keys optional but warned above
];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('⚠️  Missing required environment variables:', missing.join(', '));
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/shops', shopRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/payments', mpesaRoutes);

// Health check endpoint for smoke tests
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

// Debug PDF endpoint: quick way to confirm backend origin is serving PDFs
app.get('/api/debug/receipt-test', (req, res) => {
  try {
    // import PDFDocument locally to avoid increasing startup cost for all processes
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    // identify origin for caching/debugging tools
    res.setHeader('X-Receipt-Source', 'debug-origin');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=debug-receipt.pdf');

    doc.pipe(res);
    doc.fontSize(14).text('Debug Receipt - Backend is reachable', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Timestamp: ${new Date().toISOString()}`);
    doc.end();
  } catch (err) {
    console.error('Debug receipt error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`));
