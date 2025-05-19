const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(__dirname, '../../uploads');

async function migrateImages() {
    try {
        // Get all files from uploads directory
        const files = await fs.readdir(uploadsDir);
        console.log(`Found ${files.length} files to migrate from ${uploadsDir}`);

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            
            try {
                // Check if file exists and is an image
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) continue;
                
                if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    console.log(`Skipping non-image file: ${file}`);
                    continue;
                }

                // Upload to Cloudinary
                console.log(`Uploading ${file} to Cloudinary...`);
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'shoplink/products',
                    resource_type: 'auto'
                });
                
                console.log(`✅ Successfully uploaded ${file} -> ${result.secure_url}`);
                
                // Optional: Move processed file to a backup directory
                const backupDir = path.join(uploadsDir, 'processed');
                await fs.mkdir(backupDir, { recursive: true });
                await fs.rename(filePath, path.join(backupDir, file));
                
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err.message);
            }
        }
        
        console.log('Migration completed!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
migrateImages();
