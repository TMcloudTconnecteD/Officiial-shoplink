import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ✅ Create a new mall/shop
const createShop = asyncHandler(async (req, res) => {
  try {
    const { name, category, location, owner, phone } = req.fields;
    const image = req.file?.path;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required, come on!" });
      case !location:
        return res.json({ error: "Location is required, come on!" });
      case !owner:
        return res.json({ error: "Owner is required, come on!" });
      case !phone:
        return res.json({ error: "Phone No. is required, come on!" });
      case !category:
        return res.json({ error: "Category is required, come on!" });
    }

    const validCategory = await Category.findById(category);
    if (!validCategory) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const mall = new Shop({
      ...req.fields,
      image,
    });

    await mall.save();
    res.json(mall);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Update existing mall
const updateShop = asyncHandler(async (req, res) => {
  try {
    const { name, location, owner, phone, category } = req.fields;
    const image = req.file?.path;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required, come on!" });
      case !location:
        return res.json({ error: "Location is required, come on!" });
      case !owner:
        return res.json({ error: "Owner is required, come on!" });
      case !phone:
        return res.json({ error: "Phone No. is required, come on!" });
      case !category:
        return res.json({ error: "Category is required, come on!" });
    }

    const validCategory = await Category.findById(category);
    if (!validCategory) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const updateData = {
      ...req.fields,
    };
    if (image) updateData.image = image;

    const mall = await Shop.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!mall) {
      return res.status(404).json({ error: "Mall not found" });
    }

    res.json(mall);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Delete a mall
const deleteShop = asyncHandler(async (req, res) => {
  try {
    const mall = await Shop.findByIdAndDelete(req.params.id);
    if (!mall) {
      return res.status(404).json({ error: "Mall not found" });
    }
    res.json({ message: "Mall deleted successfully", mall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting mall" });
  }
});

// ✅ Fetch paginated mall list (optionally filtered by keyword)
const fetchShops = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const count = await Shop.countDocuments({ ...keyword });
    const malls = await Shop.find({ ...keyword }).limit(pageSize);

    res.json({
      malls,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting malls" });
  }
});

// ✅ Fetch mall by ID
const fetchShopsById = asyncHandler(async (req, res) => {
  try {
    const mall = await Shop.findById(req.params.id);
    if (!mall) {
      return res.status(404).json({ error: "Mall not Found" });
    }
    res.json(mall);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Mall not Found" });
  }
});

// ✅ Fetch latest 10 malls with category populated
const fetchAllShops = asyncHandler(async (req, res) => {
  try {
    const malls = await Shop.find({})
      .populate("category")
      .limit(10)
      .sort({ createdAt: -1 });
    res.json(malls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting malls" });
  }
});

// ✅ Export all functions
export {
  createShop,
  updateShop,
  deleteShop,
  fetchShops,
  fetchShopsById,
  fetchAllShops,
};
