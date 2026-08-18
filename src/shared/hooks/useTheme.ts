/**
 * KONEX useTheme Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides theme context with dark/light mode support
 * 
 * Usage:
 * const { theme, toggleTheme, isDark } = useTheme();
 */

import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Theme } from '../../providers/ThemeProvider';

// ============================================
// 1. TYPES
// ============================================

export interface UseThemeReturn {
  /** Current theme object */
  theme: Theme;
  /** Toggle between dark and light mode */
  toggleTheme: () => void;
  /** Is dark mode enabled */
  isDark: boolean;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    isDark: context.isDark,
  };
};

export default useTheme;