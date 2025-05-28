import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Fallbacks in case environment variables are not available
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgnxkbg3i';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '829231834578378';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'Xzt2gWaKBrue90uY940zcwyejyg';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shoplink/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
      { flags: 'progressive' }
    ],
    format: 'auto',
    resource_type: 'auto',
    unique_filename: true,
    overwrite: true,
    use_filename: true,
    public_id: (req, file) => {
      const timestamp = Date.now();
      const filename = file.originalname.split('.')[0];
      return `image-${timestamp}`;
    },
    secure: true,
    timeout: 60000 // 60 second timeout
  }
});

export { cloudinary, storage };
