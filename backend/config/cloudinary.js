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
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

export { cloudinary, storage };
