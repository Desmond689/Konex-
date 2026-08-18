/**
 * KONEX Constants - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * Central export for all constants
 */

// ============================================
// 1. EXPORTS
// ============================================

export * from './badgeDefinitions';
export * from './games';
export * from './moderation';
export * from './reportReasons';
export * from './roles';
export * from './skills';
export * from './squadTypes';
export * from './styles';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  // Badge exports
  BADGE_DEFINITIONS: require('./badgeDefinitions').BADGE_DEFINITIONS,
  BADGE_CATEGORIES: require('./badgeDefinitions').BADGE_CATEGORIES,
  
  // Game exports
  GAMES: require('./games').GAMES,
  GENRE_LABELS: require('./games').GENRE_LABELS,
  
  // Moderation exports
  MODERATION_ACTIONS: require('./moderation').MODERATION_ACTIONS,
  MODERATION_STATUS: require('./moderation').MODERATION_STATUS,
  CONTENT_TYPES: require('./moderation').CONTENT_TYPES,
  REPORT_REASONS: require('./moderation').REPORT_REASONS,
  
  // Roles exports
  USER_ROLES: require('./roles').USER_ROLES,
  
  // Skills exports
  SKILLS: require('./skills').SKILLS,
  SKILL_LEVELS: require('./skills').SKILL_LEVELS,
  
  // Squad exports
  SQUAD_TYPES: require('./squadTypes').SQUAD_TYPES,
  SQUAD_PRIVACY: require('./squadTypes').SQUAD_PRIVACY,
  
  // Style exports
  SPACING: require('./styles').SPACING,
  BORDER_RADIUS: require('./styles').BORDER_RADIUS,
  FONT_SIZES: require('./styles').FONT_SIZES,
  SHADOWS: require('./styles').SHADOWS,
};