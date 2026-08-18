/**
 * KONEX useTheme Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides theme management
 * 
 * Usage:
 * const { theme, isDark, toggleTheme, setThemeMode } = useTheme();
 */

import { useCallback } from 'react';
import { trackEvent } from '../config/analytics';
import { useTheme as useThemeContext } from '../context/ThemeContext';

export interface UseThemeReturn {
  theme: any;
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
  shadows: any;
}

export const useTheme = (): UseThemeReturn => {
  const { theme, isDark, themeMode, setThemeMode } = useThemeContext();

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
    
    trackEvent('theme_changed', {
      from: themeMode,
      to: newMode,
    });
  }, [themeMode, setThemeMode]);

  return {
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
  };
};

export default useTheme;