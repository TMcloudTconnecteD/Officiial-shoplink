import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js"; // Assuming you have Category model to validate category ID
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

// Create a new shop
export const createShop = async (req, res) => {
  try {
    // Validate category
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ message: "Invalid category ID" });

    // Create a new shop
    const shop = new Shop({
      name: req.body.name,
      logo: req.body.logo || "", // Optional logo
      category: req.body.category,
      location: req.body.location,
      owner: req.user._id, // Linking the logged-in user as the shop owner
    });

    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing shop
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    // Only the shop owner can update it
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to update this shop" });
    }

    // Update shop details
    shop.name = req.body.name || shop.name;
    shop.logo = req.body.logo || shop.logo;
    shop.category = req.body.category || shop.category;
    shop.location = req.body.location || shop.location;

    const updatedShop = await shop.save();
    res.json(updatedShop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a shop
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    // Only the owner can delete the shop
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this shop" });
    }

    await shop.remove();
    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch all shops (admin only)
export const fetchAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch a single shop by ID
export const fetchShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.status(200).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch shops by category
export const fetchShopsByCategory = async (req, res) => {
  try {
    const shops = await Shop.find({ category: req.params.categoryId });
    res.status(200).json(shops);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch all shops owned by the current user (owner)
export const fetchUserShops = async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.user._id });
    res.status(200).json(shops);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
