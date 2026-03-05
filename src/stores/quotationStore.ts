import { create } from 'zustand';
import { Quotation, QuotationItem } from '../types';
import * as db from '../database/sqlite';

// Generate a simple UUID
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateQuoteNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `SQ-${y}${m}-${seq}`;
}

interface QuotationState {
    quotations: Quotation[];
    currentQuotation: Quotation | null;
    currentItems: QuotationItem[];
    loading: boolean;

    loadQuotations: () => Promise<void>;
    createNewQuotation: () => void;
    setCustomerDetails: (details: Partial<Quotation>) => void;
    addItem: () => void;
    updateItem: (index: number, field: keyof QuotationItem, value: any) => void;
    removeItem: (index: number) => void;
    setDiscount: (percent: number) => void;
    setExtraCharge: (amount: number) => void;
    recalculate: () => void;
    saveCurrentQuotation: () => Promise<void>;
    autoSaveDraft: () => Promise<void>;
    loadQuotation: (id: string) => Promise<void>;
    deleteQuotation: (id: string) => Promise<void>;
    clearCurrent: () => void;
}

export const useQuotationStore = create<QuotationState>((set, get) => ({
    quotations: [],
    currentQuotation: null,
    currentItems: [],
    loading: false,

    loadQuotations: async () => {
        set({ loading: true });
        const quotations = await db.getAllQuotations();
        set({ quotations, loading: false });
    },

    createNewQuotation: () => {
        const id = generateId();
        const now = new Date().toISOString();
        const quotation: Quotation = {
            id,
            user_id: 'local',
            customer_name: '',
            phone: '',
            address: '',
            quote_date: new Date().toISOString().split('T')[0],
            subtotal: 0,
            discount_percent: 0,
            discount_amount: 0,
            extra_charge: 0,
            final_total: 0,
            quote_number: generateQuoteNumber(),
            sync_status: 'pending',
            created_at: now,
            updated_at: now,
        };

        const firstItem: QuotationItem = {
            id: generateId(),
            quotation_id: id,
            item_no: 1,
            item_name: '',
            quantity: 0,
            unit: 'Pc',
            rate: 0,
            total: 0,
        };

        set({ currentQuotation: quotation, currentItems: [firstItem] });
    },

    setCustomerDetails: (details) => {
        const current = get().currentQuotation;
        if (!current) return;
        set({ currentQuotation: { ...current, ...details, updated_at: new Date().toISOString() } });
    },

    addItem: () => {
        const items = [...get().currentItems];
        const quotation = get().currentQuotation;
        if (!quotation) return;

        items.push({
            id: generateId(),
            quotation_id: quotation.id,
            item_no: items.length + 1,
            item_name: '',
            quantity: 0,
            unit: 'Pc',
            rate: 0,
            total: 0,
        });
        set({ currentItems: items });
    },

    updateItem: (index, field, value) => {
        const items = [...get().currentItems];
        if (index < 0 || index >= items.length) return;

        (items[index] as any)[field] = value;

        if (field === 'quantity' || field === 'rate') {
            items[index].total = Number(items[index].quantity) * Number(items[index].rate);
        }

        set({ currentItems: items });
        get().recalculate();
    },

    removeItem: (index) => {
        const items = get().currentItems.filter((_, i) => i !== index);
        items.forEach((item, i) => (item.item_no = i + 1));
        set({ currentItems: items });
        get().recalculate();
    },

    setDiscount: (percent) => {
        const current = get().currentQuotation;
        if (!current) return;
        set({ currentQuotation: { ...current, discount_percent: percent } });
        get().recalculate();
    },

    setExtraCharge: (amount) => {
        const current = get().currentQuotation;
        if (!current) return;
        set({ currentQuotation: { ...current, extra_charge: amount } });
        get().recalculate();
    },

    recalculate: () => {
        const items = get().currentItems;
        const current = get().currentQuotation;
        if (!current) return;

        const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
        const discountAmount = (subtotal * current.discount_percent) / 100;
        const discountedAmount = subtotal - discountAmount;
        const finalTotal = discountedAmount + Number(current.extra_charge);

        set({
            currentQuotation: {
                ...current,
                subtotal,
                discount_amount: discountAmount,
                final_total: finalTotal,
                updated_at: new Date().toISOString(),
            },
        });
    },

    saveCurrentQuotation: async () => {
        const q = get().currentQuotation;
        const items = get().currentItems;
        if (!q) return;

        get().recalculate();
        const updated = get().currentQuotation!;

        await db.saveQuotation(updated);
        await db.deleteQuotationItems(updated.id);
        await db.saveQuotationItems(items);
        await get().loadQuotations();
    },

    autoSaveDraft: async () => {
        const q = get().currentQuotation;
        const items = get().currentItems;
        if (!q) return;

        try {
            get().recalculate();
            const updated = { ...get().currentQuotation!, sync_status: 'pending' as const };
            await db.saveQuotation(updated);
            await db.deleteQuotationItems(updated.id);
            if (items.length > 0) {
                await db.saveQuotationItems(items);
            }
        } catch (err) {
            console.warn('Auto-save draft failed:', err);
        }
    },

    loadQuotation: async (id) => {
        const quotation = await db.getQuotationById(id);
        if (!quotation) return;
        const items = await db.getQuotationItems(id);
        set({ currentQuotation: quotation, currentItems: items.length > 0 ? items : [] });
    },

    deleteQuotation: async (id) => {
        await db.deleteQuotation(id);
        await get().loadQuotations();
    },

    clearCurrent: () => {
        set({ currentQuotation: null, currentItems: [] });
    },
}));
