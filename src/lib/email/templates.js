const BRAND = 'Nawazish Furniture';
const BRAND_COLOR = '#a37b34';
const PHONE = process.env.BUSINESS_PHONE || '+91 9713624142';
const EMAIL =
    process.env.BUSINESS_EMAIL || 'nawazishfurniture25@gmail.com';
const SITE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==================== BASE WRAPPER ====================
const baseWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #f6f1e7;
      margin: 0;
      padding: 20px;
      color: #1a1a1a;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e6dcc6;
    }
    .header {
      background: ${BRAND_COLOR};
      color: #ffffff;
      padding: 24px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 2px;
    }
    .header h1 em { font-style: italic; }
    .body {
      padding: 30px;
      line-height: 1.7;
    }
    .body h2 {
      color: ${BRAND_COLOR};
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .body h3 {
      color: ${BRAND_COLOR};
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    .body p { margin: 10px 0; font-size: 14px; }
    .info-box {
      background: #f9f5ec;
      border-left: 3px solid ${BRAND_COLOR};
      padding: 14px 18px;
      margin: 16px 0;
      font-size: 14px;
      line-height: 1.7;
    }
    .info-box strong { color: #1a1a1a; }
    .btn {
      display: inline-block;
      background: ${BRAND_COLOR};
      color: #ffffff !important;
      padding: 12px 24px;
      text-decoration: none;
      margin: 16px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 11px;
    }
    .footer {
      background: #f9f5ec;
      padding: 20px 30px;
      font-size: 11px;
      color: #666;
      text-align: center;
      border-top: 1px solid #e6dcc6;
    }
    .footer a {
      color: ${BRAND_COLOR};
      text-decoration: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    table th {
      background: #f5f0e6;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid ${BRAND_COLOR};
    }
    table td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    .total {
      font-size: 18px;
      color: ${BRAND_COLOR};
      font-weight: bold;
      text-align: right;
      padding: 16px 0;
      border-top: 2px solid ${BRAND_COLOR};
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NAWAZISH <em>Furniture</em></h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      ${BRAND} · ${PHONE}<br>
      <a href="mailto:${EMAIL}">${EMAIL}</a><br>
      <a href="${SITE_URL}">${SITE_URL}</a>
    </div>
  </div>
</body>
</html>
`;

// ==================== NEW ENQUIRY NOTIFICATION ====================
export function newEnquiryTemplate(enquiry) {
    return baseWrapper(`
    <h2>📩 New Enquiry Received</h2>
    <p>A new enquiry has been submitted on your website.</p>

    <div class="info-box">
      <p><strong>Type:</strong> ${enquiry.type === 'CUSTOM_ORDER'
            ? 'Custom Order Request'
            : 'Contact Form'
        }</p>
      <p><strong>Name:</strong> ${enquiry.name || '-'}</p>
      <p><strong>Phone:</strong> ${enquiry.phone || '-'}</p>
      ${enquiry.email ? `<p><strong>Email:</strong> ${enquiry.email}</p>` : ''}
      ${enquiry.city
            ? `<p><strong>City:</strong> ${enquiry.city}${enquiry.pincode ? ` — ${enquiry.pincode}` : ''
            }</p>`
            : ''
        }
      ${enquiry.pieceType
            ? `<p><strong>Piece Type:</strong> ${enquiry.pieceType}</p>`
            : ''
        }
      ${enquiry.dimensions
            ? `<p><strong>Dimensions:</strong> ${enquiry.dimensions}</p>`
            : ''
        }
      ${enquiry.fabric ? `<p><strong>Fabric:</strong> ${enquiry.fabric}</p>` : ''}
      ${enquiry.budget ? `<p><strong>Budget:</strong> ${enquiry.budget}</p>` : ''}
    </div>

    ${enquiry.message
            ? `
    <div class="info-box">
      <p><strong>Message:</strong></p>
      <p>${enquiry.message.replace(/\n/g, '<br>')}</p>
    </div>
    `
            : ''
        }

    <p style="margin-top: 24px;">
      <a href="${SITE_URL}/admin/enquiries" class="btn">View in Admin Panel</a>
    </p>

    <p style="font-size: 12px; color: #666; margin-top: 20px;">
      <strong>Quick reply:</strong><br>
      WhatsApp: <a href="https://wa.me/91${enquiry.phone}" style="color: ${BRAND_COLOR};">+91 ${enquiry.phone}</a><br>
      Call: <a href="tel:+91${enquiry.phone}" style="color: ${BRAND_COLOR};">+91 ${enquiry.phone}</a>
    </p>
  `);
}

// ==================== NEW ORDER NOTIFICATION (ADMIN) ====================
export function newOrderTemplate(order) {
    const formatPrice = (paise) =>
        '₹' + (paise / 100).toLocaleString('en-IN');

    return baseWrapper(`
    <h2>🛍️ New Order Received</h2>
    <p>You have a new order on Nawazish Furniture.</p>

    <div class="info-box">
      <p><strong>Order #:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(
        order.createdAt
    ).toLocaleString('en-IN')}</p>
      <p><strong>Payment:</strong> ${order.paymentStatus}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    </div>

    <h3>Customer Details</h3>
    <div class="info-box">
      <p><strong>Name:</strong> ${order.customerName}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      ${order.customerEmail
            ? `<p><strong>Email:</strong> ${order.customerEmail}</p>`
            : ''
        }
      <p><strong>Address:</strong><br>${order.deliveryAddress}<br>${order.deliveryCity
        } — ${order.deliveryPincode}</p>
      ${order.customerGstin
            ? `<p><strong>GSTIN:</strong> ${order.customerGstin}</p>`
            : ''
        }
    </div>

    <h3>Items</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
            .map(
                (item) => `
          <tr>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatPrice(item.lineTotal)}</td>
          </tr>
        `
            )
            .join('')}
      </tbody>
    </table>

    <div class="total">
      Total: ${formatPrice(order.totalAmount)}
    </div>

    ${order.notes
            ? `
    <div class="info-box">
      <p><strong>Customer Notes:</strong> ${order.notes}</p>
    </div>
    `
            : ''
        }

    <p style="margin-top: 24px;">
      <a href="${SITE_URL}/admin/orders" class="btn">View Order in Admin</a>
    </p>
  `);
}

// ==================== CUSTOMER ORDER CONFIRMATION ====================
export function orderConfirmationTemplate(order) {
    const formatPrice = (paise) =>
        '₹' + (paise / 100).toLocaleString('en-IN');

    return baseWrapper(`
    <h2>Thank you for your order! 🎉</h2>
    <p>Hi ${order.customerName},</p>
    <p>We've received your order. Our team will contact you shortly on WhatsApp to confirm the details.</p>

    <div class="info-box">
      <p><strong>Order #:</strong> ${order.orderNumber}</p>
      <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    </div>

    <h3>Your Items</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
            .map(
                (item) => `
          <tr>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatPrice(item.lineTotal)}</td>
          </tr>
        `
            )
            .join('')}
      </tbody>
    </table>

    <div class="total">
      Total: ${formatPrice(order.totalAmount)}
    </div>

    <h3>Delivery Address</h3>
    <div class="info-box">
      <p>${order.deliveryAddress}<br>${order.deliveryCity} — ${order.deliveryPincode
        }</p>
    </div>

    <p style="margin-top: 20px;">
      <strong>Payment Terms:</strong> 50% advance, 50% on delivery. We'll call you to confirm.
    </p>

    <p style="margin-top: 20px;">
      Questions? WhatsApp us at <a href="https://wa.me/91${PHONE.replace(
            /\D/g,
            ''
        )}" style="color: ${BRAND_COLOR};">${PHONE}</a>
    </p>

    <p style="margin-top: 24px; font-size: 12px; color: #666;">
      — Team Nawazish Furniture<br>
      Handcrafted in Jabalpur, delivered across Madhya Pradesh
    </p>
  `);
}