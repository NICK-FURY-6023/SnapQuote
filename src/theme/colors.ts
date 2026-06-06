import { ThemeColors } from '../types';

export const lightTheme: ThemeColors = {
  background: '#F5F5FA',
  backgroundAlt: '#EEEEF4',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8FD',

  glass: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassBlur: 'rgba(255, 255, 255, 0.5)',

  text: '#0F0F1A',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',

  accent: '#4F46E5',
  accentLight: 'rgba(79, 70, 229, 0.12)',
  accentDark: '#3730A3',

  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  border: 'rgba(0, 0, 0, 0.06)',
  inputBg: 'rgba(255, 255, 255, 0.9)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  gradientStart: '#4F46E5',
  gradientMid: '#7C3AED',
  gradientEnd: '#A855F7',
  gradientGlassStart: 'rgba(79, 70, 229, 0.6)',
  gradientGlassEnd: 'rgba(168, 85, 247, 0.4)',
};

export const darkTheme: ThemeColors = {
  background: '#0a0e27',
  backgroundAlt: '#0d1233',
  surface: '#1a1f4e',
  surfaceAlt: '#232a5e',

  glass: 'rgba(26, 31, 78, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBlur: 'rgba(26, 31, 78, 0.4)',

  text: '#F1F1FE',
  textSecondary: '#94A3B8',
  textInverse: '#0F0F1A',

  accent: '#6366F1',
  accentLight: 'rgba(99, 102, 241, 0.2)',
  accentDark: '#4F46E5',

  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#60A5FA',

  border: 'rgba(255, 255, 255, 0.06)',
  inputBg: 'rgba(255, 255, 255, 0.06)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  gradientStart: '#1a1f4e',
  gradientMid: '#0d1233',
  gradientEnd: '#0a0e27',
  gradientGlassStart: 'rgba(99, 102, 241, 0.25)',
  gradientGlassEnd: 'rgba(139, 92, 246, 0.15)',
};
