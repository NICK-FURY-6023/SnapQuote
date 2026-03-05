import { ThemeColors } from '../types';

export const lightTheme: ThemeColors = {
    background: '#FFFFFF',
    card: '#F8F9FA',
    cardAlt: '#F0F4FF',
    glass: 'rgba(255,255,255,0.75)',
    glassBorder: '#E5E7EB',
    text: '#111111',
    textSecondary: '#6B7280',
    accent: '#3C3CF6',
    accentLight: 'rgba(60,60,246,0.12)',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#16A34A',
    warning: '#F59E0B',
    inputBg: '#FFFFFF',
    gradientStart: '#3030D1',
    gradientEnd: '#6C6CF8',
};

export const darkTheme: ThemeColors = {
    background: '#0a0e27',    // Deep navy background
    card: '#1a1f4e',          // Lighter navy for cards
    cardAlt: '#232a5e',       // Even lighter for alternating cards
    glass: 'rgba(26, 31, 78, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    text: '#F8FAFC',          // Very light blue-white
    textSecondary: '#94A3B8', // Muted slate gray
    accent: '#3C3CF6',        // Electric indigo accent
    accentLight: 'rgba(60, 60, 246, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#EF4444',
    success: '#10B981',       // Slightly brighter green
    warning: '#F59E0B',
    inputBg: 'rgba(255, 255, 255, 0.05)',
    gradientStart: '#1a1f4e',
    gradientEnd: '#0a0e27',
};
