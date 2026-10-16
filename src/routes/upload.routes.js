import express from 'express';
import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
} from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload single image
router.post(
    '/single',
    protect,
    adminOnly,
    upload.single('image'),
    uploadImage
);

// Upload multiple images (max 10)
router.post(
    '/multiple',
    protect,
    adminOnly,
    upload.array('images', 10),
    uploadMultipleImages
);

// Delete image
router.delete('/delete', protect, adminOnly, deleteImage);

export default router;