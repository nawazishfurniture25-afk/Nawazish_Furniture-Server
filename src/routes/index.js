import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import enquiryRoutes from './enquiry.routes.js';
import uploadRoutes from './upload.routes.js';
import invoiceRoutes from './invoice.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nawazish Furniture API is running',
        timestamp: new Date().toISOString(),
    });
});

// Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/upload', uploadRoutes);
router.use('/invoices', invoiceRoutes);

export default router;