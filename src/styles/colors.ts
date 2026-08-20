/**
 * KONEX Colors
 * Billion Dollar Code - Production Ready
 * 
 * Centralized color definitions used throughout the app
 * 
 * Usage:
 * import { COLORS } from '@styles/colors';
 */

// ============================================
// 1. TYPES
// ============================================

export interface ColorPalette {
  // Primary
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySurface: string;
  
  // Secondary
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Background
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textInverse: string;
  
  // Borders
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status
  success: string;
  successLight: string;
  successDark: string;
  
  error: string;
  errorLight: string;
  errorDark: string;
  
  warning: string;
  warningLight: string;
  warningDark: string;
  
  info: string;
  infoLight: string;
  infoDark: string;
  
  // Gaming
  gaming: string;
  gamingLight: string;
  gamingDark: string;
  
  // Cards
  card: string;
  cardShadow: string;
  
  // Misc
  overlay: string;
  divider: string;
  placeholder: string;
  icon: string;
  iconSecondary: string;
}

// ============================================
// 2. LIGHT THEME
// ============================================

export const LIGHT_COLORS: ColorPalette = {
  // Primary
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8A83FF',
  primarySurface: 'rgba(108, 99, 255, 0.1)',
  
  // Secondary
  secondary: '#FF6584',
  secondaryDark: '#E54A6A',
  secondaryLight: '#FF8AA3',
  
  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  surfaceTertiary: '#E9ECEF',
  
  // Text
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  textTertiary: '#6A6A8A',
  textMuted: '#8A8AA8',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E8E8F0',
  borderLight: '#F0F0F6',
  borderDark: '#D0D0D8',
  
  // Status
  success: '#2ED573',
  successLight: 'rgba(46, 213, 115, 0.15)',
  successDark: '#22B861',
  
  error: '#FF4757',
  errorLight: 'rgba(255, 71, 87, 0.15)',
  errorDark: '#E03A4A',
  
  warning: '#FFA502',
  warningLight: 'rgba(255, 165, 2, 0.15)',
  warningDark: '#E09400',
  
  info: '#4A9BFF',
  infoLight: 'rgba(74, 155, 255, 0.15)',
  infoDark: '#3A7FE0',
  
  // Gaming
  gaming: '#6C63FF',
  gamingLight: 'rgba(108, 99, 255, 0.15)',
  gamingDark: '#5A52D5',
  
  // Cards
  card: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.08)',
  
  // Misc
  overlay: 'rgba(0,0,0,0.5)',
  divider: '#E8E8F0',
  placeholder: '#C0C0D0',
  icon: '#4A4A6A',
  iconSecondary: '#8A8AA8',
};

// ============================================
// 3. DARK THEME
// ============================================

export const DARK_COLORS: ColorPalette = {
  // Primary
  primary: '#7C73FF',
  primaryDark: '#6C63FF',
  primaryLight: '#9A93FF',
  primarySurface: 'rgba(108, 99, 255, 0.2)',
  
  // Secondary
  secondary: '#FF7A9A',
  secondaryDark: '#FF6584',
  secondaryLight: '#FF9AB0',
  
  // Background
  background: '#12121E',
  backgroundSecondary: '#1A1A2E',
  surface: '#1A1A2E',
  surfaceSecondary: '#24243E',
  surfaceTertiary: '#2E2E4E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#B8B8D0',
  textTertiary: '#8A8AAA',
  textMuted: '#6A6A8A',
  textInverse: '#1A1A2E',
  
  // Borders
  border: '#2A2A44',
  borderLight: '#3A3A5E',
  borderDark: '#1A1A34',
  
  // Status
  success: '#4AE08A',
  successLight: 'rgba(74, 224, 138, 0.2)',
  successDark: '#2ED573',
  
  error: '#FF6B7A',
  errorLight: 'rgba(255, 107, 122, 0.2)',
  errorDark: '#FF4757',
  
  warning: '#FFB84D',
  warningLight: 'rgba(255, 184, 77, 0.2)',
  warningDark: '#FFA502',
  
  info: '#6AB0FF',
  infoLight: 'rgba(106, 176, 255, 0.2)',
  infoDark: '#4A9BFF',
  
  // Gaming
  gaming: '#7C73FF',
  gamingLight: 'rgba(108, 99, 255, 0.2)',
  gamingDark: '#6C63FF',
  
  // Cards
  card: '#1E1E32',
  cardShadow: 'rgba(0,0,0,0.3)',
  
  // Misc
  overlay: 'rgba(0,0,0,0.7)',
  divider: '#2A2A44',
  placeholder: '#5A5A7A',
  icon: '#B8B8D0',
  iconSecondary: '#6A6A8A',
};

// ============================================
// 4. COMMON COLORS
// ============================================

export const COMMON_COLORS = {
  // Solid colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Grays
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Reds
  red50: '#FFF5F5',
  red100: '#FFE3E3',
  red200: '#FFC9C9',
  red300: '#FFA8A8',
  red400: '#FF8787',
  red500: '#FF6B6B',
  red600: '#FA5252',
  red700: '#F03E3E',
  red800: '#E03131',
  red900: '#C92A2A',
  
  // Greens
  green50: '#F0FFF4',
  green100: '#DBFFEB',
  green200: '#B3F0CC',
  green300: '#8CE0B3',
  green400: '#66D199',
  green500: '#40C580',
  green600: '#2EB872',
  green700: '#1FA063',
  green800: '#118054',
  green900: '#0A6644',
  
  // Blues
  blue50: '#EBF5FF',
  blue100: '#D6E8FF',
  blue200: '#B0D0FF',
  blue300: '#8AB8FF',
  blue400: '#649FFF',
  blue500: '#4A9BFF',
  blue600: '#3A7FE0',
  blue700: '#2A63C0',
  blue800: '#1A47A0',
  blue900: '#0A2B80',
  
  // Purples
  purple50: '#F5F0FF',
  purple100: '#E8D9FF',
  purple200: '#D4B8FF',
  purple300: '#BF97FF',
  purple400: '#AA76FF',
  purple500: '#9555FF',
  purple600: '#7C3AED',
  purple700: '#6C63FF',
  purple800: '#5A52D5',
  purple900: '#4A42B5',
};

// ============================================
// 5. HELPERS
// ============================================

/**
 * Get color by name from common colors
 */
export const getColor = (colorName: keyof typeof COMMON_COLORS): string => {
  return COMMON_COLORS[colorName] || colorName;
};

/**
 * Get color with opacity
 */
export const withOpacity = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Check if color is light
 */
export const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

/**
 * Get contrasting text color
 */
export const getContrastColor = (hex: string): string => {
  return isLightColor(hex) ? '#1A1A2E' : '#FFFFFF';
};

// ============================================
// 6. DEFAULT EXPORT
// ============================================

export default {
  LIGHT_COLORS,
  DARK_COLORS,
  COMMON_COLORS,
  getColor,
  withOpacity,
  isLightColor,
  getContrastColor,
};