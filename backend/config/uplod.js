import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config(); // Load .env

// Configure Cloudinary explicitly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filePath = '/home/tm/Pictures/Screenshots/screen.png'; // Replace with your file path

cloudinary.uploader.upload(filePath, { folder: "shoplink_uploads" })
  .then(result => {
    console.log("✅ Upload Success:", result.secure_url);
    console.log("Full Result:", result);
  })
  .catch(error => {
    console.error("❌ Upload Error:", error);
  });
