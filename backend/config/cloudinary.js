import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: 'dgnxkbg3i',
    api_key: '829231834578378',
    api_secret: 'Xzt2gWaKBrue90uY940zcwyejyg'
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'shoplink/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Increased size limit
            { quality: 'auto', fetch_format: 'auto' } // Auto optimize quality and format
        ],
        format: 'jpg', // Default format
        resource_type: 'auto' // Auto-detect resource type
    }
});

export { cloudinary, storage };
