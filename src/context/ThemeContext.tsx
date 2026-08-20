/**
 * KONEX ThemeContext
 * Billion Dollar Code - Production Ready
 * 
 * Provides theme state and actions throughout the app
 * 
 * Usage:
 * const { theme, isDark, toggleTheme, setThemeMode } = useTheme();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { trackEvent } from '../config/analytics';
import { AppTheme, DarkTheme, LightTheme } from '../config/theme';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  // State
  theme: AppTheme;
  isDark: boolean;
  themeMode: ThemeMode;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Helpers
  getCurrentTheme: () => AppTheme;
  getCurrentColors: () => AppTheme['colors'];
  getCurrentSpacing: () => AppTheme['spacing'];
  getCurrentTypography: () => AppTheme['typography'];
  getCurrentBorderRadius: () => AppTheme['borderRadius'];
  getCurrentShadows: () => AppTheme['shadows'];
}

// ============================================
// 2. CONSTANTS
// ============================================

const THEME_STORAGE_KEY = '@konex/theme_mode';
const DEFAULT_THEME_MODE: ThemeMode = 'system';

// ============================================
// 3. CONTEXT
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// 4. PROVIDER
// ============================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // 5. INITIALIZATION
  // ============================================

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        logger.error('❌ Failed to load theme from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // ============================================
  // 6. THEME COMPUTATION
  // ============================================

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  // ============================================
  // 7. ACTIONS
  // ============================================

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      
      // Track theme change
      trackEvent('theme_changed', {
        from: themeMode,
        to: mode,
        isDark: mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark'),
      });
      
      logger.debug('🎨 Theme changed', { from: themeMode, to: mode });
    } catch (error) {
      logger.error('❌ Failed to save theme to storage', error);
    }
  }, [themeMode, systemColorScheme]);

  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  // ============================================
  // 8. HELPERS
  // ============================================

  const getCurrentTheme = useCallback(() => theme, [theme]);
  const getCurrentColors = useCallback(() => theme.colors, [theme]);
  const getCurrentSpacing = useCallback(() => theme.spacing, [theme]);
  const getCurrentTypography = useCallback(() => theme.typography, [theme]);
  const getCurrentBorderRadius = useCallback(() => theme.borderRadius, [theme]);
  const getCurrentShadows = useCallback(() => theme.shadows, [theme]);

  // ============================================
  // 9. CONTEXT VALUE
  // ============================================

  const value = useMemo(() => ({
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    getCurrentTheme,
    getCurrentColors,
    getCurrentSpacing,
    getCurrentTypography,
    getCurrentBorderRadius,
    getCurrentShadows,
  }), [
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    getCurrentTheme,
    getCurrentColors,
    getCurrentSpacing,
    getCurrentTypography,
    getCurrentBorderRadius,
    getCurrentShadows,
  ]);

  // ============================================
  // 10. LOADING STATE
  // ============================================

  // if (isLoading) return null;

  // ============================================
  // 11. EXPORT
  // ============================================

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================
// 12. HOOK
// ============================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ============================================
// 13. DEFAULT EXPORT
// ============================================

export default ThemeProvider;