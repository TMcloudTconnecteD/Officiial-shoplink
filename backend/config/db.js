import mongoose from "mongoose";

const connectDB = async () => {
  const retryInterval = 5000; // 5 seconds between retries
  const maxRetries = 5;
  let currentRetry = 0;

  const tryConnect = async () => {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 2000,
        retryWrites: true,
        w: 'majority',
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('MongoDB Connected Successfully 🚀.DB.js worked🙂');
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (currentRetry < maxRetries) {
          currentRetry++;
          console.log(`Retrying connection... Attempt ${currentRetry} of ${maxRetries}`);
          setTimeout(tryConnect, retryInterval);
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        if (currentRetry < maxRetries) {
          currentRetry++;
          console.log(`Retrying connection... Attempt ${currentRetry} of ${maxRetries}`);
          setTimeout(tryConnect, retryInterval);
        }
      });
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      if (currentRetry < maxRetries) {
        currentRetry++;
        console.log(`Retrying connection... Attempt ${currentRetry} of ${maxRetries}`);
        setTimeout(tryConnect, retryInterval);
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        throw error;
      }
}



}
export default connectDB;