import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const createProduct = asyncHandler(async (req, res) => {
  try {
    const {name, description, price, category, quantity, brand, image} = req.fields;
    
    // Validation
    switch (true) {
      case !name:
        return res.json({error: "Name is required"});
      case !description:
        return res.json({error: "Description is required"});
      case !price:
        return res.json({error: "Price is required"});
      case !category:
        return res.json({error: "Category is required"});
      case !quantity:
        return res.json({error: "Quantity is required"});
      case !brand:
        return res.json({error: "Brand is required"});
      case !image:
        return res.json({error: "Image is required"});
    }

    // Create product with Cloudinary URL
    const product = new Product({
      name,
      description,
      price,
      category,
      quantity,
      brand,
      image, // This should now be a Cloudinary URL
      inStock: quantity > 0
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const {name, description, price, category, quantity, brand} = req.fields;
    switch (true) {
      case !name:
        return res.json({error: "Name is required, come on!"});
      case !description:
        return res.json({error: "Description is required, come on!"});
      case !price:
        return res.json({error: "Price is required, come on!"});
      case !category:
        return res.json({error: "Category is required, come on!"});
      case !quantity:
        return res.json({error: "Quantity is required, come on!"});
      case !brand:
        return res.json({error: "Brand is required, come on!"});
    }
    const product = await Product.findByIdAndUpdate(req.params.id, {...req.fields}, {new: true});
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
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
    const products = await Product.find({}).populate("category").populate("shop", "name location").limit(100).sort({createdAt: -1});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error getting products"});
  }
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
    const products = await Product.find({}).sort({rating: -1}).limit(4).populate("shop", "name location");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({_id: -1}).limit(5).populate("shop", "name location");
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
};
