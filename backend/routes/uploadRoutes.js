import path from "path";
import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoplink',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  // Add request logging
  console.log('Upload request received:', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });

  uploadSingleImage(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File size is too large. Max size is 2MB'
          : err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    try {
      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        path: req.file.path
      });

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          secure_url: req.file.path, // This is the Cloudinary secure URL
          public_id: req.file.filename
        }
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({
        success: false,
        message: "Error uploading image to Cloudinary",
        error: error.message
      });
    }
  });
});

export default router;