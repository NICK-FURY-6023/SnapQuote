import * as SQLite from 'expo-sqlite';
import { Quotation, QuotationItem, Settings } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase(): Promise<void> {
    db = await SQLite.openDatabaseAsync('snapquote.db');

    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'local',
      customer_name TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      quote_date TEXT DEFAULT '',
      subtotal REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      extra_charge REAL DEFAULT 0,
      final_total REAL DEFAULT 0,
      quote_number TEXT DEFAULT '',
      sync_status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      item_no INTEGER NOT NULL DEFAULT 1,
      item_name TEXT NOT NULL DEFAULT '',
      quantity REAL DEFAULT 0,
      unit TEXT DEFAULT 'Pc',
      rate REAL DEFAULT 0,
      total REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'local',
      user_id TEXT NOT NULL DEFAULT 'local',
      company_name TEXT DEFAULT '',
      company_phone TEXT DEFAULT '',
      company_address TEXT DEFAULT '',
      currency TEXT DEFAULT '₹',
      theme TEXT DEFAULT 'dark',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

    // Insert default settings if not exists
    const existing = await db.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = ?', ['local']);
    if (!existing) {
        await db.runAsync(
            'INSERT INTO settings (id, user_id, company_name, currency, theme) VALUES (?, ?, ?, ?, ?)',
            ['local', 'local', 'My Company', '₹', 'dark']
        );
    }
}

// ===================== QUOTATIONS =====================

export async function saveQuotation(q: Quotation): Promise<void> {
    await db.runAsync(
        `INSERT OR REPLACE INTO quotations 
    (id, user_id, customer_name, phone, address, quote_date, subtotal, discount_percent, discount_amount, extra_charge, final_total, quote_number, sync_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.user_id, q.customer_name, q.phone, q.address, q.quote_date, q.subtotal, q.discount_percent, q.discount_amount, q.extra_charge, q.final_total, q.quote_number, q.sync_status || 'pending', q.created_at, q.updated_at]
    );
}

export async function getAllQuotations(): Promise<Quotation[]> {
    return await db.getAllAsync<Quotation>('SELECT * FROM quotations ORDER BY created_at DESC');
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
    return await db.getFirstAsync<Quotation>('SELECT * FROM quotations WHERE id = ?', [id]);
}

export async function deleteQuotation(id: string): Promise<void> {
    await db.runAsync('DELETE FROM quotations WHERE id = ?', [id]);
}

export async function getUnsyncedQuotations(): Promise<Quotation[]> {
    return await db.getAllAsync<Quotation>("SELECT * FROM quotations WHERE sync_status = 'pending'");
}

export async function markQuotationSynced(id: string): Promise<void> {
    await db.runAsync("UPDATE quotations SET sync_status = 'synced' WHERE id = ?", [id]);
}

// ===================== QUOTATION ITEMS =====================

export async function saveQuotationItems(items: QuotationItem[]): Promise<void> {
    for (const item of items) {
        await db.runAsync(
            `INSERT OR REPLACE INTO quotation_items 
      (id, quotation_id, item_no, item_name, quantity, unit, rate, total, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.id, item.quotation_id, item.item_no, item.item_name, item.quantity, item.unit, item.rate, item.total, item.created_at || new Date().toISOString()]
        );
    }
}

export async function getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
    return await db.getAllAsync<QuotationItem>(
        'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY item_no ASC',
        [quotationId]
    );
}

export async function deleteQuotationItems(quotationId: string): Promise<void> {
    await db.runAsync('DELETE FROM quotation_items WHERE quotation_id = ?', [quotationId]);
}

// ===================== SETTINGS =====================

export async function getSettings(): Promise<Settings | null> {
    return await db.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = ?', ['local']);
}

export async function updateSettings(s: Partial<Settings>): Promise<void> {
    const current = await getSettings();
    if (!current) return;

    await db.runAsync(
        `UPDATE settings SET 
      company_name = ?, company_phone = ?, company_address = ?, 
      currency = ?, theme = ?, updated_at = datetime('now')
    WHERE id = ?`,
        [
            s.company_name ?? current.company_name,
            s.company_phone ?? current.company_phone,
            s.company_address ?? current.company_address,
            s.currency ?? current.currency,
            s.theme ?? current.theme,
            'local',
        ]
    );
}
