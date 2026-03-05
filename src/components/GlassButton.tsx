import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'glass' | 'danger' | 'success';
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    title, onPress, variant = 'glass', icon, style, textStyle,
    loading = false, disabled = false, fullWidth = false,
}) => {
    const { colors, mode } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#E5E7EB';
        switch (variant) {
            case 'primary': return colors.accent;
            case 'danger': return colors.error;
            case 'success': return '#16A34A';
            default: return mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.textSecondary;
        if (variant === 'primary' || variant === 'danger' || variant === 'success') return '#FFFFFF';
        return colors.text;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: variant === 'glass' ? colors.glassBorder : 'transparent',
                    borderWidth: variant === 'glass' ? 1 : 0,
                    ...(mode === 'light' && variant === 'glass' ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 2,
                    } : {}),
                },
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: getTextColor(), marginLeft: icon ? 8 : 0 }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
