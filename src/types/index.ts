// SnapQuote TypeScript Types

export interface QuotationItem {
    id: string;
    quotation_id: string;
    item_no: number;
    item_name: string;
    quantity: number;
    unit: string;
    rate: number;
    total: number;
    created_at?: string;
}

export interface Quotation {
    id: string;
    user_id: string;
    customer_name: string;
    phone: string;
    address: string;
    quote_date: string;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    extra_charge: number;
    final_total: number;
    quote_number: string;
    sync_status: 'pending' | 'synced' | 'conflict';
    created_at: string;
    updated_at: string;
    items?: QuotationItem[];
}

export interface Settings {
    id: string;
    user_id: string;
    company_name: string;
    company_phone: string;
    company_address: string;
    currency: string;
    theme: 'light' | 'dark';
    created_at?: string;
    updated_at?: string;
}

export interface ThemeColors {
    background: string;
    card: string;
    cardAlt: string;
    glass: string;
    glassBorder: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    inputBg: string;
    gradientStart: string;
    gradientEnd: string;
}

export type ThemeMode = 'light' | 'dark';
