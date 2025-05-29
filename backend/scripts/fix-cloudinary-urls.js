import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import Shop from '../models/shopModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required in .env file');
  process.exit(1);
}

if (!CLOUDINARY_CLOUD_NAME) {
  console.error('CLOUDINARY_CLOUD_NAME is required in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixCloudinaryUrls() {
  try {
    // Fix product image URLs
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    let productUpdatedCount = 0;
    let productErrorCount = 0;

    for (const product of products) {
      try {
        if (!product.image) {
          console.log(`Product ${product._id} has no image, skipping`);
          continue;
        }

        // Check if the image URL needs to be fixed
        if (!product.image.includes('res.cloudinary.com')) {
          const filename = product.image.split(/[\/\\]/).pop();
          console.log(`Fixing image URL for product ${product._id} (${filename})`);

          product.image = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/shoplink/${filename}`;
          await product.save();
          productUpdatedCount++;
          console.log(`✅ Updated image URL for product ${product._id}`);
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

    for (const shop of shops) {
      try {
        if (!shop.image) {
          console.log(`Shop ${shop._id} has no image, skipping`);
          continue;
        }

        // Check if the image URL needs to be fixed
        if (!shop.image.includes('res.cloudinary.com')) {
          const filename = shop.image.split(/[\/\\]/).pop();
          console.log(`Fixing image URL for shop ${shop._id} (${filename})`);

          shop.image = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/shoplink/${filename}`;
          await shop.save();
          shopUpdatedCount++;
          console.log(`✅ Updated image URL for shop ${shop._id}`);
        }
      } catch (err) {
        console.error(`❌ Error updating shop ${shop._id}:`, err.message);
        shopErrorCount++;
      }
    }

    console.log('\nURL fix completed!');
    console.log(`Products - Updated: ${productUpdatedCount}, Errors: ${productErrorCount}`);
    console.log(`Shops - Updated: ${shopUpdatedCount}, Errors: ${shopErrorCount}`);

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCloudinaryUrls(); 