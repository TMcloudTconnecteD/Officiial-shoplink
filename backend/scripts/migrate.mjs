import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get the uploads directory path
const uploadsDir = path.resolve('C:/Users/ADMN/desktop/officiial-shoplink/uploads');
console.log('Process working directory:', process.cwd());
console.log('Uploads directory path:', uploadsDir);

async function migrateImages() {
    try {
        console.log('Starting migration from:', uploadsDir);
        
        // Get all files from uploads directory
        const files = await fs.readdir(uploadsDir);
        console.log(`Found ${files.length} files to migrate`);

        // Create a processed directory if it doesn't exist
        const processedDir = path.join(uploadsDir, 'processed');
        await fs.mkdir(processedDir, { recursive: true });

        for (const file of files) {
            // Skip the processed directory itself
            if (file === 'processed') continue;
            
            const filePath = path.join(uploadsDir, file);
            
            try {
                // Check if file exists and is an image
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) {
                    console.log(`Skipping directory: ${file}`);
                    continue;
                }

                if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    console.log(`Skipping non-image file: ${file}`);
                    continue;
                }

                // Upload to Cloudinary
                console.log(`Uploading ${file} to Cloudinary...`);
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'shoplink/products',
                    resource_type: 'auto',
                    use_filename: true
                });
                
                console.log(`✅ Successfully uploaded ${file} -> ${result.secure_url}`);
                
                // Move the processed file to processed directory
                await fs.rename(filePath, path.join(processedDir, file));
                console.log(`Moved ${file} to processed directory`);
                
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err.message);
            }
        }
        
        console.log('\nMigration completed! All images have been uploaded to Cloudinary.');
        console.log('Processed images have been moved to the "processed" directory.');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run the migration
migrateImages();
