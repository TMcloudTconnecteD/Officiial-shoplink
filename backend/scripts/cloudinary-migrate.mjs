import { v2 as cloudinary } from 'cloudinary';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Get the directory name using ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: 'dgnxkbg3i',
    api_key: '829231834578378',
    api_secret: 'Xzt2gWaKBrue90uY940zcwyejyg'
});

const uploadsDir = join(__dirname, '../../uploads');

// Connect to MongoDB
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
} catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
}

// Import the Product model
const Product = mongoose.model('Product', new mongoose.Schema({
    image: String
}));

async function migrateImages() {
    const logFile = join(__dirname, 'migration-log.json');
    const results = {
        successful: [],
        failed: [],
        timestamp: new Date().toISOString()
    };

    try {
        console.log('Starting migration from:', uploadsDir);
        
        // Get all files from uploads directory
        const files = await readdir(uploadsDir);
        console.log(`Found ${files.length} files to process`);

        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filePath = join(uploadsDir, file);
            
            try {
                // Check if file exists and is a file (not a directory)
                const stats = await stat(filePath);
                if (!stats.isFile()) {
                    console.log(`Skipping directory: ${file}`);
                    continue;
                }

                // Check if it's an image file
                if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    console.log(`Skipping non-image file: ${file}`);
                    continue;
                }

                console.log(`Processing ${file}...`);

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'shoplink/products',
                    use_filename: true,
                    unique_filename: true,
                    resource_type: 'auto',
                    overwrite: true
                });                // Update database record if exists
                const oldPath = `/uploads/${file}`;
                const product = await Product.findOne({ image: oldPath });
                
                if (product) {
                    product.image = result.secure_url;
                    await product.save();
                    console.log(`✅ Updated database record for ${file}`);
                }

                console.log(`✅ Successfully uploaded ${file}`);
                console.log(`   Cloudinary URL: ${result.secure_url}`);
                successCount++;
                results.successful.push({
                    file,
                    cloudinaryUrl: result.secure_url,
                    updatedInDb: !!product
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
        }        console.log('\nMigration Summary:');
        console.log('==================');
        console.log(`Total files processed: ${files.length}`);
        console.log(`Successful uploads: ${successCount}`);
        console.log(`Failed uploads: ${errorCount}`);

        // Save results to log file
        await writeFile(logFile, JSON.stringify(results, null, 2));
        console.log(`\nDetailed log saved to: ${logFile}`);
        
        // Close database connection
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('Migration failed:', error.message);
        // Save error results if available
        if (results.successful.length > 0 || results.failed.length > 0) {
            await writeFile(logFile, JSON.stringify(results, null, 2));
            console.log(`\nPartial log saved to: ${logFile}`);
        }
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the migration
migrateImages().catch(console.error);
