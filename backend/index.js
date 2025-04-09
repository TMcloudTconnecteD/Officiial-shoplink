//console.log('backendddd');
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import connectDB from './config/db.js';


import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
 import productRoutes from './routes/productRoutes.js';
 import uploadRoutes from './routes/uploadRoutes.js';
dotenv.config();
const port = process.env.PORT || 5000;
console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api/users', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/shops', shopRoutes)

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname + '/uploads')))


app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`))