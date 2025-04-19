import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
   
  },
  image: {
    type: String,
    required:true, // Optional shop image/logo URL
  },
  category: {
    type: ObjectId,
    ref: "Category",
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  
  
  telephone: {
    type: Number,
    required: true,
   



  }

}, { timestamps: true });

const mall = mongoose.model("Shop", shopSchema);
export default mall;
