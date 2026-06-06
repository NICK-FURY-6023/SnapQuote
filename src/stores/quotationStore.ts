import { create } from 'zustand';
import { Quotation, QuotationItem } from '../types';
import * as db from '../database/sqlite';
import { generateId, generateQuoteNumber } from '../utils/id';
import { createEmptyItem, calculateQuotationSummary, calculateItemTotal } from '../utils/calculations';

interface QuotationState {
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  currentItems: QuotationItem[];
  loading: boolean;
  error: string | null;

  loadQuotations: () => Promise<void>;
  createNewQuotation: (templateId?: string) => Promise<void>;
  setCustomerDetails: (details: Partial<Quotation>) => void;
  addItem: () => void;
  duplicateItem: (index: number) => void;
  updateItem: (index: number, field: keyof QuotationItem, value: any) => void;
  removeItem: (index: number) => void;
  setDiscount: (type: 'overall' | 'per_item', percent: number) => void;
  setExtraCharge: (amount: number) => void;
  setTax: (type: 'gst' | 'vat' | 'none', percent: number) => void;
  recalculate: () => void;
  saveCurrentQuotation: () => Promise<void>;
  autoSaveDraft: () => Promise<void>;
  loadQuotation: (id: string) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  clearCurrent: () => void;
  searchQuotations: (query: string) => Promise<void>;
}

export const useQuotationStore = create<QuotationState>((set, get) => ({
  quotations: [],
  currentQuotation: null,
  currentItems: [],
  loading: false,
  error: null,

  loadQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const quotations = await db.getAllQuotations();
      // Load items for each quotation
      const withItems = await Promise.all(
        quotations.map(async (q) => {
          const items = await db.getQuotationItems(q.id);
          return { ...q, items };
        }),
      );
      set({ quotations: withItems, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Failed to load quotations' });
    }
  },

  createNewQuotation: async (templateId?: string) => {
    const id = generateId();
    const now = new Date().toISOString();
    const quotation: Quotation = {
      id,
      user_id: 'local',
      customer_name: '',
      phone: '',
      address: '',
      quote_date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      discount_type: 'overall',
      discount_percent: 0,
      discount_amount: 0,
      extra_charge: 0,
      tax_type: 'none',
      tax_percent: 0,
      tax_amount: 0,
      final_total: 0,
      currency: 'INR',
      currency_symbol: '₹',
      exchange_rate: 1,
      quote_number: generateQuoteNumber(),
      template_id: templateId ?? null,
      sync_status: 'pending',
      notes: '',
      created_at: now,
      updated_at: now,
    };

    let items: QuotationItem[];

    if (templateId) {
      const template = await db.getTemplateWithItems(templateId);
      if (template) {
        items = template.items.map((t) => ({
          ...createEmptyItem(id, t.item_no),
          item_name: t.item_name,
          quantity: t.quantity,
          unit: t.unit,
          rate: t.rate,
          discount_type: t.discount_type,
          discount_value: t.discount_value,
        }));
        quotation.discount_percent = template.template.discount_percent;
        quotation.extra_charge = template.template.extra_charge;
        quotation.currency = template.template.currency;
        quotation.currency_symbol = template.template.currency_symbol;
      } else {
        items = [createEmptyItem(id, 1)];
      }
    } else {
      items = [createEmptyItem(id, 1)];
    }

    quotation.items = items;
    set({ currentQuotation: quotation, currentItems: items, error: null });
    get().recalculate();
  },

  setCustomerDetails: (details) => {
    const current = get().currentQuotation;
    if (!current) return;
    const updated = {
      ...current,
      ...details,
      updated_at: new Date().toISOString(),
    };
    updated.items = get().currentItems;
    set({ currentQuotation: updated });
  },

  addItem: () => {
    const items = [...get().currentItems];
    const quotation = get().currentQuotation;
    if (!quotation) return;
    const newItem = createEmptyItem(quotation.id, items.length + 1);
    items.push(newItem);
    set({ currentItems: items });
    if (get().currentQuotation) {
      const q = { ...get().currentQuotation!, items };
      set({ currentQuotation: q });
    }
  },

  duplicateItem: (index: number) => {
    const items = [...get().currentItems];
    if (index < 0 || index >= items.length) return;
    const source = items[index];
    const duplicate = { ...createEmptyItem(source.quotation_id, items.length + 1), ...source, id: generateId(), item_no: items.length + 1 };
    items.splice(index + 1, 0, duplicate);
    items.forEach((item, i) => (item.item_no = i + 1));
    set({ currentItems: items });
    if (get().currentQuotation) {
      set({ currentQuotation: { ...get().currentQuotation!, items } });
    }
    get().recalculate();
  },

  updateItem: (index, field, value) => {
    const items = [...get().currentItems];
    if (index < 0 || index >= items.length) return;

    (items[index] as Record<string, any>)[field] = value;

    // Recalculate item total if relevant fields change
    if (['quantity', 'rate', 'discount_type', 'discount_value', 'tax_percent'].includes(field)) {
      const calc = calculateItemTotal(items[index]);
      items[index].discount_amount = calc.discount_amount;
      items[index].tax_amount = calc.tax_amount;
      items[index].total = calc.total;
    }

    set({ currentItems: items });
    if (get().currentQuotation) {
      set({ currentQuotation: { ...get().currentQuotation!, items } });
    }
    get().recalculate();
  },

  removeItem: (index) => {
    const items = get().currentItems.filter((_, i) => i !== index);
    items.forEach((item, i) => (item.item_no = i + 1));
    set({ currentItems: items });
    if (get().currentQuotation) {
      set({ currentQuotation: { ...get().currentQuotation!, items } });
    }
    get().recalculate();
  },

  setDiscount: (type, percent) => {
    const current = get().currentQuotation;
    if (!current) return;
    set({
      currentQuotation: {
        ...current,
        discount_type: type,
        discount_percent: percent,
      },
    });
    get().recalculate();
  },

  setExtraCharge: (amount) => {
    const current = get().currentQuotation;
    if (!current) return;
    set({ currentQuotation: { ...current, extra_charge: amount } });
    get().recalculate();
  },

  setTax: (type, percent) => {
    const current = get().currentQuotation;
    if (!current) return;
    set({
      currentQuotation: {
        ...current,
        tax_type: type,
        tax_percent: percent,
      },
    });
    get().recalculate();
  },

  recalculate: () => {
    const items = get().currentItems;
    const current = get().currentQuotation;
    if (!current) return;

    const summary = calculateQuotationSummary(
      items,
      current.discount_percent,
      current.extra_charge,
      current.tax_percent,
      current.tax_type,
    );

    set({
      currentQuotation: {
        ...current,
        subtotal: summary.subtotal,
        discount_amount: summary.discount_amount,
        tax_amount: summary.tax_amount,
        final_total: summary.final_total,
        items,
        updated_at: new Date().toISOString(),
      },
    });
  },

  saveCurrentQuotation: async () => {
    const q = get().currentQuotation;
    const items = get().currentItems;
    if (!q) return;

    set({ loading: true, error: null });
    try {
      get().recalculate();
      const updated = get().currentQuotation!;
      updated.items = items;
      updated.quote_number = updated.quote_number || generateQuoteNumber();

      await db.saveQuotation(updated);
      await db.deleteQuotationItems(updated.id);
      if (items.length > 0) {
        await db.saveQuotationItems(items);
      }
      await get().loadQuotations();
      set({ loading: false });
    } catch (err) {
      set({ loading: false, error: 'Failed to save quotation' });
    }
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
    set({ loading: true, error: null });
    try {
      const quotation = await db.getQuotationById(id);
      if (!quotation) {
        set({ loading: false, error: 'Quotation not found' });
        return;
      }
      const items = await db.getQuotationItems(id);
      quotation.items = items;
      set({ currentQuotation: quotation, currentItems: items, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Failed to load quotation' });
    }
  },

  deleteQuotation: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.deleteQuotation(id);
      await get().loadQuotations();
    } catch (err) {
      set({ loading: false, error: 'Failed to delete quotation' });
    }
  },

  clearCurrent: () => {
    set({ currentQuotation: null, currentItems: [], error: null });
  },

  searchQuotations: async (query) => {
    set({ loading: true, error: null });
    try {
      const results = await db.searchQuotations(query);
      const withItems = await Promise.all(
        results.map(async (q) => {
          const items = await db.getQuotationItems(q.id);
          return { ...q, items };
        }),
      );
      set({ quotations: withItems, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Search failed' });
    }
  },
}));
