import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Quotation, QuotationItem, Settings } from '../types';

function generatePdfHtml(q: Quotation, items: QuotationItem[], settings: Settings): string {
  const itemRows = items.map((item, i) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:center;">${i + 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;">${item.item_name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:center;">${item.quantity} ${item.unit}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:right;">${settings.currency}${Number(item.rate).toFixed(2)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;">${settings.currency}${Number(item.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const discountedAmount = q.subtotal - q.discount_amount;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 40px; background: #fff; }
      .header { display: flex; justify-content: space-between; margin-bottom: 32px; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; }
      .company-name { font-size: 24px; font-weight: 700; color: #3B82F6; }
      .company-details { font-size: 12px; color: #6B7280; margin-top: 4px; }
      .quote-title { font-size: 28px; font-weight: 700; text-align: right; color: #111; }
      .quote-number { font-size: 13px; color: #3B82F6; text-align: right; margin-top: 4px; }
      .quote-date { font-size: 13px; color: #6B7280; text-align: right; }
      .customer-section { background: #F8F9FA; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 8px; font-weight: 600; }
      .customer-name { font-size: 18px; font-weight: 600; }
      .customer-detail { font-size: 13px; color: #6B7280; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      thead th { background: #1E293B; color: #fff; padding: 12px 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
      thead th:first-child { border-radius: 8px 0 0 0; }
      thead th:last-child { border-radius: 0 8px 0 0; }
      .summary { margin-left: auto; width: 300px; }
      .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
      .summary-row.total { border-top: 2px solid #3B82F6; padding-top: 12px; margin-top: 8px; }
      .summary-row.total .label, .summary-row.total .value { font-size: 20px; font-weight: 700; color: #3B82F6; }
      .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="company-name">${settings.company_name || 'SnapQuote'}</div>
        <div class="company-details">${settings.company_phone ? settings.company_phone + '<br/>' : ''}${settings.company_address || ''}</div>
      </div>
      <div>
        <div class="quote-title">QUOTATION</div>
        <div class="quote-number">${q.quote_number}</div>
        <div class="quote-date">${q.quote_date}</div>
      </div>
    </div>

    <div class="customer-section">
      <div class="section-label">Bill To</div>
      <div class="customer-name">${q.customer_name}</div>
      ${q.phone ? `<div class="customer-detail">${q.phone}</div>` : ''}
      ${q.address ? `<div class="customer-detail">${q.address}</div>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:center;width:50px;">No</th>
          <th style="text-align:left;">Item Description</th>
          <th style="text-align:center;width:100px;">Quantity</th>
          <th style="text-align:right;width:100px;">Rate</th>
          <th style="text-align:right;width:120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span class="label">Items Total</span>
        <span class="value">${settings.currency}${Number(q.subtotal).toFixed(2)}</span>
      </div>
      ${q.discount_percent > 0 ? `
      <div class="summary-row">
        <span class="label">Discount (${q.discount_percent}%)</span>
        <span class="value" style="color:#EF4444;">-${settings.currency}${Number(q.discount_amount).toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span class="label">Discounted Amount</span>
        <span class="value">${settings.currency}${discountedAmount.toFixed(2)}</span>
      </div>` : ''}
      ${q.extra_charge > 0 ? `
      <div class="summary-row">
        <span class="label">Extra Charge</span>
        <span class="value" style="color:#16A34A;">+${settings.currency}${Number(q.extra_charge).toFixed(2)}</span>
      </div>` : ''}
      <div class="summary-row total">
        <span class="label">FINAL PAYABLE</span>
        <span class="value">${settings.currency}${Number(q.final_total).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      Generated by SnapQuote • Thank you for your business
    </div>
  </body>
  </html>`;
}

export async function generatePdf(q: Quotation, items: QuotationItem[], settings: Settings): Promise<string> {
  const html = generatePdfHtml(q, items, settings);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Rename to meaningful filename
  const fileName = `SnapQuote_${q.quote_number}_${q.customer_name.replace(/\s+/g, '_')}.pdf`;
  const newUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.moveAsync({ from: uri, to: newUri });
  return newUri;
}

export async function sharePdf(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Quotation PDF' });
  }
}
