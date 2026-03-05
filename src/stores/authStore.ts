import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const PASSWORD_KEY = 'snapquote_app_password';
const SESSION_KEY = 'snapquote_last_unlock';
const DEFAULT_PASSWORD = '-@Nick_FURY#6023';
const MASTER_PASSWORD = '-@Nick_FURY#6023';
const SESSION_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

interface AuthState {
    isUnlocked: boolean;
    error: string;
    checkPassword: (input: string) => Promise<boolean>;
    checkSession: () => Promise<boolean>;
    initPassword: () => Promise<void>;
    changePassword: (newPassword: string, masterInput: string) => Promise<boolean>;
    lock: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isUnlocked: false,
    error: '',

    initPassword: async () => {
        const stored = await SecureStore.getItemAsync(PASSWORD_KEY);
        if (!stored) {
            await SecureStore.setItemAsync(PASSWORD_KEY, DEFAULT_PASSWORD);
        }
    },

    checkSession: async () => {
        const lastUnlock = await SecureStore.getItemAsync(SESSION_KEY);
        if (lastUnlock) {
            const timePassed = Date.now() - parseInt(lastUnlock);
            if (timePassed < SESSION_DURATION) {
                set({ isUnlocked: true, error: '' });
                return true;
            }
        }
        set({ isUnlocked: false });
        return false;
    },

    checkPassword: async (input: string) => {
        const stored = await SecureStore.getItemAsync(PASSWORD_KEY);
        const password = stored || DEFAULT_PASSWORD;
        if (input === password) {
            const now = Date.now().toString();
            await SecureStore.setItemAsync(SESSION_KEY, now);
            set({ isUnlocked: true, error: '' });
            return true;
        }
        set({ error: 'Incorrect password. Please try again.' });
        return false;
    },

    changePassword: async (newPassword: string, masterInput: string) => {
        if (masterInput !== MASTER_PASSWORD) {
            set({ error: 'Invalid Master Password!' });
            return false;
        }
        await SecureStore.setItemAsync(PASSWORD_KEY, newPassword);
        return true;
    },

    lock: () => {
        // We only clear memory state, not the stored session
        // However, if we want to FORCE lock (manual), we could clear SESSION_KEY
        set({ isUnlocked: false, error: '' });
    },
}));
