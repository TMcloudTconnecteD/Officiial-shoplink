import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
    unique: true,
  },
  image: {
    type: String,
    default: "", // Optional shop image/logo URL
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
  owner: {
    type: ObjectId,
    ref: "User", // Link to admin who created the shop
    required: true,
  },
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
