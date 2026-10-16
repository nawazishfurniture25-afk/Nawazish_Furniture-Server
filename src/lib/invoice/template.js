/**
 * Generate HTML template for invoice
 * @param {Object} order - Full order object with items
 * @param {Object} config - Business config
 * @returns {String} HTML string
 */
export function generateInvoiceHTML(order, config = {}) {
  const {
    businessName = 'Nawazish Furniture',
    businessAddress = '5WWQ+499, Raddi Chowki, Gazi Nagar, Adhartal, Jabalpur, MP — 482004',
    businessPhone = '+91 97136 24142',
    businessEmail = 'nawazishfurniture25@gmail.com',
    businessGSTIN = '',
    isGSTRegistered = false,
    logoUrl = '',
    signatureUrl = '',   // 👈 NEW — signature image URL
  } = config;

  // ==================== FORMATTERS ====================
  const formatPrice = (paise) => {
    return '₹' + ((Number(paise) || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const invoiceDate = formatDate(order.createdAt);
  const invoiceNumber = order.invoiceNumber || order.orderNumber;

  // ==================== TOTALS (DEFENSIVE) ====================
  // Agar GST-registered nahi → GST ko force 0 karo, chahe DB me kuch bhi ho
  const subtotal = Number(order.subtotal) || 0;
  const gstAmount = isGSTRegistered ? (Number(order.gstAmount) || 0) : 0;
  const shippingAmount = Number(order.shippingAmount) || 0;

  // Total ko recalculate karo — DB ke totalAmount pe bharosa mat karo
  const totalAmount = subtotal + gstAmount + shippingAmount;

  // GST split (CGST + SGST for intra-state)
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  // GST rate (18% assume, ya order se lo)
  const gstRate = 18;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    font-size: 11px;
    line-height: 1.5;
    padding: 30px 40px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 2px solid #c8a464;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 1px;
    color: #1a1a1a;
    margin-bottom: 6px;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .brand-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  .brand em {
    font-style: italic;
    color: #a37b34;
    font-weight: normal;
  }
  .brand-address {
    font-size: 10px;
    color: #666;
    line-height: 1.7;
  }
  .invoice-label {
    text-align: right;
  }
  .invoice-label h1 {
    font-size: 26px;
    font-weight: 300;
    letter-spacing: 2px;
    color: #a37b34;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .invoice-label .num {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 3px;
  }
  .invoice-label .date {
    font-size: 10px;
    color: #666;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 24px;
  }
  .info-block h3 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #a37b34;
    margin-bottom: 8px;
    font-weight: bold;
  }
  .info-block p {
    font-size: 11px;
    color: #333;
    line-height: 1.6;
  }
  .info-block .name {
    font-weight: bold;
    font-size: 12px;
    color: #1a1a1a;
    margin-bottom: 3px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  table thead th {
    background: #f5f0e6;
    color: #1a1a1a;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 10px 8px;
    text-align: left;
    border-bottom: 2px solid #c8a464;
  }
  table thead th.right { text-align: right; }
  table thead th.center { text-align: center; }
  table tbody td {
    padding: 10px 8px;
    border-bottom: 1px solid #eee;
    font-size: 11px;
    color: #333;
    vertical-align: top;
  }
  table tbody td.right { text-align: right; }
  table tbody td.center { text-align: center; }
  table tbody td.item-name {
    font-weight: 600;
    color: #1a1a1a;
  }
  table tbody td.item-meta {
    font-size: 9px;
    color: #888;
    margin-top: 2px;
  }
  .totals-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .totals {
    width: 320px;
    font-size: 11px;
  }
  .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    color: #333;
  }
  .totals .row.sub {
    border-top: 1px solid #eee;
    padding-top: 8px;
  }
  .totals .row.gst {
    font-size: 10px;
    color: #666;
  }
  .totals .row.ship {
    font-size: 11px;
    color: #333;
  }
  .totals .row.ship .free {
    color: #2f4a3c;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  .totals .row.total {
    border-top: 2px solid #c8a464;
    margin-top: 8px;
    padding-top: 12px;
    font-size: 16px;
    font-weight: bold;
    color: #a37b34;
  }
  .totals .row.savings {
    font-size: 10px;
    color: #2f4a3c;
    font-style: italic;
    justify-content: flex-end;
    gap: 6px;
  }
  .notes {
    background: #f9f5ec;
    padding: 12px 14px;
    border-left: 3px solid #c8a464;
    font-size: 10px;
    color: #555;
    margin-bottom: 20px;
    line-height: 1.7;
  }
  .notes strong { color: #1a1a1a; }
  .footer {
    border-top: 1px solid #ddd;
    padding-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .footer-left p {
    font-size: 9px;
    color: #888;
    line-height: 1.8;
  }
  .footer-right {
    text-align: right;
  }
  .footer-right .signature-img {
    display: block;
    height: 50px;
    width: auto;
    object-fit: contain;
    margin-bottom: 4px;
    margin-left: auto;
  }
  .footer-right .signature-line {
    border-bottom: 1px solid #1a1a1a;
    min-width: 150px;
    padding-bottom: 4px;
    margin-bottom: 4px;
    margin-left: auto;
  }
  .footer-right .sig-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .stamp {
    display: inline-block;
    padding: 4px 10px;
    background: #a37b34;
    color: #fff;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 6px;
  }
  .stamp.pending { background: #d8743f; }
  .stamp.paid { background: #2f4a3c; }
  .stamp.cancelled { background: #888; }
</style>
</head>
<body>

  <!-- ==================== HEADER ==================== -->
  <div class="header">
    <div>
      <div class="brand-row">
        ${logoUrl ? `<img src="${logoUrl}" alt="${businessName}" class="brand-logo" />` : ''}
        <div class="brand">Nawazish <em>Furniture</em></div>
      </div>
      <div class="brand-address">
        ${businessAddress}<br>
        ${businessPhone} · ${businessEmail}
        ${isGSTRegistered && businessGSTIN ? `<br><strong>GSTIN:</strong> ${businessGSTIN}` : ''}
      </div>
    </div>
    <div class="invoice-label">
      <h1>${isGSTRegistered ? 'Tax Invoice' : 'Bill of Supply'}</h1>
      <div class="num">#${invoiceNumber}</div>
      <div class="date">Date: ${invoiceDate}</div>
    </div>
  </div>

  <!-- ==================== INFO GRID ==================== -->
  <div class="info-grid">
    <div class="info-block">
      <h3>Billed To</h3>
      <p class="name">${order.customerName}</p>
      <p>
        ${order.deliveryAddress}<br>
        ${order.deliveryCity}, ${order.deliveryPincode}<br>
        Phone: ${order.customerPhone}
        ${order.customerEmail ? `<br>Email: ${order.customerEmail}` : ''}
        ${order.customerGstin ? `<br>GSTIN: ${order.customerGstin}` : ''}
      </p>
    </div>
    <div class="info-block">
      <h3>Order Details</h3>
      <p>
        <strong>Order #:</strong> ${order.orderNumber}<br>
        <strong>Order Date:</strong> ${invoiceDate}<br>
        <strong>Payment:</strong> ${order.paymentMethod || 'Pending'}<br>
        <strong>Status:</strong> ${order.status}
      </p>
    </div>
  </div>

  <!-- ==================== ITEMS TABLE ==================== -->
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Item Description</th>
        <th class="center" style="width: 60px;">Qty</th>
        <th class="right" style="width: 100px;">Rate</th>
        ${isGSTRegistered ? '<th class="center" style="width: 60px;">GST</th>' : ''}
        <th class="right" style="width: 110px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
      .map(
        (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>
            <div class="item-name">${item.productName}</div>
            <div class="item-meta">HSN: ${item.hsnCode || '9401'}</div>
          </td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatPrice(item.unitPrice)}</td>
          ${isGSTRegistered
            ? `<td class="center">${item.gstRate || gstRate}%</td>`
            : ''
          }
          <td class="right">${formatPrice(item.lineTotal)}</td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <!-- ==================== TOTALS ==================== -->
  <div class="totals-wrap">
    <div class="totals">
     <!-- Subtotal -->
<div class="row sub">
  <span>Subtotal</span>
  <span>${formatPrice(subtotal)}</span>
</div>

<!-- GST (only if registered) -->
${isGSTRegistered && gstAmount > 0
      ? `
      <div class="row gst">
        <span>CGST (${gstRate / 2}%)</span>
        <span>${formatPrice(cgst)}</span>
      </div>
      <div class="row gst">
        <span>SGST (${gstRate / 2}%)</span>
        <span>${formatPrice(sgst)}</span>
      </div>
    `
      : ''
    }

<!-- Shipping -->
<div class="row ship">
  <span>Delivery ${shippingAmount > 0 ? '(MP)' : '(MP)'}</span>
  <span>
    ${shippingAmount === 0
      ? '<span class="free">FREE</span>'
      : formatPrice(shippingAmount)
    }
  </span>
</div>

<!-- Total -->
<div class="row total">
  <span>Total</span>
  <span>${formatPrice(totalAmount)}</span>
</div>

<!-- Savings note if non-GST -->
${!isGSTRegistered && (Number(order.gstAmount) || 0) > 0
      ? `<div class="row savings">✓ No GST charged (MSME exemption)</div>`
      : ''
    }

      ${!isGSTRegistered && (Number(order.gstAmount) || 0) > 0
      ? `<div class="row savings">✓ No GST charged (MSME exemption)</div>`
      : ''
    }

      <div style="text-align: right; margin-top: 8px;">
        <span class="stamp ${order.paymentStatus === 'PAID'
      ? 'paid'
      : order.paymentStatus === 'CANCELLED'
        ? 'cancelled'
        : 'pending'
    }">
          ${order.paymentStatus}
        </span>
      </div>
    </div>
  </div>

  <!-- ==================== NOTES ==================== -->
  <div class="notes">
    <strong>Notes:</strong>
    ${isGSTRegistered
      ? `This is a GST-compliant Tax Invoice. GST @ ${gstRate}% (HSN 9401) included in the total. `
      : `This is a Bill of Supply (not a tax invoice) issued under the MSME exemption threshold. No GST charged. `
    }
    ${order.notes ? `<br><br><strong>Customer Notes:</strong> ${order.notes}` : ''}
    <br><br>
    <strong>Terms:</strong> 50% advance on order, 50% on delivery. Warranty: 10 years on frame, 2 years on foam/fabric.
  </div>

  <!-- ==================== FOOTER ==================== -->
  <div class="footer">
    <div class="footer-left">
      <p>
        Thank you for choosing Nawazish Furniture.<br>
        For queries: ${businessPhone} · ${businessEmail}<br>
        Delivered across Madhya Pradesh only.
      </p>
    </div>
    <div class="footer-right">
      ${signatureUrl
      ? `<img src="${signatureUrl}" alt="Signature" class="signature-img" />`
      : ''
    }
      <div class="signature-line"></div>
      <div class="sig-label">Authorised Signatory</div>
    </div>
  </div>

</body>
</html>
  `.trim();
}