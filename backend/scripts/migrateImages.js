const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../models/productModel');

// Load environment variables
dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../uploads');
console.log('Starting migration from:', uploadsDir);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function migrateImages() {
    try {
        // Get all files from uploads directory
        const files = fs.readdirSync(uploadsDir);
        console.log(`Found ${files.length} files to migrate`);

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            
            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'shoplink/products',
                    resource_type: 'auto'
                });
                
                // Update product in database
                const oldPath = `/uploads/${file}`;
                const product = await Product.findOne({ image: oldPath });
                
                if (product) {
                    product.image = result.secure_url;
                    await product.save();
                    console.log(`✅ Migrated ${file} -> ${result.secure_url}`);
                } else {
                    console.log(`⚠️ No product found for image: ${file}`);
                }
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err.message);
            }
        }
        
        console.log('Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImages();
