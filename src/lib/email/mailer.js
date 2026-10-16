import nodemailer from 'nodemailer';

// Create transporter (singleton)
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

/**
 * Send email
 */
export async function sendEmail({ to, subject, html, text, replyTo }) {
    const mailOptions = {
        from: `"Nawazish Furniture" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html?.replace(/<[^>]*>/g, ''),
        ...(replyTo && { replyTo }),
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        throw err;
    }
}

/**
 * Check if email is configured
 */
export function isEmailConfigured() {
    return !!(
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.NOTIFICATION_EMAIL
    );
}