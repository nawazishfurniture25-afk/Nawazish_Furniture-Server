import express from 'express';
import {
    downloadInvoice,
    previewInvoice,
} from '../controllers/invoice.controller.js';

const router = express.Router();

// Public — but requires phone verification via query string
router.get('/:orderNumber', downloadInvoice);
router.get('/:orderNumber/preview', previewInvoice);

export default router;