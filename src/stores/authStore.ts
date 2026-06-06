import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';

const SESSION_KEY = 'snapquote_session';
const BIOMETRIC_KEY = 'snapquote_biometric_enabled';
const PASSCODE_KEY = 'snapquote_passcode';
const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const rnBiometrics = new ReactNativeBiometrics();

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

async function getSecureItem(key: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials && typeof credentials === 'object' && 'password' in credentials) {
      return credentials.password;
    }
    return null;
  } catch {
    return null;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(key, value, { service: key });
  } catch {
    console.warn('Keychain write failed for:', key);
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
      const session = await getSecureItem(SESSION_KEY);
      const biometricEnabled = await getSecureItem(BIOMETRIC_KEY);

      if (session) {
        const timestamp = parseInt(session, 10);
        const elapsed = Date.now() - timestamp;
        if (elapsed < SESSION_DURATION_MS) {
          set({ isUnlocked: true, biometricEnabled: biometricEnabled === 'true', loading: false });
          return;
        }
      }

      // Check if biometric is available
      const { available } = await rnBiometrics.isSensorAvailable();
      set({
        isUnlocked: false,
        isBiometricAvailable: available,
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
      const stored = await getSecureItem(PASSCODE_KEY);

      if (!stored) {
        // No passcode set yet — accept any and save it (first-time setup)
        await setSecureItem(PASSCODE_KEY, passcode);
        await setSecureItem(SESSION_KEY, String(Date.now()));
        set({ isUnlocked: true, loading: false });
        return true;
      }

      if (passcode === stored) {
        await setSecureItem(SESSION_KEY, String(Date.now()));
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
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock SnapQuote',
        cancelButtonText: 'Use Passcode',
      } as any);

      if (success) {
        await setSecureItem(SESSION_KEY, String(Date.now()));
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
    await setSecureItem(PASSCODE_KEY, passcode);
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await setSecureItem(BIOMETRIC_KEY, String(enabled));
    set({ biometricEnabled: enabled });
  },

  lock: async () => {
    try {
      await setSecureItem(SESSION_KEY, String(0));
    } catch {
      // Ignore — we still lock even if secure store write fails
    }
    set({ isUnlocked: false });
  },
}));
