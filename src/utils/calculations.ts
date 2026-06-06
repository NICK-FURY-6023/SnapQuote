// SnapQuote v2 — Business logic calculations (pure functions, fully testable)

import { QuotationItem, Quotation } from '../types';
import { generateId } from './id';

export function calculateItemTotal(item: Omit<QuotationItem, 'total' | 'discount_amount' | 'tax_amount' | 'id' | 'quotation_id'>): {
  discount_amount: number;
  tax_amount: number;
  total: number;
} {
  const lineTotal = item.quantity * item.rate;

  let discount_amount = 0;
  if (item.discount_type === 'percent') {
    discount_amount = (lineTotal * item.discount_value) / 100;
  } else if (item.discount_type === 'fixed') {
    discount_amount = Math.min(item.discount_value, lineTotal);
  }

  const afterDiscount = lineTotal - discount_amount;
  const tax_amount = item.tax_percent > 0
    ? (afterDiscount * item.tax_percent) / 100
    : 0;

  const total = afterDiscount + tax_amount;

  return {
    discount_amount: Math.round(discount_amount * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export interface QuotationSummary {
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  tax_amount: number;
  final_total: number;
}

export function calculateQuotationSummary(
  items: QuotationItem[],
  discountPercent: number,
  extraCharge: number,
  taxPercent: number,
  taxType: 'gst' | 'vat' | 'none',
): QuotationSummary {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const overallDiscount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - overallDiscount;
  const taxableAmount = afterDiscount + extraCharge;

  let taxAmount = 0;
  if (taxType === 'gst') {
    // GST is applied on taxable amount
    taxAmount = (taxableAmount * taxPercent) / 100;
  } else if (taxType === 'vat') {
    taxAmount = (taxableAmount * taxPercent) / 100;
  }

  const finalTotal = taxableAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount_amount: Math.round(overallDiscount * 100) / 100,
    taxable_amount: Math.round(taxableAmount * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    final_total: Math.round(finalTotal * 100) / 100,
  };
}

export function createEmptyItem(quotationId: string, itemNo: number): QuotationItem {
  return {
    id: generateId(),
    quotation_id: quotationId,
    item_no: itemNo,
    item_name: '',
    quantity: 0,
    unit: 'Pc',
    rate: 0,
    discount_type: 'none',
    discount_value: 0,
    discount_amount: 0,
    tax_percent: 0,
    tax_amount: 0,
    total: 0,
    image_url: null,
    description: null,
  };
}
