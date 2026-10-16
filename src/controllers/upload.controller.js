import {
    uploadImage as providerUpload,
    deleteImage as providerDelete,
} from '../lib/upload/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ==================== SINGLE IMAGE ====================
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const result = await providerUpload(req.file, 'products');

    res.status(201).json({
        success: true,
        data: result,
    });
});

// ==================== MULTIPLE IMAGES ====================
export const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No files uploaded');
    }

    const results = await Promise.all(
        req.files.map((file) => providerUpload(file, 'products'))
    );

    res.status(201).json({
        success: true,
        data: results,
    });
});

// ==================== DELETE ====================
export const deleteImage = asyncHandler(async (req, res) => {
    const { key } = req.body;

    if (!key) {
        res.status(400);
        throw new Error('File key required');
    }

    await providerDelete(key);

    res.json({
        success: true,
        message: 'Image deleted',
    });
});