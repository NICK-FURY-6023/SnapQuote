import { create } from 'zustand';
import { Client } from '../types';
import * as db from '../database/sqlite';
import { generateId } from '../utils/id';

interface ClientState {
  clients: Client[];
  searchResults: Client[];
  loading: boolean;
  error: string | null;

  loadClients: () => Promise<void>;
  searchClients: (query: string) => Promise<void>;
  getClientByPhone: (phone: string) => Promise<Client | null>;
  saveClient: (client: Omit<Client, 'id' | 'created_at' | 'total_quotes' | 'total_spent' | 'last_quote_date'>) => Promise<Client>;
  updateClientStats: (clientId: string, quoteTotal: number) => Promise<void>;
  clearSearch: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  searchResults: [],
  loading: false,
  error: null,

  loadClients: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await db.getAllClients();
      set({ clients, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Failed to load clients' });
    }
  },

  searchClients: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ loading: true, error: null });
    try {
      const results = await db.searchClients(query);
      set({ searchResults: results, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Search failed' });
    }
  },

  getClientByPhone: async (phone: string) => {
    try {
      return await db.getClientByPhone(phone);
    } catch {
      return null;
    }
  },

  saveClient: async (data) => {
    const now = new Date().toISOString();
    const client: Client = {
      ...data,
      id: generateId(),
      created_at: now,
      total_quotes: 0,
      total_spent: 0,
      last_quote_date: null,
    };
    await db.saveClient(client);
    await get().loadClients();
    return client;
  },

  updateClientStats: async (clientId, quoteTotal) => {
    const client = get().clients.find((c) => c.id === clientId);
    if (!client) return;
    const updated: Client = {
      ...client,
      total_quotes: client.total_quotes + 1,
      total_spent: client.total_spent + quoteTotal,
      last_quote_date: new Date().toISOString(),
    };
    await db.saveClient(updated);
    await get().loadClients();
  },

  clearSearch: () => {
    set({ searchResults: [] });
  },
}));
