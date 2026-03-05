import React, { createContext, useContext, useState, useCallback } from 'react';
import { ThemeColors, ThemeMode } from '../types';
import { lightTheme, darkTheme } from './colors';

interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    colors: darkTheme,
    toggleTheme: () => { },
    setTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('dark');

    const colors = mode === 'dark' ? darkTheme : lightTheme;

    const toggleTheme = useCallback(() => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const setTheme = useCallback((newMode: ThemeMode) => {
        setMode(newMode);
    }, []);

    return (
        <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
