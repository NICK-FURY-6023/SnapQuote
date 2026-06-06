import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, spacing, shadow as shadowTokens } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: number;
  noBlur?: boolean;
}

export default function GlassCard({ children, onPress, style, intensity = 40, noBlur = false }: GlassCardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    overflow: 'hidden',
  };

  const content = (
    <>
      {/* Glass background overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? colors.surface : colors.glass,
            opacity: 0.85,
          },
        ]}
      />
      {/* If blur is requested, layer it */}
      {!noBlur && isDark && (
        <BlurView
          blurAmount={Math.round(intensity / 2)}
          blurType="dark"
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </>
  );

  // For light mode: use clean card with shadow
  if (!isDark) {
    const lightCardStyle: ViewStyle = {
      ...cardStyle,
      backgroundColor: colors.surface,
      ...shadowTokens.sm,
      shadowColor: colors.shadow,
    };

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[lightCardStyle, style]}>
          {children}
        </TouchableOpacity>
      );
    }
    return <View style={[lightCardStyle, style]}>{children}</View>;
  }

  // Dark mode: glass card with blur
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[cardStyle, style]}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyle, style]}>{content}</View>;
}
