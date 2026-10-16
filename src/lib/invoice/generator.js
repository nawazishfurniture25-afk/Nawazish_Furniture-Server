import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from './template.js';

let browserInstance = null;

/**
 * Get or create browser instance (singleton for performance)
 */
async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });
    }
    return browserInstance;
}

/**
 * Generate PDF invoice buffer
 * @param {Object} order - Full order with items
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePDF(order) {
    const isGSTRegistered = process.env.GST_REGISTERED === 'true';

    const html = generateInvoiceHTML(order, {
        businessName: 'Nawazish Furniture',
        businessAddress:
            '5WWQ+499, Raddi Chowki, Gazi Nagar, Adhartal, Jabalpur, MP — 482004',
        businessPhone: process.env.BUSINESS_PHONE || '+91 97136 24142',
        businessEmail:
            process.env.BUSINESS_EMAIL || 'nawazishfurniture25@gmail.com',
        businessGSTIN: process.env.BUSINESS_GSTIN || '',
        isGSTRegistered,
        logoUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/public/images/logo.png`,
    });

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0mm',
            right: '0mm',
            bottom: '0mm',
            left: '0mm',
        },
    });

    await page.close();

    return pdfBuffer;
}

/**
 * Close browser (for graceful shutdown)
 */
export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}