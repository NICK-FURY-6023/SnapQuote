import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 40 }) => {
    const { mode, colors } = useTheme();

    if (mode === 'dark') {
        return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.glassBorder }, style]}>
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
});
