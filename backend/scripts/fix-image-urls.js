import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

// Fallback values if .env is not accessible
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hillarygerald76:3W9RK474GedFpuEL@shoplinkbackend.7tmvd.mongodb.net/?retryWrites=true&w=majority&appName=shoplinkbackend';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgnxkbg3i';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixImageUrls() {
  try {
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        if (!product.image) {
          console.log(`Product ${product._id} has no image, skipping`);
          continue;
        }

        // Check if the image URL is already a Cloudinary URL
        if (!product.image.includes('cloudinary.com')) {
          // If it's an old local path, try to find the corresponding Cloudinary URL
          const filename = product.image.split('/').pop();
          console.log(`Fixing image URL for product ${product._id} (${filename})`);

          // Update the product with the new Cloudinary URL
          product.image = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/shoplink/products/${filename}`;
          await product.save();
          updatedCount++;
          console.log(`✅ Updated image URL for product ${product._id}`);
        }
      } catch (err) {
        console.error(`❌ Error updating product ${product._id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\nImage URL fix completed!');
    console.log(`Updated: ${updatedCount} products`);
    console.log(`Errors: ${errorCount} products`);

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
fixImageUrls(); 