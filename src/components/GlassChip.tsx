import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, spacing, fontSize, fontWeight } from '../theme/tokens';

type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface GlassChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: string;
  style?: ViewStyle;
}

export default function GlassChip({ label, variant = 'default', icon, style }: GlassChipProps) {
  const { colors } = useTheme();

  const variantColors: Record<ChipVariant, { bg: string; text: string; dot: string }> = {
    default: { bg: colors.glass, text: colors.textSecondary, dot: colors.textSecondary },
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success, dot: colors.success },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: colors.warning, dot: colors.warning },
    error: { bg: 'rgba(239, 68, 68, 0.15)', text: colors.error, dot: colors.error },
    info: { bg: 'rgba(59, 130, 246, 0.15)', text: colors.info, dot: colors.info },
  };

  const vc = variantColors[variant];

  return (
    <View style={[styles.chip, { backgroundColor: vc.bg, borderRadius: borderRadius.full }, style]}>
      <View style={[styles.dot, { backgroundColor: vc.dot }]} />
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, { color: vc.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  icon: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
