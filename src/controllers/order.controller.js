import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { razorpay } from '../lib/razorpay.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Generate order number like SIPRI-2024-0001
const generateOrderNumber = async () => {
    const year = new Date().getFullYear();
    const count = await prisma.order.count();
    return `SIPRI-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Create order + Razorpay order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req, res) => {
    const {
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        deliveryCity,
        deliveryPincode,
        customerGstin,
        notes,
        items,
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('Cart cannot be empty');
    }

    // Fetch products from database
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: true },
    });

    if (products.length !== productIds.length) {
        res.status(400);
        throw new Error('Some products in cart are no longer available');
    }

    // Check stock and calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product.inStock) {
            res.status(400);
            throw new Error(`${product.name} is out of stock`);
        }
        if (product.stockQty < item.quantity) {
            res.status(400);
            throw new Error(`Only ${product.stockQty} units of ${product.name} available`);
        }

        const unitPrice = product.price;
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
            productId: product.id,
            productName: product.name,
            productImage: product.images[0]?.url || '/images/placeholder.jpg',
            quantity: item.quantity,
            unitPrice,
            gstRate: product.gstRate,
            lineTotal,
        });
    }

    // Calculate GST (product-wise)
    const isGSTRegistered = process.env.GST_REGISTERED === 'true';
    let gstAmount = 0;
    if (isGSTRegistered) {
        gstAmount = orderItemsData.reduce((sum, item) => {
            const rate = item.gstRate || 18;
            return sum + Math.round((item.lineTotal * rate) / 100);
        }, 0);
    }

    const shippingAmount = 0; // Free delivery in MP
    const totalAmount = subtotal + gstAmount + shippingAmount;


    const orderNumber = await generateOrderNumber();

    // Create order in DB (PENDING)
    const order = await prisma.order.create({
        data: {
            orderNumber,
            customerName,
            customerPhone,
            customerEmail: customerEmail || null,
            deliveryAddress,
            deliveryCity,
            deliveryPincode,
            customerGstin: customerGstin || null,
            subtotal,
            gstAmount,
            shippingAmount,
            totalAmount,
            notes: notes || null,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            items: {
                create: orderItemsData,
            },
        },
        include: {
            items: true,
        },
    });

    // Create Razorpay order
    let razorpayOrder = null;
    try {
        razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // Razorpay takes paise
            currency: 'INR',
            receipt: orderNumber,
            notes: {
                orderId: order.id,
                customerName,
                customerPhone,
            },
        });

        // Update order with Razorpay order ID
        await prisma.order.update({
            where: { id: order.id },
            data: { razorpayOrderId: razorpayOrder.id },
        });
    } catch (err) {
        console.error('Razorpay order creation failed:', err.message);
        // Continue without Razorpay — admin can follow up
    }

    res.status(201).json({
        success: true,
        data: {
            order,
            razorpayOrder,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        },
    });
});

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify
// @access  Public
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        res.status(400);
        throw new Error('Payment verification failed');
    }

    // Update order as paid
    const order = await prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        },
        include: { items: true },
    });

    // Reduce stock
    for (const item of order.items) {
        await prisma.product.update({
            where: { id: item.productId },
            data: {
                stockQty: { decrement: item.quantity },
            },
        });
    }

    res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order,
    });
});

// @desc    Get order by orderNumber + phone (public tracking)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const trackOrder = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    if (!phone) {
        res.status(400);
        throw new Error('Phone number required');
    }

    const order = await prisma.order.findFirst({
        where: {
            orderNumber,
            customerPhone: phone,
        },
        include: { items: true },
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json({
        success: true,
        data: order,
    });
});

// ==================== ADMIN ONLY ====================

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const { status, paymentStatus } = req.query;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
    });

    res.json({
        success: true,
        count: orders.length,
        data: orders,
    });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await prisma.order.update({
        where: { id },
        data: {
            status,
            ...(notes !== undefined && { notes }),
        },
        include: { items: true },
    });

    res.json({
        success: true,
        data: order,
    });
});