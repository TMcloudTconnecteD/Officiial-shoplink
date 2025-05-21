import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { cloudinary } from '../config/cloudinary.js';

export const localFilesFallback = async (req, res, next) => {
    // If it's a Cloudinary URL, let it pass through
    if (req.url.includes('cloudinary.com')) {
        return next();
    }

    // If it's a local upload request, handle it
    if (req.url.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', req.url);
        
        try {
            // Check if file exists locally
            await fs.access(localPath, fs.constants.F_OK);
            
            // If we find it locally, serve it
            res.sendFile(localPath, (err) => {
                if (err) {
                    console.error('Error sending local file:', err);
                    next(err);
                }
            });
        } catch (err) {
            // If file doesn't exist locally, try to find it in Cloudinary
            try {
                const filename = path.basename(req.url);
                // Search in Cloudinary
                const result = await cloudinary.search
                    .expression(`filename:${filename}*`)
                    .execute();
                
                if (result.resources.length > 0) {
                    // Redirect to the Cloudinary URL
                    res.redirect(result.resources[0].secure_url);
                } else {
                    // If not found anywhere, pass to next handler
                    next();
                }
            } catch (cloudinaryErr) {
                console.error('Cloudinary search error:', cloudinaryErr);
                next();
            }
        }
    } else {
        next();
    }
};
