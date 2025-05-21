import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
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
        use_filename: false, // Don't use original filename
        public_id: (req, file) => {
            const timestamp = Date.now();
            const extension = file.originalname.split('.').pop();
            return `image-${timestamp}`;
        },
        secure: true // Always use HTTPS
    }
});

export { cloudinary, storage };
