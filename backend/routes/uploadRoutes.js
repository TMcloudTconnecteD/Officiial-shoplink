import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const router = express.Router();

const fileFilter = (req, file, cb) => {
    const mimetypes = /image\/jpe?g|image\/jpg|image\/png|image\/gif|image\/webp/;
    if (mimetypes.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG, JPG, PNG, GIF and WEBP are allowed!'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // increased to 10MB
    fileFilter
});

const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
    uploadSingleImage(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).send({ 
                        message: 'File is too large. Maximum size is 10MB'
                    });
                }
            }
            return res.status(400).send({ 
                message: err.message,
                error: err.name
            });
        }
        
        if (!req.file) {
            return res.status(400).send({ message: 'Please select an image to upload' });
        }        // Log the full file object for debugging
        console.log('Upload successful. File details:', {
            path: req.file.path,
            secure_url: req.file.secure_url,
            public_id: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Get the Cloudinary URL from the response
        const imageUrl = req.file.secure_url || req.file.path; // Prefer secure_url if available

        if (!imageUrl || (!imageUrl.includes('cloudinary.com') && !imageUrl.startsWith('/uploads/'))) {
            console.error('Invalid image URL:', imageUrl);
            return res.status(400).send({ 
                message: 'Image upload failed - invalid URL received'
            });
        }

        res.status(200).send({
            message: 'Image uploaded successfully',
            image: imageUrl,
            secure_url: req.file.secure_url,
            public_id: req.file.filename
        });
    });
});

export default router;