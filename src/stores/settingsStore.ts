import { create } from 'zustand';
import { Settings, ThemeMode } from '../types';
import * as db from '../database/sqlite';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  saving: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await db.getSettings();
      set({ settings, loading: false });
    } catch (err) {
      set({ loading: false, error: 'Failed to load settings' });
    }
  },

  updateSettings: async (updates: Partial<Settings>) => {
    set({ saving: true, error: null });
    try {
      await db.saveSettings(updates);
      const current = get().settings;
      set({
        settings: current ? { ...current, ...updates } : updates as Settings,
        saving: false,
      });
    } catch (err) {
      set({ saving: false, error: 'Failed to save settings' });
    }
  },

  setTheme: async (theme: ThemeMode) => {
    await get().updateSettings({ theme } as Partial<Settings>);
  },

  resetSettings: async () => {
    set({ saving: true, error: null });
    try {
      const defaults: Partial<Settings> = {
        company_name: '',
        company_phone: '',
        company_address: '',
        company_email: '',
        currency: '₹',
        currency_code: 'INR',
        theme: 'dark',
        biometric_enabled: false,
        discord_webhook_url: null,
        gst_registered: false,
        gst_number: null,
        auto_update_enabled: true,
      };
      await db.saveSettings(defaults);
      set({ settings: defaults as Settings, saving: false });
    } catch (err) {
      set({ saving: false, error: 'Failed to reset settings' });
    }
  },
}));
