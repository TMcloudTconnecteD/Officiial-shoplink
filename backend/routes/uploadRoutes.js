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
  // Log incoming file details
  console.log('Incoming file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only jpg, jpeg, png, and webp files are allowed. Got ${mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  // Log request details
  console.log('Upload request received:', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    body: req.body
  });

  uploadSingleImage(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size is too large. Maximum size is 2MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        success: false,
        message: "Please upload an image file"
      });
    }

    try {
      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
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