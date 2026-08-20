export interface UseThemeReturn {
  theme: any;
  toggleTheme: () => void;
  isDark: boolean;
  themeMode?: string;
  setThemeMode?: (mode: any) => void;
}

import { useTheme as useThemeFromContext } from '../../context/ThemeContext';

export const useTheme = (): UseThemeReturn => {
  const ctx = useThemeFromContext();
  return {
    theme: ctx.theme,
    toggleTheme: ctx.toggleTheme,
    isDark: ctx.isDark,
    themeMode: ctx.themeMode,
    setThemeMode: ctx.setThemeMode,
  };
};

export default useTheme;
