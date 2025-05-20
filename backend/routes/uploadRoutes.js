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
    limits: { fileSize: 5000000 }, // increased to 5MB
    fileFilter
});

const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {    uploadSingleImage(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            res.status(400).send({ message: err.message });
        } else if (req.file) {
            console.log('Upload successful:', req.file);
            res.status(200).send({
                message: 'Image uploaded successfully',
                image: req.file.path, // Cloudinary URL
                public_id: req.file.filename // Store this if you need to delete the image later
            });
        } else {
            res.status(400).send({ message: 'Please select an image to upload' });
        }
    });
});

export default router;