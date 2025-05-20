import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const localFilesFallback = (req, res, next) => {
    if (req.url.startsWith('/uploads/')) {
        // Try to serve from local uploads folder first
        const localPath = path.join(__dirname, '..', req.url);
        res.sendFile(localPath, (err) => {
            if (err) {
                // If local file not found, let the request continue
                // It might be handled by Cloudinary URL
                next();
            }
        });
    } else {
        next();
    }
};
