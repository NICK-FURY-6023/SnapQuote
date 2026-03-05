import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Quotation, QuotationItem, Settings } from '../types';

export async function generateExcel(q: Quotation, items: QuotationItem[], settings: Settings): Promise<string> {
    const currency = settings.currency || '₹';

    // Build worksheet data
    const wsData: any[][] = [];

    // Company header
    wsData.push([settings.company_name || 'SnapQuote']);
    wsData.push([settings.company_phone || '', '', '', settings.company_address || '']);
    wsData.push([]);

    // Quotation header
    wsData.push(['QUOTATION', '', '', '', q.quote_number]);
    wsData.push(['Date:', q.quote_date]);
    wsData.push([]);

    // Customer details
    wsData.push(['Bill To:']);
    wsData.push([q.customer_name]);
    if (q.phone) wsData.push([q.phone]);
    if (q.address) wsData.push([q.address]);
    wsData.push([]);

    // Table header
    wsData.push(['No', 'Item Description', 'Quantity', 'Rate', 'Total Amount']);

    // Item rows
    items.forEach((item, i) => {
        wsData.push([
            i + 1,
            item.item_name,
            `${item.quantity} ${item.unit}`,
            Number(item.rate),
            Number(item.total),
        ]);
    });

    wsData.push([]);

    // Summary
    wsData.push(['', '', '', 'Items Total', Number(q.subtotal)]);

    if (q.discount_percent > 0) {
        wsData.push(['', '', '', `Discount (${q.discount_percent}%)`, -Number(q.discount_amount)]);
        wsData.push(['', '', '', 'Discounted Amount', Number(q.subtotal) - Number(q.discount_amount)]);
    }

    if (q.extra_charge > 0) {
        wsData.push(['', '', '', 'Extra Charge', Number(q.extra_charge)]);
    }

    wsData.push(['', '', '', 'FINAL PAYABLE', Number(q.final_total)]);

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 6 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotation');

    // Write to base64
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    // Save file
    const fileName = `SnapQuote_${q.quote_number}_${q.customer_name.replace(/\s+/g, '_')}.xlsx`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });

    return fileUri;
}

export async function shareExcel(uri: string): Promise<void> {
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Share Quotation Excel',
        });
    }
}
