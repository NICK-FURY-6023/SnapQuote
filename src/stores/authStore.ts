import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'snapquote_session';
const BIOMETRIC_KEY = 'snapquote_biometric_enabled';
const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface AuthState {
  isUnlocked: boolean;
  isBiometricAvailable: boolean;
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  unlockWithPasscode: (passcode: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  setPasscode: (passcode: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  lock: () => Promise<void>;
}

async function getStoredSession(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

async function getStoredPasscode(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('snapquote_passcode');
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isUnlocked: false,
  isBiometricAvailable: false,
  biometricEnabled: false,
  loading: true,
  error: null,

  checkSession: async () => {
    try {
      set({ loading: true, error: null });
      const session = await getStoredSession();
      const biometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_KEY);

      if (session) {
        const timestamp = parseInt(session, 10);
        const elapsed = Date.now() - timestamp;
        if (elapsed < SESSION_DURATION_MS) {
          set({ isUnlocked: true, biometricEnabled: biometricEnabled === 'true', loading: false });
          return;
        }
      }

      // Check if biometric is available
      const { LocalAuthentication } = require('expo-local-authentication');
      const compatible = await LocalAuthentication.hasHardwareAsync();
      set({
        isUnlocked: false,
        isBiometricAvailable: compatible,
        biometricEnabled: biometricEnabled === 'true',
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: 'Failed to check session', isUnlocked: false });
    }
  },

  unlockWithPasscode: async (passcode: string): Promise<boolean> => {
    try {
      set({ error: null });
      const stored = await getStoredPasscode();

      if (!stored) {
        // No passcode set yet — accept any and save it (first-time setup)
        await SecureStore.setItemAsync('snapquote_passcode', passcode);
        await SecureStore.setItemAsync(SESSION_KEY, String(Date.now()));
        set({ isUnlocked: true, loading: false });
        return true;
      }

      if (passcode === stored) {
        await SecureStore.setItemAsync(SESSION_KEY, String(Date.now()));
        set({ isUnlocked: true, loading: false });
        return true;
      }

      set({ error: 'Incorrect passcode' });
      return false;
    } catch (err) {
      set({ error: 'Authentication failed' });
      return false;
    }
  },

  unlockWithBiometric: async (): Promise<boolean> => {
    try {
      set({ error: null });
      const { LocalAuthentication } = require('expo-local-authentication');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SnapQuote',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        await SecureStore.setItemAsync(SESSION_KEY, String(Date.now()));
        set({ isUnlocked: true, loading: false });
        return true;
      }

      set({ error: 'Biometric authentication failed' });
      return false;
    } catch (err) {
      set({ error: 'Biometric authentication unavailable' });
      return false;
    }
  },

  setPasscode: async (passcode: string) => {
    await SecureStore.setItemAsync('snapquote_passcode', passcode);
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, String(enabled));
    set({ biometricEnabled: enabled });
  },

  lock: async () => {
    try {
      await SecureStore.setItemAsync(SESSION_KEY, String(0));
    } catch {
      // Ignore — we still lock even if secure store write fails
    }
    set({ isUnlocked: false });
  },
}));
