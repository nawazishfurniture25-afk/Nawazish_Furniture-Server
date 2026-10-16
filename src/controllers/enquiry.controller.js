import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendEmail, isEmailConfigured } from '../lib/email/mailer.js';
import { newEnquiryTemplate } from '../lib/email/templates.js';

// ==================== CREATE ENQUIRY ====================
// @desc    Create enquiry (contact / custom order)
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = asyncHandler(async (req, res) => {
    // Save to database
    const enquiry = await prisma.enquiry.create({
        data: req.body,
    });

    console.log('📩 New enquiry saved:', enquiry.id, '-', enquiry.name);

    // Send email notification to admin (non-blocking)
    try {
        const emailConfigured = isEmailConfigured();
        console.log('📧 Email configured?', emailConfigured);

        if (emailConfigured) {
            const result = await sendEmail({
                to: process.env.NOTIFICATION_EMAIL,
                subject: `📩 New ${enquiry.type === 'CUSTOM_ORDER' ? 'Custom Order' : 'Enquiry'
                    } from ${enquiry.name}`,
                html: newEnquiryTemplate(enquiry),
                replyTo: enquiry.email || undefined,
            });

            console.log('✅ Enquiry email sent:', result.messageId);
        } else {
            console.log('⚠️ Email not configured - skipping send');
        }
    } catch (err) {
        console.error('❌ Enquiry email failed:', err.message);
        // Don't fail the request if email fails
    }

    res.status(201).json({
        success: true,
        message: 'Thank you. We will contact you within 24 hours.',
        data: enquiry,
    });
});

// ==================== GET ENQUIRIES (ADMIN) ====================
// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
export const getEnquiries = asyncHandler(async (req, res) => {
    const { status, type } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const enquiries = await prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    res.json({
        success: true,
        count: enquiries.length,
        data: enquiries,
    });
});

// ==================== UPDATE ENQUIRY (ADMIN) ====================
// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id
// @access  Private/Admin
export const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const enquiry = await prisma.enquiry.update({
        where: { id },
        data: { status },
    });

    res.json({
        success: true,
        data: enquiry,
    });
});