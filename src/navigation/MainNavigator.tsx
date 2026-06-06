import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, fontSize, fontWeight, shadow } from '../theme/tokens';
import { MainTabParamList } from './navigationRef';
import HomeScreen from '../screens/HomeScreen';
import QuotesScreen from '../screens/QuotesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, icon, focused, color }: { label: string; icon: string; focused: boolean; color: string }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, { color: focused ? color : color + '80' }]}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: focused ? color : color + '80', fontWeight: focused ? fontWeight.semibold : fontWeight.regular }]}>
        {label}
      </Text>
    </View>
  );
}

export function MainNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute' as const,
          bottom: 20,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glass,
          ...shadow.lg,
          shadowColor: colors.shadow,
          elevation: 8,
          overflow: 'hidden' as const,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          isDark ? (
            <BlurView
              blurType="dark"
              blurAmount={20}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Home" icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quotes"
        component={QuotesScreen}
        options={{
          tabBarLabel: 'Quotes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Quotes" icon="📄" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Settings" icon="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
