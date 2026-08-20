/**
 * Re-export single ThemeProvider from context to avoid dual theme systems.
 */
export { ThemeProvider, useTheme } from '../context/ThemeContext';
export type { ThemeContextType, ThemeMode } from '../context/ThemeContext';
export { ThemeProvider as default } from '../context/ThemeContext';
