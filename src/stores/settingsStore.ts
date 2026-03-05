import { create } from 'zustand';
import { Settings } from '../types';
import * as db from '../database/sqlite';

interface SettingsState {
    settings: Settings | null;
    loading: boolean;
    loadSettings: () => Promise<void>;
    updateSettings: (s: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    loading: false,

    loadSettings: async () => {
        set({ loading: true });
        const settings = await db.getSettings();
        set({ settings, loading: false });
    },

    updateSettings: async (s) => {
        await db.updateSettings(s);
        await get().loadSettings();
    },
}));
