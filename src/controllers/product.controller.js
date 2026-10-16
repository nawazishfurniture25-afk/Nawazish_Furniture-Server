import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ==================== PUBLIC ROUTES ====================

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const { category, featured, search } = req.query;

    const where = {};

    if (category && category !== 'All') {
        where.category = category;
    }

    if (featured === 'true') {
        where.featured = true;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { fabric: { contains: search, mode: 'insensitive' } },
        ];
    }

    const products = await prisma.product.findMany({
        where,
        include: {
            images: {
                orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({
        success: true,
        count: products.length,
        data: products,
    });
});

// @desc    Get single product
// @route   GET /api/products/:slugOrId
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
    const { slugOrId } = req.params;

    const product = await prisma.product.findFirst({
        where: {
            OR: [{ slug: slugOrId }, { id: slugOrId }],
        },
        include: {
            images: {
                orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            },
        },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json({
        success: true,
        data: product,
    });
});

// @desc    Get categories list
// @route   GET /api/products/categories/list
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.product.findMany({
        distinct: ['category'],
        select: { category: true },
    });

    const list = ['All', ...categories.map((c) => c.category)];

    res.json({
        success: true,
        data: list,
    });
});

// ==================== ADMIN ROUTES ====================

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const data = req.body;
    const { images, ...productData } = data;

    const product = await prisma.product.create({
        data: {
            ...productData,
            slug: productData.slug.toLowerCase().replace(/\s+/g, '-'),
            images: {
                create: (images || []).map((img, index) => ({
                    url: img.url,
                    alt: img.alt || productData.name,
                    isPrimary: img.isPrimary || index === 0,
                    sortOrder: index,
                })),
            },
        },
        include: {
            images: { orderBy: { sortOrder: 'asc' } },
        },
    });

    res.status(201).json({
        success: true,
        data: product,
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const { images, ...productData } = data;

    const updateData = {
        ...productData,
        ...(images !== undefined && {
            images: {
                deleteMany: {},
                create: images.map((img, index) => ({
                    url: img.url,
                    alt: img.alt || productData.name || 'Product image',
                    isPrimary: img.isPrimary || index === 0,
                    sortOrder: index,
                })),
            },
        }),
    };

    const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
            images: { orderBy: { sortOrder: 'asc' } },
        },
    });

    res.json({
        success: true,
        data: product,
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Product deleted',
    });
});