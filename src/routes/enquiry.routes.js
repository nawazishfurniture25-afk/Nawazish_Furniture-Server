import express from 'express';
import {
    createEnquiry,
    getEnquiries,
    updateEnquiry,
} from '../controllers/enquiry.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

// Public
router.post('/', validate(schemas.enquiry), createEnquiry);

// Admin
router.get('/', protect, adminOnly, getEnquiries);
router.put('/:id', protect, adminOnly, updateEnquiry);

export default router;