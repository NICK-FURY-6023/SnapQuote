import * as SQLite from 'expo-sqlite';
import { Quotation, QuotationItem, Settings, Client, Template, TemplateItem } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('snapquote-v2.db');
    db.execSync('PRAGMA journal_mode = WAL;');
    db.execSync('PRAGMA foreign_keys = ON;');
    await initTables();
  }
  return db;
}

async function initTables(): Promise<void> {
  const d = await getDb();

  await d.execAsync(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'local',
      quote_number TEXT NOT NULL,
      customer_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      quote_date TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'overall',
      discount_percent REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      extra_charge REAL NOT NULL DEFAULT 0,
      tax_type TEXT NOT NULL DEFAULT 'none',
      tax_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      final_total REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      currency_symbol TEXT NOT NULL DEFAULT '₹',
      exchange_rate REAL NOT NULL DEFAULT 1,
      template_id TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      item_no INTEGER NOT NULL,
      item_name TEXT NOT NULL DEFAULT '',
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'Pc',
      rate REAL NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'none',
      discount_value REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT,
      created_at TEXT,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'local',
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      email TEXT,
      total_quotes INTEGER NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      last_quote_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'local',
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      discount_percent REAL NOT NULL DEFAULT 0,
      extra_charge REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      currency_symbol TEXT NOT NULL DEFAULT '₹',
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS template_items (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      item_no INTEGER NOT NULL,
      item_name TEXT NOT NULL DEFAULT '',
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'Pc',
      rate REAL NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'none',
      discount_value REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      user_id TEXT NOT NULL DEFAULT 'local',
      company_name TEXT NOT NULL DEFAULT '',
      company_phone TEXT NOT NULL DEFAULT '',
      company_address TEXT NOT NULL DEFAULT '',
      company_email TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT '₹',
      currency_code TEXT NOT NULL DEFAULT 'INR',
      theme TEXT NOT NULL DEFAULT 'dark',
      biometric_enabled INTEGER NOT NULL DEFAULT 0,
      discord_webhook_url TEXT,
      gst_registered INTEGER NOT NULL DEFAULT 0,
      gst_number TEXT,
      auto_update_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_quotations_user ON quotations(user_id);
    CREATE INDEX IF NOT EXISTS idx_quotations_sync ON quotations(sync_status);
    CREATE INDEX IF NOT EXISTS idx_items_quotation ON quotation_items(quotation_id);
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
    CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
    CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
  `);

  // Ensure default settings exist
  const existing = await d.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM settings WHERE id = ?',
    'default',
  );
  if (!existing || existing.count === 0) {
    await d.runAsync(
      `INSERT INTO settings (id, user_id, created_at, updated_at)
       VALUES (?, 'local', datetime('now'), datetime('now'))`,
      'default',
    );
  }
}

// ─── Quotations ─────────────────────────────────────────────────

export async function getAllQuotations(): Promise<Quotation[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<Quotation>('SELECT * FROM quotations ORDER BY created_at DESC');
  return rows;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<Quotation>('SELECT * FROM quotations WHERE id = ?', id);
  return row ?? null;
}

export async function saveQuotation(q: Quotation): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    `INSERT OR REPLACE INTO quotations (
      id, user_id, quote_number, customer_name, phone, address, quote_date,
      subtotal, discount_type, discount_percent, discount_amount, extra_charge,
      tax_type, tax_percent, tax_amount, final_total, currency, currency_symbol,
      exchange_rate, template_id, sync_status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    q.id, q.user_id, q.quote_number, q.customer_name, q.phone, q.address, q.quote_date,
    q.subtotal, q.discount_type, q.discount_percent, q.discount_amount, q.extra_charge,
    q.tax_type, q.tax_percent, q.tax_amount, q.final_total, q.currency, q.currency_symbol,
    q.exchange_rate, q.template_id, q.sync_status, q.notes, q.created_at, q.updated_at,
  );
}

export async function deleteQuotation(id: string): Promise<void> {
  const d = await getDb();
  await d.runAsync('DELETE FROM quotation_items WHERE quotation_id = ?', id);
  await d.runAsync('DELETE FROM quotations WHERE id = ?', id);
}

export async function searchQuotations(query: string): Promise<Quotation[]> {
  const d = await getDb();
  const search = `%${query}%`;
  const rows = await d.getAllAsync<Quotation>(
    `SELECT * FROM quotations
     WHERE customer_name LIKE ? OR quote_number LIKE ? OR phone LIKE ?
     ORDER BY created_at DESC`,
    search, search, search,
  );
  return rows;
}

// ─── Quotation Items ────────────────────────────────────────────

export async function getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<QuotationItem>(
    'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY item_no',
    quotationId,
  );
  return rows;
}

export async function saveQuotationItems(items: QuotationItem[]): Promise<void> {
  if (items.length === 0) return;
  const d = await getDb();
  const stmt = await d.prepareAsync(
    `INSERT OR REPLACE INTO quotation_items (
      id, quotation_id, item_no, item_name, quantity, unit, rate,
      discount_type, discount_value, discount_amount, tax_percent, tax_amount,
      total, image_url, description, created_at
    ) VALUES ($id, $qid, $no, $name, $qty, $unit, $rate, $dtype, $dval, $damt, $tper, $tamt, $tot, $img, $desc, $cat)`,
  );
  for (const item of items) {
    await stmt.executeAsync({
      $id: item.id,
      $qid: item.quotation_id,
      $no: item.item_no,
      $name: item.item_name,
      $qty: item.quantity,
      $unit: item.unit,
      $rate: item.rate,
      $dtype: item.discount_type,
      $dval: item.discount_value,
      $damt: item.discount_amount,
      $tper: item.tax_percent,
      $tamt: item.tax_amount,
      $tot: item.total,
      $img: item.image_url ?? null,
      $desc: item.description ?? null,
      $cat: item.created_at ?? new Date().toISOString(),
    });
  }
  await stmt.finalizeAsync();
}

export async function deleteQuotationItems(quotationId: string): Promise<void> {
  const d = await getDb();
  await d.runAsync('DELETE FROM quotation_items WHERE quotation_id = ?', quotationId);
}

// ─── Clients ────────────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  const d = await getDb();
  return await d.getAllAsync<Client>('SELECT * FROM clients ORDER BY name ASC');
}

export async function searchClients(query: string): Promise<Client[]> {
  const d = await getDb();
  const search = `%${query}%`;
  return await d.getAllAsync<Client>(
    'SELECT * FROM clients WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC',
    search, search,
  );
}

export async function getClientByPhone(phone: string): Promise<Client | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<Client>('SELECT * FROM clients WHERE phone = ?', phone);
  return row ?? null;
}

export async function saveClient(client: Client): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    `INSERT OR REPLACE INTO clients (
      id, user_id, name, phone, address, email,
      total_quotes, total_spent, last_quote_date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    client.id, client.user_id, client.name, client.phone, client.address,
    client.email, client.total_quotes, client.total_spent,
    client.last_quote_date, client.notes, client.created_at,
  );
}

// ─── Templates ──────────────────────────────────────────────────

export async function getAllTemplates(): Promise<Template[]> {
  const d = await getDb();
  return await d.getAllAsync<Template>(
    'SELECT * FROM templates ORDER BY usage_count DESC',
  );
}

export async function getTemplateWithItems(id: string): Promise<{ template: Template; items: TemplateItem[] } | null> {
  const d = await getDb();
  const template = await d.getFirstAsync<Template>('SELECT * FROM templates WHERE id = ?', id);
  if (!template) return null;
  const items = await d.getAllAsync<TemplateItem>(
    'SELECT * FROM template_items WHERE template_id = ? ORDER BY item_no',
    id,
  );
  return { template, items };
}

export async function saveTemplate(template: Template, items: TemplateItem[]): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    `INSERT OR REPLACE INTO templates (
      id, user_id, name, description, discount_percent, extra_charge,
      currency, currency_symbol, usage_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    template.id, template.user_id, template.name, template.description,
    template.discount_percent, template.extra_charge, template.currency,
    template.currency_symbol, template.usage_count, template.created_at,
  );
  // Replace items
  await d.runAsync('DELETE FROM template_items WHERE template_id = ?', template.id);
  for (const item of items) {
    await d.runAsync(
      `INSERT INTO template_items (id, template_id, item_no, item_name, quantity, unit, rate, discount_type, discount_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item.id, template.id, item.item_no, item.item_name, item.quantity,
      item.unit, item.rate, item.discount_type, item.discount_value,
    );
  }
}

// ─── Settings ───────────────────────────────────────────────────

export async function getSettings(): Promise<Settings | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = ?', 'default');
  return row ?? null;
}

export async function saveSettings(s: Partial<Settings>): Promise<void> {
  const d = await getDb();
  const existing = await getSettings();
  if (!existing) {
    await d.runAsync(
      `INSERT INTO settings (id, user_id, updated_at) VALUES ('default', 'local', datetime('now'))`,
    );
  }
  const fields = Object.keys(s)
    .filter((k) => k !== 'id' && k !== 'created_at')
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.entries(s)
    .filter(([k]) => k !== 'id' && k !== 'created_at')
    .map(([, v]) => (v === undefined ? null : v));
  await d.runAsync(
    `UPDATE settings SET ${fields}, updated_at = datetime('now') WHERE id = 'default'`,
    ...values,
  );
}
