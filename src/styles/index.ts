/**
 * KONEX Styles - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * Central export for all styles
 */

export * from './colors';
export * from './globalStyles';
export * from './mixins';
export * from './spacing';
export * from './typography';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  // Colors
  LIGHT_COLORS: require('./colors').LIGHT_COLORS,
  DARK_COLORS: require('./colors').DARK_COLORS,
  COMMON_COLORS: require('./colors').COMMON_COLORS,
  
  // Global Styles
  GLOBAL_STYLES: require('./globalStyles').GLOBAL_STYLES,
  
  // Mixins
  flexCenter: require('./mixins').flexCenter,
  flexRow: require('./mixins').flexRow,
  shadow: require('./mixins').shadow,
  cardStyle: require('./mixins').cardStyle,
  textEllipsis: require('./mixins').textEllipsis,
  heading: require('./mixins').heading,
  
  // Spacing
  SPACING: require('./spacing').SPACING,
  MARGINS: require('./spacing').MARGINS,
  PADDINGS: require('./spacing').PADDINGS,
  
  // Typography
  FONT_SIZES: require('./typography').FONT_SIZES,
  FONT_WEIGHTS: require('./typography').FONT_WEIGHTS,
  TYPOGRAPHY: require('./typography').TYPOGRAPHY,
};