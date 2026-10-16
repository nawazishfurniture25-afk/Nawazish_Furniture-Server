import express from 'express';
import {
    createOrder,
    verifyPayment,
    trackOrder,
    getOrders,
    updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

// Public
router.post('/', validate(schemas.orderCreate), createOrder);
router.post('/verify', validate(schemas.paymentVerify), verifyPayment);
router.get('/track/:orderNumber', trackOrder);

// Admin
router.get('/', protect, adminOnly, getOrders);
router.put('/:id/status', protect, adminOnly, validate(schemas.orderStatus), updateOrderStatus);

export default router;