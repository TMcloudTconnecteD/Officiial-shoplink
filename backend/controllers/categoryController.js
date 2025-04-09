import { tracingChannel } from "diagnostics_channel";
import asyncHandler from "../middlewares/asyncHandler.js";
import Category from "../models/categoryModel.js";
import Shop from "../models/shopModel.js"; // Imported Shop model

// Create a Category (unchanged)
const createCategory = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name)

        if (!name) {
            return res.json({ error: "Name is required, come on!" })
        }
        const existingCategory = await Category.findOne({ name })
        if (existingCategory) {
            return res.json({ error: "Category already exists" })
        }
        const category = await new Category({ name }).save()
        res.json(category)

    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

// Update a Category (unchanged)
const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        const { categoryId } = req.params;
        const category = await Category.findOne({ _id: categoryId })

        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }
        category.name = name;
        const updatedCategory = await category.save();
        res.json(updatedCategory)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error updating category(This is an internal server error!)" })
    }
})

// Delete a Category (unchanged)
const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.categoryId)
        res.json(deleted)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error deleting category(This is an internal server error!)" })
    }
})

// List all Categories (unchanged)
const categoryList = asyncHandler(async (req, res) => {
    try {
        const allCategories = await Category.find({})
        res.json(allCategories)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "Error fetching categories(This is an internal server error!)" })
    }
})

// Read a Category (unchanged)
const readCategory = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.categoryId })
        res.json(category)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "Error fetching category(This is an internal server error!)" })
    }
})

// ========================== New Shop Controller Integrations ==========================

// Create a new Shop (added)
const createShop = asyncHandler(async (req, res) => {
    try {
        const { name, category, location, logo } = req.body;

        // Validate category exists before creating the shop
        const categoryExists = await Category.findById(category);
        if (!categoryExists) return res.status(400).json({ error: "Invalid category ID" });

        const shop = new Shop({
            name,
            category,
            location,
            logo: logo || "", // Optional logo
            owner: req.user._id, // Assuming req.user is the logged-in user
        });

        const savedShop = await shop.save();
        res.status(201).json(savedShop);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Error creating shop" });
    }
});

// Update a Shop (added)
const updateShop = asyncHandler(async (req, res) => {
    try {
        const { name, category, location, logo } = req.body;
        const shop = await Shop.findById(req.params.id);

        if (!shop) return res.status(404).json({ error: "Shop not found" });

        // Check if the logged-in user is the owner of the shop
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to update this shop" });
        }

        shop.name = name || shop.name;
        shop.category = category || shop.category;
        shop.location = location || shop.location;
        shop.logo = logo || shop.logo;

        const updatedShop = await shop.save();
        res.json(updatedShop);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating shop" });
    }
});

// Delete a Shop (added)
const deleteShop = asyncHandler(async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) return res.status(404).json({ error: "Shop not found" });

        // Check if the logged-in user is the owner of the shop
        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to delete this shop" });
        }

        await shop.remove();
        res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting shop" });
    }
});

// Fetch all Shops (added)
const fetchAllShops = asyncHandler(async (req, res) => {
    try {
        const shops = await Shop.find();
        res.json(shops);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Error fetching shops" });
    }
});

// Fetch a Shop by ID (added)
const fetchShopById = asyncHandler(async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ error: "Shop not found" });
        res.json(shop);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Error fetching shop" });
    }
});

// Fetch Shops by Category (added)
const fetchShopsByCategory = asyncHandler(async (req, res) => {
    try {
        const shops = await Shop.find({ category: req.params.categoryId });
        res.json(shops);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Error fetching shops by category" });
    }
});

// Fetch User's Shops (added)
const fetchUserShops = asyncHandler(async (req, res) => {
    try {
        const shops = await Shop.find({ owner: req.user._id });
        res.json(shops);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Error fetching user's shops" });
    }
});


// ========================== Exported Functions ==========================
export {
    createCategory,
    updateCategory,
    deleteCategory,
    categoryList,
    readCategory,
    // Shop controller functions:
    createShop,
    updateShop,
    deleteShop,
    fetchAllShops,
    fetchShopById,
    fetchShopsByCategory,
    fetchUserShops,
};
