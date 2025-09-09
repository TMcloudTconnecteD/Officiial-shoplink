import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = express.Router();

// Use Multer to temporarily store files before pushing them to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|jpg|png|gif|webp/;
  const mimetypes = /image\/jpe?g|image\/jpg|image\/png|image\/gif|image\/webp/;

  const fileExt = path.extname(file.originalname).toLowerCase();
  const extnameValid = filetypes.test(fileExt);
  const mimetypeValid = mimetypes.test(file.mimetype);

  if (extnameValid && mimetypeValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, JPG, PNG, GIF, and WEBP are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

const uploadSingleImage = upload.single('image');

// ✅ Upload API Route
router.post('/', (req, res) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    } else if (req.file) {
      try {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'shoplink_uploads',
        });

        // Delete local file after upload (guarded)
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (fsErr) {
          console.warn('Warning: failed to delete temp upload file', fsErr.message);
        }

        return res.status(200).json({
          message: 'Image uploaded successfully',
          imageUrl: result.secure_url,
        });
      } catch (error) {
        console.error('Cloudinary upload failed:', error && error.message ? error.message : error);
        const errMsg = error && error.message ? error.message : 'Unknown Cloudinary error';
        return res.status(500).json({ message: 'Cloudinary upload failed', error: errMsg });
      }
    } else {
      return res.status(400).json({ message: 'Please select an image to upload' });
    }
  });
});

export default router;
