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
    console.log('Incoming request headers:', req.headers);
    console.log('Incoming request body:', req.body);

    uploadSingleImage(req, res, async (err) => {
        try {
            if (err) {
                console.error('Upload error:', err);
                if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).send({ 
                        success: false,
                        message: 'File is too large. Maximum size is 10MB'
                    });
                }
                return res.status(400).send({
                    success: false,
                    message: err.message || 'Error uploading file',
                    error: err.name
                });
            }

            if (!req.file) {
                console.error('No file received in the request.');
                return res.status(400).send({ 
                    success: false,
                    message: 'Please select an image to upload' 
                });
            }

            console.log('File received:', req.file);

            const { path, secure_url, public_id, mimetype, size } = req.file;
            if (!secure_url || !secure_url.includes('cloudinary.com')) {
                console.error('Invalid Cloudinary URL:', secure_url);
                return res.status(400).send({
                    success: false,
                    message: 'Image upload failed - invalid URL received from Cloudinary'
                });
            }

            res.status(200).send({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    path,
                    secure_url,
                    public_id,
                    mimetype,
                    size
                }
            });
        } catch (error) {
            console.error('Unexpected error during upload:', error);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});

export default router;