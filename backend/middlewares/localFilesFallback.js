import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const localFilesFallback = (req, res, next) => {
    if (req.url.startsWith('/uploads/')) {
        // Try to serve from local uploads folder first
        const localPath = path.join(__dirname, '..', req.url);
        
        // Check if file exists before attempting to send
        fs.access(localPath, fs.constants.F_OK, (err) => {
            if (err) {
                // File doesn't exist locally, check if it's a Cloudinary URL
                if (req.url.includes('cloudinary.com')) {
                    // It's a Cloudinary URL, let it pass through
                    next();
                } else {
                    // Try to find a Cloudinary version of the file
                    const filename = path.basename(req.url);
                    // You could implement a lookup in your database here
                    // For now, just pass to next middleware
                    next();
                }
            } else {
                // File exists locally, serve it
                res.sendFile(localPath, (err) => {
                    if (err) {
                        console.error('Error sending local file:', err);
                        next(err);
                    }
                });
            }
        });
    } else {
        next();
    }
};
