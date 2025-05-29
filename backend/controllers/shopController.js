import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Create a new mall/shop
const createShop = asyncHandler(async (req, res) => {
  try {
    const { name, location, telephone, category, image } = req.fields;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).json({ error: "Name is required" });
      case !location:
        return res.status(400).json({ error: "Location is required" });
      case !telephone:
        return res.status(400).json({ error: "Telephone is required" });
      case !category:
        return res.status(400).json({ error: "Category is required" });
      case !image:
        return res.status(400).json({ error: "Image is required" });
    }

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ error: "Invalid category ID" });

    const telephoneNumber = Number(telephone);
    if (isNaN(telephoneNumber)) return res.status(400).json({ error: "Telephone must be a number" });

    // Create shop with Cloudinary URL
    const shop = new Shop({
      name,
      location,
      telephone,
      category,
      image // This should now be a Cloudinary URL
    });

    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    console.error('Shop creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update existing mall
const updateShop = asyncHandler(async (req, res) => {
  try {
    console.log('User object in updateShop:', req.user); // Debug user object

    const { name, location, telephone, category, image } = req.fields || req.body;

    if (!name) return res.status(400).json({ error: "Name is required, come on!" });
    if (!location) return res.status(400).json({ error: "Location is required, come on!" });
    if (!telephone) return res.status(400).json({ error: "Phone No. is required, come on!" });
    if (!category) return res.status(400).json({ error: "Category is required, come on!" });
    if (!image) return res.status(400).json({ error: "Image is required, come on!" });

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ error: "Invalid category ID" });

    const mall = await Shop.findById(req.params.id);
    if (!mall) return res.status(404).json({ error: "Mall not found" });

    console.log('Mall owner:', mall.owner);
    console.log('User ID:', req.user._id);
    console.log('User isAdmin:', req.user.isAdmin);
    console.log('User isSuperAdmin:', req.user.isSuperAdmin);

    // Allow update if user is owner or super admin
    if (!mall.owner || (mall.owner.toString() !== req.user._id.toString() && !(req.user.isAdmin && req.user.isSuperAdmin))) {
      console.log('Authorization failed in updateShop');
      return res.status(403).json({ error: "Not authorized" });
    }

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

// Delete a mall
const deleteShop = asyncHandler(async (req, res) => {
  try {
    console.log('User object in deleteShop:', req.user); // Debug user object

    const mall = await Shop.findById(req.params.id);
    if (!mall) return res.status(404).json({ error: "Mall not found" });

    console.log('Mall owner:', mall.owner);
    console.log('User ID:', req.user._id);
    console.log('User isAdmin:', req.user.isAdmin);
    console.log('User isSuperAdmin:', req.user.isSuperAdmin);

    // Allow delete if user is owner or super admin
    if (!mall.owner || (mall.owner.toString() !== req.user._id.toString() && !(req.user.isAdmin && req.user.isSuperAdmin))) {
      console.log('Authorization failed in deleteShop');
      return res.status(403).json({ error: "Not authorized" });
    }

    await mall.deleteOne();
    res.json({ message: "Mall deleted successfully", mall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting mall" });
  }
});

// Fetch all shops
const fetchAllShops = asyncHandler(async (req, res) => {
  try {
    const malls = await Shop.find({})
      .populate("category")
      .populate("owner", "email telephone")
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
  fetchAllShops,
};
