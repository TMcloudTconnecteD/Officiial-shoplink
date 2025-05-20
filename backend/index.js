import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { localFilesFallback } from './middlewares/localFilesFallback.js';

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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors(corsOptions))

// Serve local files during transition
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(localFilesFallback);

app.use('/api/users', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/shops', shopRoutes)
app.use("/api/orders", orderRoutes)
app.use('/api/payments', mpesaRoutes)

app.get("/api/config/paypal", (req, res) => {
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.use('/uploads', express.static(path.join(__dirname + '/uploads')))

app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`))
