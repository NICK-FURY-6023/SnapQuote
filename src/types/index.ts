// SnapQuote v2 — Type definitions

// ─── Quotation ──────────────────────────────────────────────────
export interface Quotation {
  id: string;
  user_id: string;
  quote_number: string;
  customer_name: string;
  phone: string;
  address: string;
  quote_date: string;
  items: QuotationItem[];
  subtotal: number;
  discount_type: 'overall' | 'per_item';
  discount_percent: number;
  discount_amount: number;
  extra_charge: number;
  tax_type: 'gst' | 'vat' | 'none';
  tax_percent: number;
  tax_amount: number;
  final_total: number;
  currency: string;
  currency_symbol: string;
  exchange_rate: number;
  template_id: string | null;
  sync_status: 'pending' | 'synced' | 'conflict';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  item_no: number;
  item_name: string;
  quantity: number;
  unit: UnitType;
  rate: number;
  discount_type: 'percent' | 'fixed' | 'none';
  discount_value: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  image_url: string | null;
  description: string | null;
  created_at?: string;
}

export type UnitType = 'Pc' | 'Kg' | 'Ltr' | 'Mtr' | 'Ft' | 'Box' | 'Set' | 'Bag' | 'Nos';

// ─── Client ─────────────────────────────────────────────────────
export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  total_quotes: number;
  total_spent: number;
  last_quote_date: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Template ───────────────────────────────────────────────────
export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string;
  items: TemplateItem[];
  discount_percent: number;
  extra_charge: number;
  currency: string;
  currency_symbol: string;
  usage_count: number;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  template_id: string;
  item_no: number;
  item_name: string;
  quantity: number;
  unit: UnitType;
  rate: number;
  discount_type: 'percent' | 'fixed' | 'none';
  discount_value: number;
}

// ─── Settings ───────────────────────────────────────────────────
export interface Settings {
  id: string;
  user_id: string;
  company_name: string;
  company_phone: string;
  company_address: string;
  company_email: string;
  currency: string;
  currency_code: string;
  theme: ThemeMode;
  biometric_enabled: boolean;
  discord_webhook_url: string | null;
  gst_registered: boolean;
  gst_number: string | null;
  auto_update_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─── Theme ──────────────────────────────────────────────────────
export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;

  // Glass
  glass: string;
  glassBorder: string;
  glassBlur: string;

  // Text
  text: string;
  textSecondary: string;
  textInverse: string;

  // Accent
  accent: string;
  accentLight: string;
  accentDark: string;

  // Semantic
  error: string;
  success: string;
  warning: string;
  info: string;

  // UI
  border: string;
  inputBg: string;
  shadow: string;

  // Gradients
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  gradientGlassStart: string;
  gradientGlassEnd: string;
}

export type ThemeMode = 'light' | 'dark';

// ─── Sync ───────────────────────────────────────────────────────
export interface SyncResult {
  synced: number;
  errors: number;
  failedIds: string[];
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// ─── Async state machine ────────────────────────────────────────
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; retry?: () => void };

// ─── Autofill ───────────────────────────────────────────────────
export interface AutofillResult {
  item_name: string;
  rate: number;
  image_url: string | null;
  description: string | null;
  source: 'cache' | 'google_shopping' | 'scrapingbee' | 'open_food_facts' | 'none';
  confidence: number; // 0-1
  price_last_fetched: string;
}

// ─── OCR ────────────────────────────────────────────────────────
export interface OCRResult {
  raw_text: string;
  items: OCRParsedItem[];
  confidence: number;
}

export interface OCRParsedItem {
  item_name: string;
  quantity: number;
  unit: UnitType;
  rate: number;
}
