import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import ProductFavorite from "../models/productFavoriteModel.js";

const canManageShop = async (req, shopId) => {
  if (req.user?.isSuperAdmin) return true;
  if (!shopId) return false;
  const shop = await Shop.findById(shopId).select("owner");
  return Boolean(shop?.owner && shop.owner.toString() === req.user._id.toString());
};

const normalizeProductImages = (fields) => {
  let images = fields.images;
  if (typeof images === "string" && images.trim()) {
    try {
      images = JSON.parse(images);
    } catch {
      images = [images];
    }
  }
  if (!Array.isArray(images)) images = [];
  const urls = [...new Set(images.filter((image) => typeof image === "string" && image.trim()).map((image) => image.trim()))];
  if (!urls.length && typeof fields.image === "string" && fields.image.trim()) urls.push(fields.image.trim());
  if (urls.length > 3) throw new Error("A product can have up to three photos");
  if (!urls[0]) throw new Error("Upload at least one product photo");
  return urls;
};

const createProduct = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields || {};
    const {name, description, price, category, quantity, brand, shop} = fields;
    const requiredFields = { name, description, price, category, quantity, brand, shop };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || String(value).trim() === "") {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative amount." });
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative whole number." });
    }
    if (!(await canManageShop(req, shop))) {
      return res.status(403).json({ message: "You can only add products to a shop you manage." });
    }
    const images = normalizeProductImages(fields);
    const product = new Product({ ...fields, image: images[0], images });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Could not create product." });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields || {};
    const {name, description, price, category, quantity, brand, shop} = fields;
    const requiredFields = { name, description, price, category, quantity, brand, shop };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || String(value).trim() === "") {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative amount." });
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative whole number." });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!(await canManageShop(req, product.shop))) {
      return res.status(403).json({ message: "You can only update products in a shop you manage." });
    }
    if (!(await canManageShop(req, shop))) {
      return res.status(403).json({ message: "You can only update products in a shop you manage." });
    }
    const images = normalizeProductImages(fields);
    Object.assign(product, fields, { image: images[0], images });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Could not update product." });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({error: "Product not found"});
    if (!(await canManageShop(req, product.shop))) {
      return res.status(403).json({error: "You can only delete products from your own shop"});
    }
    await product.deleteOne();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error deleting product"});
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const keyword = req.query.keyword ? {name: {$regex: req.query.keyword, $options: "i"}} : {};
    const count = await Product.countDocuments({...keyword});
    const products = await Product.find({...keyword}).limit(pageSize).populate("shop", "name location");
    res.json({products, page: 1, pages: Math.ceil(count / pageSize), hasMore: false});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error getting product"});
  }
});

const fetchProductsbyId = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("shop", "name location");
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({error: "Product not Found"});
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").populate("shop", "name location").sort({createdAt: -1});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error getting products"});
  }
});

const toggleProductFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (typeof req.body?.favorited !== "boolean") {
    return res.status(400).json({ message: "Favorite state must be a boolean." });
  }
  if (!(await Product.exists({ _id: id }))) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (req.body.favorited) {
    try {
      await ProductFavorite.create({ user: req.user._id, product: id });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  } else {
    await ProductFavorite.deleteOne({ user: req.user._id, product: id });
  }

  const favoriteCount = await ProductFavorite.countDocuments({ product: id });
  res.json({ favorited: req.body.favorited, favoriteCount });
});

const createProductReviews = asyncHandler(async (req, res) => {
  try {
    const {rating, comment} = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }
      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
      await product.save();
      res.status(201).json({message: "Review added"});
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({rating: -1}).limit(10).populate("shop", "name location");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({_id: -1}).limit(10).populate("shop", "name location");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const {checked, radio} = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = {$gte: radio[0], $lte: radio[1]};
    const products = await Product.find(args).populate("shop", "name location");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Server Error"});
  }
});

// New function to fetch products by shop id
const fetchProductsByShopId = asyncHandler(async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const products = await Product.find({shop: shopId}).populate("category").populate("shop", "name location");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error getting products for shop"});
  }
});

export {
  createProduct,
  fetchNewProducts,
  filterProducts,
  fetchTopProducts,
  createProductReviews,
  updateProduct,
  deleteProduct,
  fetchProducts,
  fetchProductsbyId,
  fetchAllProducts,
  fetchProductsByShopId,
  toggleProductFavorite,
};
