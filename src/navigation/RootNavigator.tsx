import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../theme/ThemeProvider';
import { navigationRef, RootStackParamList } from './navigationRef';
import { MainNavigator } from './MainNavigator';
import LockScreen from '../screens/LockScreen';
import NewQuotationScreen from '../screens/NewQuotationScreen';
import EditQuotationScreen from '../screens/EditQuotationScreen';
import CustomerScreen from '../screens/CustomerScreen';
import PreviewScreen from '../screens/PreviewScreen';
import ScanScreen from '../screens/ScanScreen';
import TextInputScreen from '../screens/TextInputScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isUnlocked, loading, checkSession } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    async function init() {
      await checkSession();
      await loadSettings();
      SplashScreen.hide();
    }
    init();
  }, []);

  if (loading) return null;

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          {!isUnlocked ? (
            <Stack.Screen
              name="Lock"
              component={LockScreen}
              options={{ animation: 'fade' }}
            />
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NewQuotation"
                component={NewQuotationScreen}
                options={{ presentation: 'card', title: 'New Quotation' }}
              />
              <Stack.Screen
                name="EditQuotation"
                component={EditQuotationScreen}
                options={{ presentation: 'card', title: 'Edit Quotation' }}
              />
              <Stack.Screen
                name="Customer"
                component={CustomerScreen}
                options={{ presentation: 'card', title: 'Customer Details' }}
              />
              <Stack.Screen
                name="Preview"
                component={PreviewScreen}
                options={{ presentation: 'card', title: 'Preview' }}
              />
              <Stack.Screen
                name="Scan"
                component={ScanScreen}
                options={{ presentation: 'card', title: 'Scan Product' }}
              />
              <Stack.Screen
                name="TextInput"
                component={TextInputScreen}
                options={{ presentation: 'card', title: 'Quick Entry' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
