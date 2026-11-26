import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { notifyAdmins, notifyUser } from "../services/notificationBadgeService.js";

// Create a new mall/shop
const createShop = asyncHandler(async (req, res) => {
  try {
    if (req.user.isSeller && !req.user.isSuperAdmin) {
      if (req.user.sellerShop) {
        return res.status(409).json({ error: "You already manage your approved shop" });
      }
      if (req.user.sellerStatus !== "approved") {
        return res.status(403).json({ error: "Your seller account is not approved" });
      }
    }
  console.log('createShop called', { fields: req.fields, body: req.body, user: req.user && { id: req.user._id, email: req.user.email } });
  const { name, location, telephone, category, image } = req.fields || req.body;

    if (!name) return res.status(400).json({ error: "Name is required, come on!" });
    if (!location) return res.status(400).json({ error: "Location is required, come on!" });
    if (!telephone) return res.status(400).json({ error: "Phone No. is required, come on!" });
    if (!category) return res.status(400).json({ error: "Category is required, come on!" });
    if (!image) return res.status(400).json({ error: "Image is required, come on!" });

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ error: "Invalid category ID" });

    const telephoneNumber = Number(telephone);
    if (isNaN(telephoneNumber)) return res.status(400).json({ error: "Telephone must be a number" });

    const mall = new Shop({
      ...req.fields || req.body,
      owner: req.user._id,
    });

    await mall.save();
    await Promise.allSettled([
      notifyAdmins({
        type: "seller",
        title: "Shop created",
        message: `${mall.name} was created and is ready for the super admin to review.`,
        link: "/admin/shops",
      }),
      notifyUser(req.user._id, {
        type: "seller",
        title: "Shop created",
        message: `Your shop "${mall.name}" was created successfully.`,
        link: `/shops/${mall._id}`,
      }),
    ]);
    res.json(mall);
  } catch (error) {
    console.error(error, 'error creating shop');
    res.status(400).json({ error: error.message });
  }
});

// Update existing mall
const updateShop = asyncHandler(async (req, res) => {
  try {
    const { name, location, telephone, category, image, description } = req.fields || req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Shop name is required." });
    if (!location?.trim()) return res.status(400).json({ message: "Shop location is required." });
    if (!telephone) return res.status(400).json({ message: "Shop phone number is required." });
    if (!category) return res.status(400).json({ message: "Choose a shop category." });
    if (!image) return res.status(400).json({ message: "Add a shop photo." });

    const validCategory = await Category.findById(category);
    if (!validCategory) return res.status(400).json({ message: "Choose a valid shop category." });

    const mall = await Shop.findById(req.params.id);
    if (!mall) return res.status(404).json({ message: "Shop not found." });

    if (!mall.owner || (mall.owner.toString() !== req.user._id.toString() && !req.user.isSuperAdmin)) {
      return res.status(403).json({ message: "You can only edit a shop you manage." });
    }

    mall.name = name;
    mall.location = location;
    mall.telephone = telephone;
    mall.category = category;
    mall.image = image;
    mall.description = description || "";

    await mall.save();
    res.json(mall);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Could not update this shop." });
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
    if (!mall.owner || (mall.owner.toString() !== req.user._id.toString() && !req.user.isSuperAdmin)) {
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
