import { z } from 'zod';

// Middleware factory that validates request body against a zod schema
export const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        next(error);
    }
};

// Common validation schemas
export const schemas = {
    // Auth
    login: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),

    // Product
    product: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        slug: z.string().min(2, 'Slug must be at least 2 characters'),
        description: z.string().optional(),
        shortDesc: z.string().optional(),
        price: z.number().int().positive('Price must be positive'),
        mrp: z.number().int().positive().optional(),
        gstRate: z.number().int().min(0).max(28).default(18),
        hsnCode: z.string().optional(),
        category: z.string().min(2, 'Category required'),
        fabric: z.string().optional(),
        dimensions: z.string().optional(),
        warranty: z.string().optional(),
        inStock: z.boolean().optional(),
        stockQty: z.number().int().min(0).optional(),
        featured: z.boolean().optional(),
        tag: z.string().optional(),
        sortOrder: z.number().int().optional(),
    }),

    // Order (public - from cart)
    orderCreate: z.object({
        customerName: z.string().min(2, 'Name required').max(100),
        customerPhone: z
            .string()
            .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
        customerEmail: z.string().email().optional().or(z.literal('')),
        deliveryAddress: z.string().min(10, 'Address required'),
        deliveryCity: z.string().min(2, 'City required'),
        deliveryPincode: z
            .string()
            .regex(/^4[5-8]\d{4}$/, 'We currently deliver only within Madhya Pradesh'),
        customerGstin: z.string().optional(),
        notes: z.string().optional(),
        items: z
            .array(
                z.object({
                    productId: z.string().uuid('Invalid product ID'),
                    quantity: z.number().int().min(1).max(10),
                })
            )
            .min(1, 'Cart cannot be empty'),
    }),

    // Order status update (admin)
    orderStatus: z.object({
        status: z.enum([
            'PENDING',
            'CONFIRMED',
            'IN_PRODUCTION',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
        ]),
        notes: z.string().optional(),
    }),

    // Payment verify
    paymentVerify: z.object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
    }),

    // Enquiry
    enquiry: z.object({
        type: z.enum(['CONTACT', 'CUSTOM_ORDER']).default('CONTACT'),
        name: z.string().min(2, 'Name required').max(100),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
        email: z.string().email().optional().or(z.literal('')),
        city: z.string().optional(),
        pincode: z.string().optional(),
        pieceType: z.string().optional(),
        dimensions: z.string().optional(),
        fabric: z.string().optional(),
        budget: z.string().optional(),
        message: z.string().max(1000).optional(),
    }),
};