import asyncHandler from "../middlewares/asyncHandler.js";
import CropRecord from "../models/cropModel.js";

/**
 * CREATE a new crop record
 * Sanitizes and validates fertilizer data before saving
 */
const createCrop = asyncHandler(async (req, res) => {
  try {
    const {
      cropName,
      variety,
      plantingDate,
      expectedHarvestDate,
      area,
      areaUnit,
      fertilizersUsed,
      pesticidesUsed,
      irrigationSchedule,
      soilType,
      status,
      shop,
      notes,
    } = req.body;

    // Validate required fields
    if (!cropName) {
      return res.status(400).json({ error: "Crop name is required" });
    }
    if (!plantingDate) {
      return res.status(400).json({ error: "Planting date is required" });
    }
    if (!area) {
      return res.status(400).json({ error: "Area is required" });
    }

    // Sanitize fertilizers: ensure each is a valid object with required fields
    let sanitizedFertilizers = [];
    if (Array.isArray(fertilizersUsed) && fertilizersUsed.length > 0) {
      sanitizedFertilizers = fertilizersUsed.map((fert) => {
        if (typeof fert === "string") {
          // If it's just a string, wrap it as a name
          return { name: fert };
        } else if (typeof fert === "object" && fert !== null) {
          // If it's an object, keep it as-is (Mongoose will validate)
          return {
            name: fert.name || "",
            type: fert.type || undefined,
            dateApplied: fert.dateApplied ? new Date(fert.dateApplied) : undefined,
            applicationDate: fert.applicationDate
              ? new Date(fert.applicationDate)
              : undefined,
            quantity: fert.quantity ? Number(fert.quantity) : undefined,
            quantityUnit: fert.quantityUnit || "",
            phase: fert.phase || "",
          };
        }
        return {};
      });
    }

    const cropData = {
      cropName: cropName.trim(),
      variety: variety?.trim(),
      plantingDate: new Date(plantingDate),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : undefined,
      area: Number(area),
      areaUnit: areaUnit || "hectares",
      fertilizersUsed: sanitizedFertilizers,
      pesticidesUsed: pesticidesUsed || [],
      irrigationSchedule: irrigationSchedule || [],
      soilType: soilType?.trim(),
      status: status || "Planning",
      shop: shop || undefined,
      notes: notes?.trim(),
      owner: req.user._id, // from auth middleware
    };

    const crop = new CropRecord(cropData);
    await crop.save();

    res.status(201).json({
      message: "Crop record created successfully",
      data: crop,
    });
  } catch (error) {
    console.error("Failed to add produce:", error);
    
    // Return user-friendly error messages
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: messages,
      });
    }

    res.status(400).json({
      error: error.message || "Failed to create crop record",
    });
  }
});

/**
 * FETCH all crop records (with optional filters)
 */
const fetchCrops = asyncHandler(async (req, res) => {
  try {
    const { status, cropName, owner } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (cropName) filter.cropName = { $regex: cropName, $options: "i" };
    if (owner) filter.owner = owner;
    else if (req.user) filter.owner = req.user._id; // Default: own crops only

    const crops = await CropRecord.find(filter)
      .populate("owner", "username email")
      .populate("shop", "name location")
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching crops" });
  }
});

/**
 * FETCH a single crop record by ID
 */
const fetchCropById = asyncHandler(async (req, res) => {
  try {
    const crop = await CropRecord.findById(req.params.id)
      .populate("owner", "username email")
      .populate("shop", "name location");

    if (!crop) {
      return res.status(404).json({ error: "Crop record not found" });
    }

    res.json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching crop" });
  }
});

/**
 * UPDATE a crop record
 */
const updateCrop = asyncHandler(async (req, res) => {
  try {
    let crop = await CropRecord.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ error: "Crop record not found" });
    }

    // Check authorization (owner or admin)
    if (
      crop.owner.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: "Not authorized to update this crop" });
    }

    // Sanitize fertilizers if provided
    if (req.body.fertilizersUsed) {
      req.body.fertilizersUsed = req.body.fertilizersUsed.map((fert) => {
        if (typeof fert === "string") {
          return { name: fert };
        }
        return {
          name: fert.name || "",
          type: fert.type || undefined,
          dateApplied: fert.dateApplied ? new Date(fert.dateApplied) : undefined,
          applicationDate: fert.applicationDate
            ? new Date(fert.applicationDate)
            : undefined,
          quantity: fert.quantity ? Number(fert.quantity) : undefined,
          quantityUnit: fert.quantityUnit || "",
          phase: fert.phase || "",
        };
      });
    }

    crop = await CropRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Crop record updated successfully",
      data: crop,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: messages,
      });
    }

    res.status(400).json({ error: error.message || "Error updating crop" });
  }
});

/**
 * DELETE a crop record
 */
const deleteCrop = asyncHandler(async (req, res) => {
  try {
    const crop = await CropRecord.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ error: "Crop record not found" });
    }

    // Check authorization
    if (
      crop.owner.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: "Not authorized to delete this crop" });
    }

    await CropRecord.findByIdAndDelete(req.params.id);

    res.json({
      message: "Crop record deleted successfully",
      data: crop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting crop" });
  }
});

export {
  createCrop,
  fetchCrops,
  fetchCropById,
  updateCrop,
  deleteCrop,
};
