import express from 'express'

import { authenticate, authorizeAdmin, authorizeSuperAdmin } from '../middlewares/authMiddlewares.js'
import { categoryList, createCategory, deleteCategory, readCategory, updateCategory } from '../controllers/categoryController.js'

const router = express.Router()

router.route('/').post( authenticate, authorizeAdmin, authorizeSuperAdmin,createCategory)
router.route('/:categoryId')
.put(authenticate, authorizeAdmin, authorizeSuperAdmin, updateCategory)
router
.route('/:categoryId')
.delete(authenticate, authorizeAdmin, authorizeSuperAdmin,deleteCategory)


router.route('/categories')
.get(categoryList)

router.route('/:id')
.get(readCategory)
export default router;
