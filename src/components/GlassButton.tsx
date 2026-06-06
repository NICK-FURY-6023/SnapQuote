import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, spacing, fontSize, fontWeight } from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  size = 'md',
}: GlassButtonProps) {
  const { colors } = useTheme();

  const sizeStyles: Record<string, { padding: number; fontSize: number }> = {
    sm: { padding: spacing.sm, fontSize: fontSize.sm },
    md: { padding: spacing.md + 2, fontSize: fontSize.md },
    lg: { padding: spacing.lg, fontSize: fontSize.lg },
  };

  const s = sizeStyles[size];

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    danger: {
      backgroundColor: colors.error,
    },
    success: {
      backgroundColor: colors.success,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textColor = (): string => {
    if (disabled) return colors.textSecondary;
    if (variant === 'primary' || variant === 'danger' || variant === 'success') return '#FFFFFF';
    return colors.text;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles[variant],
        {
          paddingVertical: s.padding,
          borderRadius: borderRadius.lg,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && { borderWidth: 0 },
        style,
      ]}
    >
      {variant === 'primary' && !disabled && (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.lg }]}
        />
      )}
      {loading ? (
        <ActivityIndicator color={textColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: textColor(), fontSize: s.fontSize, marginLeft: icon ? spacing.sm : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});
