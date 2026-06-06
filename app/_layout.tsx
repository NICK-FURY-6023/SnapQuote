import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/theme/ThemeProvider';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootContent() {
  const { isUnlocked, loading, checkSession } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    async function init() {
      await checkSession();
      await loadSettings();
      await SplashScreen.hideAsync();
    }
    init();
  }, []);

  // Show nothing while loading (splash screen is up)
  if (loading) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Auth screens */}
        {!isUnlocked ? (
          <Stack.Screen name="lock" options={{ animation: 'fade' }} />
        ) : (
          <>
            {/* Main tab navigation */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Modal / push screens */}
            <Stack.Screen
              name="quotation/new"
              options={{ presentation: 'card', title: 'New Quotation' }}
            />
            <Stack.Screen
              name="quotation/[id]"
              options={{ presentation: 'card', title: 'Edit Quotation' }}
            />
            <Stack.Screen
              name="customer"
              options={{ presentation: 'card', title: 'Customer Details' }}
            />
            <Stack.Screen
              name="preview"
              options={{ presentation: 'card', title: 'Preview' }}
            />
            <Stack.Screen
              name="scan"
              options={{ presentation: 'card', title: 'Scan Product' }}
            />
            <Stack.Screen
              name="text-input"
              options={{ presentation: 'card', title: 'Quick Entry' }}
            />
          </>
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <RootContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
