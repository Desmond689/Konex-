// src/config/theme.config.ts
import { Theme } from '@react-navigation/native';

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
};

export const LightTheme = {
  colors: {
    // Brand
    primary: Colors.primary[600],
    primaryLight: Colors.primary[400],
    primaryDark: Colors.primary[800],
    primarySurface: Colors.primary[50],

    // Background
    background: Colors.neutral[50],
    backgroundSecondary: Colors.neutral[100],
    backgroundTertiary: Colors.neutral[200],

    // Surface
    surface: '#FFFFFF',
    surfaceSecondary: Colors.neutral[50],
    surfaceTertiary: Colors.neutral[100],

    // Text
    text: Colors.neutral[900],
    textSecondary: Colors.neutral[600],
    textMuted: Colors.neutral[400],
    textInverse: '#FFFFFF',

    // Border
    border: Colors.neutral[200],
    borderLight: Colors.neutral[100],
    borderDark: Colors.neutral[300],

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.05)',
    shadowHeavy: 'rgba(0, 0, 0, 0.1)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',

    // Status
    success: Colors.success[500],
    warning: Colors.warning[500],
    error: Colors.error[500],
    info: Colors.info[500],

    // Misc
    card: '#FFFFFF',
    input: Colors.neutral[50],
    placeholder: Colors.neutral[400],
    disabled: Colors.neutral[300],
    ripple: Colors.primary[50],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodySmallBold: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    captionBold: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '700',
      lineHeight: 14,
      textTransform: 'uppercase' as const,
      letterSpacing: 1.2,
    },
  },
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 16,
    },
  },
  elevation: {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
  },
  isDark: false,
};

export const DarkTheme = {
  ...LightTheme,
  colors: {
    // Brand
    primary: Colors.primary[400],
    primaryLight: Colors.primary[300],
    primaryDark: Colors.primary[600],
    primarySurface: Colors.primary[950],

    // Background
    background: Colors.neutral[950],
    backgroundSecondary: Colors.neutral[900],
    backgroundTertiary: Colors.neutral[800],

    // Surface
    surface: Colors.neutral[900],
    surfaceSecondary: Colors.neutral[800],
    surfaceTertiary: Colors.neutral[700],

    // Text
    text: Colors.neutral[50],
    textSecondary: Colors.neutral[300],
    textMuted: Colors.neutral[500],
    textInverse: Colors.neutral[950],

    // Border
    border: Colors.neutral[800],
    borderLight: Colors.neutral[900],
    borderDark: Colors.neutral[700],

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHeavy: 'rgba(0, 0, 0, 0.5)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.9)',

    // Status
    success: Colors.success[400],
    warning: Colors.warning[400],
    error: Colors.error[400],
    info: Colors.info[400],

    // Misc
    card: Colors.neutral[900],
    input: Colors.neutral[800],
    placeholder: Colors.neutral[600],
    disabled: Colors.neutral[700],
    ripple: Colors.primary[900],
  },
  isDark: true,
};

export type AppTheme = typeof LightTheme;
export type ThemeColors = typeof LightTheme.colors;