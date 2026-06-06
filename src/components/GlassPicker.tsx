import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import GlassModal from './GlassModal';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, spacing, fontSize, fontWeight } from '../theme/tokens';

interface PickerOption {
  label: string;
  value: string;
}

interface GlassPickerProps {
  options: PickerOption[];
  selected: string;
  onSelect: (value: string) => void;
  label?: string;
  placeholder?: string;
  title?: string;
}

export default function GlassPicker({
  options,
  selected,
  onSelect,
  label,
  placeholder = 'Select...',
  title = 'Select',
}: GlassPickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === selected);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.glassBorder,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        <Text style={[styles.triggerText, { color: selectedOption ? colors.text : colors.textSecondary }]}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

      <GlassModal visible={visible} onClose={() => setVisible(false)} title={title}>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item.value);
                setVisible(false);
              }}
              style={[
                styles.optionItem,
                {
                  backgroundColor: item.value === selected ? colors.accentLight : 'transparent',
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: item.value === selected ? colors.accent : colors.text,
                    fontWeight: item.value === selected ? fontWeight.semibold : fontWeight.regular,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.value === selected && (
                <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  arrow: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: 2,
  },
  optionText: {
    fontSize: fontSize.md,
  },
  checkmark: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
