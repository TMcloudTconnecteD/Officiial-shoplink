import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from '../models/shopModel.js';
import User from '../models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

const fixShopOwners = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a super admin user to assign as owner for shops missing owner
    const superAdmin = await User.findOne({ isAdmin: true, isSuperAdmin: true });
    if (!superAdmin) {
      console.error('No super admin user found. Please create one first.');
      process.exit(1);
    }

    // Update shops missing owner field
    const result = await Shop.updateMany(
      { owner: { $exists: false } },
      { $set: { owner: superAdmin._id } }
    );

    console.log(`Updated ${result.modifiedCount} shops to set owner as super admin ${superAdmin._id}`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing shop owners:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

fixShopOwners();
