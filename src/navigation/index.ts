/**
 * KONEX Navigation - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * Central export for all navigation components and utilities
 * 
 * Usage:
 * import { AppNavigator, navigate, goBack } from '@navigation';
 */

// Navigators
export { AdminNavigator } from './AdminNavigator';
export { AppNavigator } from './AppNavigator';
export { AuthNavigator } from './AuthNavigator';
export { ChatNavigator } from './ChatNavigator';
export { CommunityNavigator } from './CommunityNavigator';
export { MainNavigator } from './MainNavigator';
export { ProfileNavigator } from './ProfileNavigator';
export { SquadNavigator } from './SquadNavigator';

// Navigation Utilities
export {
    getCurrentParams, getCurrentRoute, goBack, isNavigationReady, navigate, navigationRef, reset
} from './navigationRef';

// Deep Linking
export { linking } from './linking';

// ============================================
// 2. TYPES
// ============================================

export type { AdminTabParamList } from './AdminNavigator';
export type { AuthStackParamList } from './AuthNavigator';
export type { ChatStackParamList } from './ChatNavigator';
export type { CommunityStackParamList } from './CommunityNavigator';
export type { RootStackParamList } from './linking';
export type { MainTabParamList } from './MainNavigator';
export type { ProfileStackParamList } from './ProfileNavigator';
export type { SquadStackParamList } from './SquadNavigator';

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  AppNavigator,
  AuthNavigator,
  MainNavigator,
  AdminNavigator,
  ChatNavigator,
  SquadNavigator,
  ProfileNavigator,
  CommunityNavigator,
  navigationRef,
  navigate,
  goBack,
  reset,
  getCurrentRoute,
  getCurrentParams,
  isNavigationReady,
  linking,
};