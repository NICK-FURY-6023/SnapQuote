import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './colors';
import { ThemeColors, ThemeMode } from '../types';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkTheme,
  mode: 'dark',
  isDark: true,
});

interface ThemeProviderProps {
  children: React.ReactNode;
  overrideMode?: ThemeMode;
}

export function ThemeProvider({ children, overrideMode }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const mode: ThemeMode = overrideMode ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const isDark = mode === 'dark';

  const value = useMemo(
    () => ({
      colors: isDark ? darkTheme : lightTheme,
      mode,
      isDark,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
