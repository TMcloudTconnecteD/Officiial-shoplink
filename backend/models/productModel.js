import mongoose from "mongoose";

const {ObjectId} = mongoose.Schema.Types

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    user: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {timestamps: true})

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
        trim: true,
        maxLength: 32,
    },

    image: {
        type: String,
        required: true,
    },brand: {
        type: String,
        required: true,
    },quantity: {
        type: Number,
        required: true,
        default: 0,
    },category:{
        type: ObjectId, 
        ref: "Category", 
        required: true},
    description: {
        type: String,
        required: true,
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        required: true,

        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    inStock: {
        type: Number,
        required: true,
        default: 0,
    },
    shop: {
        type: ObjectId,
        ref: "Shop",
        required: true,
    },

},{timestamps: true})
const product =  mongoose.model("Product", productSchema)
export default product;
