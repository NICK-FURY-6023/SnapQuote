import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { LockScreen } from './src/screens/LockScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useSettingsStore } from './src/stores/settingsStore';
import { useQuotationStore } from './src/stores/quotationStore';
import { initDatabase } from './src/database/sqlite';

function AppContent() {
    const { mode, setTheme } = useTheme();
    const { isUnlocked, lock, checkSession } = useAuthStore();
    const { loadSettings, settings } = useSettingsStore();
    const [dbReady, setDbReady] = useState(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const init = async () => {
            try {
                await initDatabase();
                await checkSession();
                setDbReady(true);
                await loadSettings();
            } catch (err) {
                console.error('Failed to initialize database:', err);
                setDbReady(true); // Still allow app to proceed
            }
        };
        init();
    }, []);

    // Load saved theme from settings
    useEffect(() => {
        if (settings?.theme) {
            setTheme(settings.theme);
        }
    }, [settings?.theme]);

    // Auto-save draft and lock on app background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/active/) &&
                (nextAppState === 'background' || nextAppState === 'inactive')
            ) {
                // Auto-save any in-progress quotation
                await useQuotationStore.getState().autoSaveDraft();
                // We DON'T lock immediately anymore on background 
                // We rely on session check at startup and re-focus
            }
            if (nextAppState === 'active') {
                await checkSession();
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, []);

    if (!dbReady) {
        return (
            <View style={[styles.loading, { backgroundColor: mode === 'dark' ? '#000' : '#fff' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            {isUnlocked ? <AppNavigator /> : <LockScreen />}
        </>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
