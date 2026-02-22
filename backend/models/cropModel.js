import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// Sub-schema for fertilizer details
const fertilizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  dateApplied: {
    type: Date,
  },
  applicationDate: {
    type: Date,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  quantityUnit: {
    type: String,
    enum: ["kg", "liters", "grams", "ml", "bags", ""],
    default: "",
  },
  phase: {
    type: String,
    enum: ["Planting", "Growth", "Flowering", "Fruiting", ""],
    default: "",
  },
}, { _id: false });

// Main crop record schema
const cropSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
    trim: true,
  },
  variety: {
    type: String,
    trim: true,
  },
  plantingDate: {
    type: Date,
    required: true,
  },
  expectedHarvestDate: {
    type: Date,
  },
  area: {
    type: Number,
    required: true, // in hectares or acres
    min: 0,
  },
  areaUnit: {
    type: String,
    enum: ["hectares", "acres", "sqm"],
    default: "hectares",
  },
  
  // Store full fertilizer objects with proper validation
  fertilizersUsed: {
    type: [fertilizerSchema],
    default: [],
  },

  // Other agricultural fields
  pesticidesUsed: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  irrigationSchedule: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  soilType: {
    type: String,
    trim: true,
  },
  
  // Tracking
  status: {
    type: String,
    enum: ["Planning", "Planting", "Growing", "Harvesting", "Harvested"],
    default: "Planning",
  },
  
  // Owner information
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  shop: {
    type: ObjectId,
    ref: "Shop",
  },

  notes: {
    type: String,
  },

}, { timestamps: true });

const CropRecord = mongoose.model("CropRecord", cropSchema);
export default CropRecord;
