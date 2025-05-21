import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(__dirname, '../../uploads');
const logFile = path.join(__dirname, 'migration-results.json');

// Connect to MongoDB
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
} catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
}

const results = {
    successful: [],
    failed: [],
    timestamp: new Date().toISOString()
};

async function uploadToCloudinary(filePath, publicId) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'shoplink/products',
            public_id: publicId,
            resource_type: 'auto',
            overwrite: true,
            invalidate: true,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good', fetch_format: 'auto' },
                { flags: 'progressive' }
            ]
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}

async function migrateImages() {
    try {
        console.log('Starting migration from:', uploadsDir);
        
        // Get all files from uploads directory
        const files = await fs.readdir(uploadsDir);
        console.log(`Found ${files.length} files to migrate`);

        // Create a processed directory if it doesn't exist
        const processedDir = path.join(uploadsDir, 'processed');
        await fs.mkdir(processedDir, { recursive: true });

        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            // Skip the processed directory and non-image files
            if (file === 'processed') continue;
            
            const filePath = path.join(uploadsDir, file);
            
            try {
                // Check if file exists and is an image
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) {
                    console.log(`Skipping directory: ${file}`);
                    continue;
                }

                if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    console.log(`Skipping non-image file: ${file}`);
                    continue;
                }

                // Generate a public_id from the filename (without extension)
                const publicId = path.basename(file, path.extname(file));

                console.log(`Processing ${file}...`);
                const result = await uploadToCloudinary(filePath, publicId);

                // Move the processed file to backup
                await fs.rename(filePath, path.join(processedDir, file));

                console.log(`✅ Successfully uploaded ${file}`);
                console.log(`   Cloudinary URL: ${result.secure_url}`);
                
                successCount++;
                results.successful.push({
                    file,
                    cloudinaryUrl: result.secure_url,
                    publicId: result.public_id
                });

            } catch (err) {
                console.error(`❌ Error processing ${file}:`);
                console.error(`   ${err.message}`);
                errorCount++;
                results.failed.push({
                    file,
                    error: err.message
                });
            }
        }

        console.log('\nMigration Summary:');
        console.log('==================');
        console.log(`Total files processed: ${files.length}`);
        console.log(`Successful uploads: ${successCount}`);
        console.log(`Failed uploads: ${errorCount}`);

        // Save results to log file
        await fs.writeFile(logFile, JSON.stringify(results, null, 2));
        console.log(`\nDetailed log saved to: ${logFile}`);

    } catch (error) {
        console.error('Migration failed:', error);
        // Save error results if available
        try {
            await fs.writeFile(logFile, JSON.stringify(results, null, 2));
            console.log(`\nPartial results saved to: ${logFile}`);
        } catch (writeError) {
            console.error('Failed to save results:', writeError);
        }
    } finally {
        await mongoose.connection.close();
    }
}

// Run the migration
migrateImages().catch(console.error);
