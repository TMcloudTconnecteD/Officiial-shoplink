import express from 'express'

import { authenticate, authorizeAdmin } from '../middlewares/authMiddlewares.js'
import { createCategory, deleteCategory, updateCategory } from '../controllers/categoryController.js'

const router = express.Router()

router.route('/').post( authenticate, authorizeAdmin, createCategory)
router.route('/:categoryId').put(authenticate, authorizeAdmin, updateCategory)
router.route('/:categoryId').delete(authenticate, authorizeAdmin, deleteCategory)

export default router;
