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



// ========================== Exported Functions ==========================
export {
    createCategory,
    updateCategory,
    deleteCategory,
    categoryList,
    readCategory
    
};
