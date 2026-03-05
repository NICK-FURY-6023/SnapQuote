import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

import { HomeScreen } from '../screens/HomeScreen';
import { SavedQuotations } from '../screens/SavedQuotations';
import { SettingsScreen } from '../screens/SettingsScreen';
import { QuotationEditor } from '../screens/QuotationEditor';
import { CustomerDetails } from '../screens/CustomerDetails';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { TextInputScreen } from '../screens/TextInputScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ label: string; icon: string; focused: boolean }> = ({ label, icon, focused }) => {
    const { colors } = useTheme();
    return (
        <View style={tabStyles.iconContainer}>
            <Text style={[tabStyles.icon, { opacity: focused ? 1 : 0.5 }]}>{icon}</Text>
            <Text style={[tabStyles.label, { color: focused ? colors.accent : colors.textSecondary }]}>{label}</Text>
        </View>
    );
};

const tabStyles = StyleSheet.create({
    iconContainer: { alignItems: 'center', paddingTop: 8 },
    icon: { fontSize: 22 },
    label: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});

function HomeTabs() {
    const { colors, mode } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: mode === 'dark' ? '#0a0e27' : '#FFFFFF',
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    paddingBottom: 0,
                    ...(mode === 'light' ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.1,
                        shadowRadius: 24,
                        elevation: 8,
                    } : {}),
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Quotes"
                component={SavedQuotations}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Quotes" icon="📋" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Scan"
                component={ScanScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Scan" icon="📸" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Settings" icon="⚙️" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { colors } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                    ...TransitionPresets.SlideFromRightIOS,
                    gestureEnabled: true,
                }}
            >
                <Stack.Screen name="HomeTabs" component={HomeTabs} />
                <Stack.Screen name="QuotationEditor" component={QuotationEditor} />
                <Stack.Screen name="CustomerDetails" component={CustomerDetails} />
                <Stack.Screen name="PreviewScreen" component={PreviewScreen} />
                <Stack.Screen name="SavedQuotations" component={SavedQuotations} />
                <Stack.Screen name="TextInputScreen" component={TextInputScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
