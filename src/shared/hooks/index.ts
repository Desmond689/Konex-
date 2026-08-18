/**
 * KONEX Shared Hooks - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useAnalytics } from './useAnalytics';
export { useAppState } from './useAppState';
export { useDebounce, useDebounceFn } from './useDebounce';
export { useDeepLink } from './useDeepLink';
export { useInfiniteScroll } from './useInfiniteScroll';
export { useKeyboard } from './useKeyboard';
export { useNetwork } from './useNetwork';
export { usePermissions } from './usePermissions';
export { usePullToRefresh } from './usePullToRefresh';
export { useTheme } from './useTheme';
export { useThrottle, useThrottleFn } from './useThrottle';

// ============================================
// 2. TYPES EXPORT
// ============================================

export type { UseAnalyticsReturn } from './useAnalytics';
export type { UseAppStateReturn } from './useAppState';
export type { UseDebounceOptions } from './useDebounce';
export type { DeepLinkData, UseDeepLinkReturn } from './useDeepLink';
export type { UseInfiniteScrollOptions, UseInfiniteScrollReturn } from './useInfiniteScroll';
export type { UseKeyboardReturn } from './useKeyboard';
export type { UseNetworkReturn } from './useNetwork';
export type { PermissionType, UsePermissionsReturn } from './usePermissions';
export type { UsePullToRefreshReturn } from './usePullToRefresh';
export type { UseThemeReturn } from './useTheme';
export type { UseThrottleOptions } from './useThrottle';

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  useTheme,
  useDebounce,
  useDebounceFn,
  useThrottle,
  useThrottleFn,
  useInfiniteScroll,
  usePullToRefresh,
  useKeyboard,
  useAppState,
  useNetwork,
  usePermissions,
  useDeepLink,
  useAnalytics,
};