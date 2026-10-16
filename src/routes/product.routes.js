import express from 'express';
import {
    getProducts,
    getProduct,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/:slugOrId', getProduct);

// Admin
router.post('/', protect, adminOnly, validate(schemas.product), createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;