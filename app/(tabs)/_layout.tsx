import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/theme/ThemeProvider';
import { borderRadius, spacing, fontSize, fontWeight, shadow } from '../../src/theme/tokens';

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

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  // Glass tab bar
  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: 20,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: isDark ? colors.glass : colors.glass,
    ...shadow.lg,
    shadowColor: colors.shadow,
    elevation: 8,
    overflow: 'hidden' as const,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Home" icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          tabBarLabel: 'Quotes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Quotes" icon="📄" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Settings" icon="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: fontSize.xl,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
