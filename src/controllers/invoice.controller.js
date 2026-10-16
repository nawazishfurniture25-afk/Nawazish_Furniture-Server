import { prisma } from '../lib/prisma.js';
import { generateInvoicePDF } from '../lib/invoice/generator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Download invoice PDF
// @route   GET /api/invoices/:orderNumber
// @access  Public (with phone verification) OR Private/Admin
export const downloadInvoice = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    // Build query
    const where = { orderNumber };

    // If not admin, require phone verification
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
        if (!phone) {
            res.status(401);
            throw new Error('Phone number required to access this invoice');
        }
        where.customerPhone = phone;
    }

    const order = await prisma.order.findFirst({
        where,
        include: { items: true },
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found or phone number does not match');
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order);

    // Set headers
    const invoiceNumber = order.invoiceNumber || order.orderNumber;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="Invoice-${invoiceNumber}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
});

// @desc    Preview invoice in browser (HTML view)
// @route   GET /api/invoices/:orderNumber/preview
// @access  Public (with phone verification) OR Private/Admin
export const previewInvoice = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    const where = { orderNumber };
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
        if (!phone) {
            res.status(401);
            throw new Error('Phone number required');
        }
        where.customerPhone = phone;
    }

    const order = await prisma.order.findFirst({
        where,
        include: { items: true },
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const { generateInvoiceHTML } = await import('../lib/invoice/template.js');
    const isGSTRegistered = process.env.GST_REGISTERED === 'true';

    const html = generateInvoiceHTML(order, {
        businessPhone: process.env.BUSINESS_PHONE || '+91 97136 24142',
        businessEmail: process.env.BUSINESS_EMAIL || 'nawazishfurniture25@gmail.com',
        businessGSTIN: process.env.BUSINESS_GSTIN || '',
        isGSTRegistered,
        logoUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/public/images/logo.png`,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});