import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true, // Optional shop image/logo URL
  },
  coverImage: {
    type: String,
    default: "",
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
  description: {
    type: String,
    trim: true,
    default: "",
  },
  policies: {
    type: String,
    trim: true,
    default: "",
  },
  telephone: {
    type: Number,
    required: true,
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["shop", "mall"],
    default: "shop",
    index: true,
  },
  parentMall: {
    type: ObjectId,
    ref: "Shop",
    default: null,
    index: true,
  },
  childShops: [{
    type: ObjectId,
    ref: "Shop",
  }],
  level: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFeaturedMall: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

shopSchema.index(
  { parentMall: 1, category: 1 },
  { unique: true, partialFilterExpression: { parentMall: { $type: "objectId" } } }
);

const mall = mongoose.model("Shop", shopSchema);
export default mall;
