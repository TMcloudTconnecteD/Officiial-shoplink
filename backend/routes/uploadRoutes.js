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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter
});

const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
    uploadSingleImage(req, res, async (err) => {
        try {
            // Handle multer and general errors
            if (err) {
                console.error('Upload error:', err);
                
                // Handle specific multer errors
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(413).send({ 
                            success: false,
                            message: 'File is too large. Maximum size is 10MB'
                        });
                    }
                }

                // Handle Cloudinary-specific errors
                if (err.name === 'Error' && err.message.includes('Cloudinary')) {
                    return res.status(400).send({
                        success: false,
                        message: 'Failed to upload image to Cloudinary',
                        error: err.message
                    });
                }

                // Handle any other errors
                return res.status(400).send({
                    success: false,
                    message: err.message || 'Error uploading file',
                    error: err.name
                });
            }

            // Check if file was provided
            if (!req.file) {
                return res.status(400).send({ 
                    success: false,
                    message: 'Please select an image to upload' 
                });
            }

            // Log successful upload details
            console.log('Upload successful. File details:', {
                path: req.file.path,
                secure_url: req.file.secure_url,
                public_id: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            // Validate Cloudinary response
            if (!req.file.secure_url || !req.file.secure_url.includes('cloudinary.com')) {
                console.error('Invalid Cloudinary URL:', req.file.secure_url);
                return res.status(400).send({
                    success: false,
                    message: 'Image upload failed - invalid URL received from Cloudinary'
                });
            }            // Send successful response
            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                image: req.file.secure_url,  // This matches what the frontend expects
                public_id: req.file.filename
            });

        } catch (error) {
            console.error('Unexpected error during upload:', error);
            res.status(500).send({
                success: false,
                message: 'An unexpected error occurred while uploading the image',
                error: error.message
            });
        }
    });
});

export default router;