import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import Shop from '../models/shopModel.js';

dotenv.config();

// Use environment variables with fallback values
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hillarygerald76:3W9RK474GedFpuEL@shoplinkbackend.7tmvd.mongodb.net/?retryWrites=true&w=majority&appName=shoplinkbackend';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgnxkbg3i';

console.log('Using MongoDB URI:', MONGODB_URI);
console.log('Using Cloudinary cloud name:', CLOUDINARY_CLOUD_NAME);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

function needsUrlFix(url) {
  if (!url) return false;
  
  // Check for backslashes
  if (url.includes('\\')) return true;
  
  // Check for double forward slashes (except after http/https)
  if (url.match(/([^:])\/\//)) return true;
  
  // Check if it's not a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) return true;
  
  return false;
}

async function fixCloudinaryUrls() {
  try {
    // Fix product image URLs
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    let productUpdatedCount = 0;
    let productErrorCount = 0;
    let productSkippedCount = 0;

    for (const product of products) {
      try {
        if (!product.image) {
          console.log(`Product ${product._id} has no image, skipping`);
          productSkippedCount++;
          continue;
        }

        if (!needsUrlFix(product.image)) {
          productSkippedCount++;
          continue;
        }

        // Clean up the URL
        let newUrl = product.image;
        
        // Replace backslashes with forward slashes
        newUrl = newUrl.replace(/\\/g, '/');
        
        // Fix double forward slashes (except after http/https)
        newUrl = newUrl.replace(/([^:])\/+/g, '$1/');
        
        // Ensure proper Cloudinary URL format
        if (!newUrl.includes('res.cloudinary.com')) {
          const filename = newUrl.split('/').pop();
          newUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/shoplink/${filename}`;
        }

        if (newUrl !== product.image) {
          console.log(`✅ Updating image URL for product ${product._id}`);
          console.log(`   Old: ${product.image}`);
          console.log(`   New: ${newUrl}`);
          
          product.image = newUrl;
          await product.save();
          productUpdatedCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating product ${product._id}:`, err.message);
        productErrorCount++;
      }
    }

    // Fix shop image URLs
    const shops = await Shop.find({});
    console.log(`\nFound ${shops.length} shops to check`);

    let shopUpdatedCount = 0;
    let shopErrorCount = 0;
    let shopSkippedCount = 0;

    for (const shop of shops) {
      try {
        if (!shop.image) {
          console.log(`Shop ${shop._id} has no image, skipping`);
          shopSkippedCount++;
          continue;
        }

        if (!needsUrlFix(shop.image)) {
          shopSkippedCount++;
          continue;
        }

        // Clean up the URL
        let newUrl = shop.image;
        
        // Replace backslashes with forward slashes
        newUrl = newUrl.replace(/\\/g, '/');
        
        // Fix double forward slashes (except after http/https)
        newUrl = newUrl.replace(/([^:])\/+/g, '$1/');
        
        // Ensure proper Cloudinary URL format
        if (!newUrl.includes('res.cloudinary.com')) {
          const filename = newUrl.split('/').pop();
          newUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/shoplink/${filename}`;
        }

        if (newUrl !== shop.image) {
          console.log(`✅ Updating image URL for shop ${shop._id}`);
          console.log(`   Old: ${shop.image}`);
          console.log(`   New: ${newUrl}`);
          
          shop.image = newUrl;
          await shop.save();
          shopUpdatedCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating shop ${shop._id}:`, err.message);
        shopErrorCount++;
      }
    }

    console.log('\nURL fix completed!');
    console.log(`Products - Updated: ${productUpdatedCount}, Skipped: ${productSkippedCount}, Errors: ${productErrorCount}`);
    console.log(`Shops - Updated: ${shopUpdatedCount}, Skipped: ${shopSkippedCount}, Errors: ${shopErrorCount}`);

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCloudinaryUrls(); 