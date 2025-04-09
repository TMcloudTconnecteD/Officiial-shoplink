
import express from "express";
import ExpressFormidable from "express-formidable";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import checkId from "../middlewares/checkId.js";
import { createProduct, deleteProduct, updateProduct, fetchProducts, fetchProductsbyId, fetchAllProducts, createProductReviews, fetchTopProducts, fetchNewProducts, filterProducts } from "../controllers/productController.js";



const router = express.Router();


router.route("/")
.get(fetchProducts)
.post(authenticate, authorizeAdmin, ExpressFormidable(), createProduct);
router.get('/top', fetchTopProducts)
router.get('/new', fetchNewProducts)

router.route('/allproducts')
.get(fetchAllProducts)
router.route('/:id/reviews')
.post(authenticate,checkId , createProductReviews)
router.route("/:id")
.get(fetchProductsbyId)
.put(authenticate, authorizeAdmin,  ExpressFormidable(), updateProduct)
.delete(authenticate, authorizeAdmin,  deleteProduct)

router.route("/filtered-products").post(filterProducts);

export default router;