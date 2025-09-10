import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists and use an absolute path to avoid ENOENT
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  }
} catch (e) {
  console.warn('Could not create uploads directory', e.message);
}

// Use Multer to temporarily store files before pushing them to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB (temporarily increased for debugging)
  fileFilter,
});

const uploadSingleImage = upload.single('image');

// ✅ Upload API Route
router.post('/', (req, res) => {
  // debug: print headers to help diagnose client issues
  console.log('Upload headers:', Object.fromEntries(Object.entries(req.headers).filter(([k]) => k.startsWith('content-') || k === 'origin')));
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      console.warn('Multer error on upload:', err && err.message ? err.message : err);
      return res.status(400).json({ message: err.message });
    } else if (req.file) {
      console.log('Upload received file:', { fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype });
      // Helper to upload with a timeout and optional retries
      const uploadWithTimeout = (filePath, options = {}, timeoutMs = 20000, retries = 1) => {
        return new Promise((resolve, reject) => {
          let attempts = 0;

          const attempt = () => {
            attempts += 1;
            let timedOut = false;
            const timer = setTimeout(() => {
              timedOut = true;
              // Cloudinary SDK won't cancel the underlying request, but we'll treat as timeout
              const err = new Error('Cloudinary upload timed out');
              err.code = 'UPLOAD_TIMEOUT';
              reject(err);
            }, timeoutMs);

            cloudinary.uploader.upload(filePath, options)
              .then((result) => {
                if (timedOut) return; // Already rejected
                clearTimeout(timer);
                resolve(result);
              })
              .catch((err) => {
                clearTimeout(timer);
                if (attempts <= retries) {
                  // small backoff
                  setTimeout(attempt, 500 * attempts);
                } else {
                  reject(err);
                }
              });
          };

          attempt();
        });
      };

      try {
        const result = await uploadWithTimeout(req.file.path, { folder: 'shoplink_uploads' }, 20000, 2);

        return res.status(200).json({
          message: 'Image uploaded successfully',
          imageUrl: result.secure_url,
        });
      } catch (error) {
        console.error('Cloudinary upload failed:', error && error.message ? error.message : error);
        const errMsg = error && error.message ? error.message : 'Unknown Cloudinary error';
        return res.status(500).json({ message: 'Cloudinary upload failed', error: errMsg });
      } finally {
        // Ensure temp file is removed in all cases
        try {
          if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (fsErr) {
          console.warn('Warning: failed to delete temp upload file in finally', fsErr.message);
        }
      }
    } else {
      return res.status(400).json({ message: 'Please select an image to upload' });
    }
  });
});

export default router;
