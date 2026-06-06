import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
}

export default function GlassContainer({ children, style, gradient = true }: GlassContainerProps) {
  const { colors } = useTheme();

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
