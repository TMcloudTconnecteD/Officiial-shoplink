
import express from "express";
import ExpressFormidable from "express-formidable";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import checkId from "../middlewares/checkId.js";
import { createProduct, deleteProduct, updateProduct, fetchProducts, fetchProductsbyId, fetchAllProducts, createProductReviews, fetchTopProducts, fetchNewProducts } from "../controllers/productController.js";

const router = express.Router();


router.route("/")
.get(fetchProducts)
.post(authenticate, authorizeAdmin, ExpressFormidable(), createProduct);
router.get('/top', fetchTopProducts)
router.get('/new', fetchNewProducts)

router.route('/allproducts')
.get(fetchAllProducts)
router.route('/:Id/reviews')
.post(authenticate, authorizeAdmin,checkId , createProductReviews)
router.route("/:Id")
.get(fetchProductsbyId)
.put(authenticate, authorizeAdmin,  ExpressFormidable(), updateProduct)
.delete(authenticate, authorizeAdmin,  deleteProduct)



export default router;