import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';

const __dirname = path.resolve();
dotenv.config();
const port = process.env.PORT || 8000;
//console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

const app = express()

// Add CORS middleware
const corsOptions = {
  origin: [
    'http://localhost:8000',
    'http://localhost:5173',
    
    'https://shop-link.onrender.com',
    'http://shop-link.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable pre-flight requests
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });
  next();
});

// Body parsing middleware - must come before routes
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    const contentType = req.headers['content-type'] || '';
    // Skip JSON parsing for multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      return;
    }
    try {
      JSON.parse(buf);
    } catch(e) {
      console.error('JSON parse error:', e);
      return;
    }
  }
}));

// Handle URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging middleware with more details
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Cookie parsing middleware
app.use(cookieParser());

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Add request logging middleware
//app.use((req, res, next) => {
  //console.log(`Incoming request: ${req.method} ${req.url}`);
  //next();
//});

// Serve local files during transition
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', mpesaRoutes);

app.get('/api/config/paypal', (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Global error handler to always return JSON
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err,
    url: req.url,
    method: req.method,
    contentType: req.headers['content-type']
  });

  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    // For multipart/form-data requests, skip the error
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid request format',
      error: 'Bad Request'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.name || 'Error'
  });
});

app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`))
