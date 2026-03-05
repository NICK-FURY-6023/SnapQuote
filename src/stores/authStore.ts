import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const PASSWORD_KEY = 'snapquote_app_password';
const DEFAULT_PASSWORD = '-@Nick_FURY#6023';

interface AuthState {
    isUnlocked: boolean;
    error: string;
    checkPassword: (input: string) => Promise<boolean>;
    initPassword: () => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
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

    checkPassword: async (input: string) => {
        const stored = await SecureStore.getItemAsync(PASSWORD_KEY);
        const password = stored || DEFAULT_PASSWORD;
        if (input === password) {
            set({ isUnlocked: true, error: '' });
            return true;
        }
        set({ error: 'Incorrect password. Please try again.' });
        return false;
    },

    changePassword: async (newPassword: string) => {
        await SecureStore.setItemAsync(PASSWORD_KEY, newPassword);
    },

    lock: () => {
        set({ isUnlocked: false, error: '' });
    },
}));
