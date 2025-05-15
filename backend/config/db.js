import mongoose from "mongoose";

const connectDB = async () => {
try {

    console.log('MONGODB_URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://larrygerald76:soYHFUSFSz5y2YE2@clustershop.ivdna6q.mongodb.net/?retryWrites=true&w=majority&appName=Clustershop');
    console.log('mongoDB check!🤝db.js Worked!!😎')

   
} catch (error) {
    console.error(`ERROR!: ${error.message}`)
    process.exit(1)
}



}
export default connectDB;