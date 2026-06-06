import { z } from 'zod';

export const unitTypes = ['Pc', 'Kg', 'Ltr', 'Mtr', 'Ft', 'Box', 'Set', 'Bag', 'Nos'] as const;

export const QuotationItemSchema = z.object({
  id: z.string().uuid(),
  quotation_id: z.string().uuid(),
  item_no: z.number().int().positive(),
  item_name: z.string().max(200),
  quantity: z.number().min(0),
  unit: z.enum(unitTypes),
  rate: z.number().min(0),
  discount_type: z.enum(['percent', 'fixed', 'none']),
  discount_value: z.number().min(0),
  discount_amount: z.number().min(0),
  tax_percent: z.number().min(0).max(100),
  tax_amount: z.number().min(0),
  total: z.number().min(0),
  image_url: z.string().url().nullable(),
  description: z.string().nullable(),
});

export const QuotationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().min(1),
  quote_number: z.string().min(1),
  customer_name: z.string().max(200),
  phone: z.string().max(20),
  address: z.string().max(500),
  quote_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(QuotationItemSchema),
  subtotal: z.number().min(0),
  discount_type: z.enum(['overall', 'per_item']),
  discount_percent: z.number().min(0).max(100),
  discount_amount: z.number().min(0),
  extra_charge: z.number().min(0),
  tax_type: z.enum(['gst', 'vat', 'none']),
  tax_percent: z.number().min(0).max(100),
  tax_amount: z.number().min(0),
  final_total: z.number().min(0),
  currency: z.string().length(3),
  currency_symbol: z.string().length(1),
  exchange_rate: z.number().min(0.01),
  template_id: z.string().nullable(),
  sync_status: z.enum(['pending', 'synced', 'conflict']),
  notes: z.string().max(1000),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ClientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().min(1),
  name: z.string().min(1).max(200),
  phone: z.string().max(20),
  address: z.string().max(500),
  email: z.string().email().nullable().or(z.literal('')),
  total_quotes: z.number().int().min(0),
  total_spent: z.number().min(0),
  last_quote_date: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
});

export const SettingsSchema = z.object({
  company_name: z.string().max(200),
  company_phone: z.string().max(20),
  company_address: z.string().max(500),
  company_email: z.string().email().or(z.literal('')),
  currency: z.string().length(1),
  currency_code: z.string().length(3),
  theme: z.enum(['light', 'dark']),
  biometric_enabled: z.boolean(),
  discord_webhook_url: z.string().url().nullable().or(z.literal('')),
  gst_registered: z.boolean(),
  gst_number: z.string().max(20).nullable(),
  auto_update_enabled: z.boolean(),
});

export function validateQuotation(data: unknown) {
  return QuotationSchema.safeParse(data);
}

export function validateSettings(data: unknown) {
  return SettingsSchema.safeParse(data);
}

export function validateClient(data: unknown) {
  return ClientSchema.safeParse(data);
}
