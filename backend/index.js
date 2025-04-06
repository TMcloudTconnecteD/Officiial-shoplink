//console.log('backendddd');
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import connectDB from './config/db.js';


import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';


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
//app.use('/api/products', productRoutes)

app.listen(port, '0.0.0.0', () => console.log(`server is running on port: ${port}`))