import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js"; // Added import for Category model
import asyncHandler from "../middlewares/asyncHandler.js";// Make sure this is imported

// ✅ Create a new mall/shop
const createShop = asyncHandler(async (req, res) => {
  try {
    console.log('create shop controller called');
    console.log('req.fields:', req.fields);
    console.log('req.body:', req.body);

    // console.log(req.user._id)

    const { name, location, telephone, category, image } = req.fields || req.body;

    switch (true) {
      case !name:
        return res.status(400).json({ error: "Name is required, come on!" });
      case !location:
        return res.status(400).json({ error: "Location is required, come on!" });
      case !telephone:
        return res.status(400).json({ error: "Phone No. is required, come on!" });
      case !category:
        return res.status(400).json({ error: "Category is required, come on!" });
      case !image:
        return res.status(400).json({ error: "Image is required, come on!" });
    }

    const validCategory = await Category.findById(category);
    if (!validCategory) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // Convert telephone to number if it's a string
    const telephoneNumber = Number(telephone);
    if (isNaN(telephoneNumber)) {
      return res.status(400).json({ error: "Telephone must be a number" });
    }

    const mall = new Shop({
      ...req.fields || req.body }); // ✅ Auto-set the current logged-in user

    await mall.save();
    res.json(mall);
  } catch (error) {
    console.error(error, 'error creating shop');
    res.status(400).json({ error: error.message });
  }
});

// ✅ Update existing mall
const updateShop = asyncHandler(async (req, res) => {
  try {
    const { name, location, telephone, category, image } = req.fields || req.body;

    switch (true) {
      case !name:
        return res.status(400).json({ error: "Name is required, come on!" });
      case !location:
        return res.status(400).json({ error: "Location is required, come on!" });
      case !telephone:
        return res.status(400).json({ error: "Phone No. is required, come on!" });
      case !category:
        return res.status(400).json({ error: "Category is required, come on!" });
      case !image:
        return res.status(400).json({ error: "Image is required, come on!" });
    }

    const validCategory = await Category.findById(category);
    if (!validCategory) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    

    const mall = await Shop.findById(req.params.id);

    if (!mall) {
      return res.status(404).json({ error: "Mall not found" });
    }

    // Optional: check if the user updating is the owner
    if (mall.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update fields
    mall.name = name;
    mall.location = location;
    mall.telephone = telephone;
    mall.category = category;
    mall.image = image;

    await mall.save();
    res.json(mall);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Delete a mall
const deleteShop = asyncHandler(async (req, res) => {
  try {
    const mall = await Shop.findById(req.params.id);

    if (!mall) {
      return res.status(404).json({ error: "Mall not found" });
    }

    // Optional: check if user is owner
    if (mall.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await mall.deleteOne();

    res.json({ message: "Mall deleted successfully", mall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting mall" });
  }
});

// ✅ Fetch paginated mall list
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

export {
  createShop,
  updateShop,
  deleteShop,
  fetchShops,
  fetchShopsById,
  fetchAllShops,
};
