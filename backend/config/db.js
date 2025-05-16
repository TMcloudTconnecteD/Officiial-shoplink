import mongoose from "mongoose";

const connectDB = async () => {
try {

    //console.log('MONGODB_URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hillarygerald76:W9RK474GedFpuEL@shoplinkbackend.7tmvd.mongodb.net/?retryWrites=true&w=majority&appName=shoplinkbackend');
    console.log('mongoDB check!🤝db.js Worked!!😎')

   
} catch (error) {
    console.error(`ERROR!: ${error.message}`)
    process.exit(1)
}



}
export default connectDB;