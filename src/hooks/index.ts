/**
 * KONEX Hooks - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * This file exports all custom React hooks for the application.
 * 
 * Usage:
 * import { useAuth, useUser, usePosts } from '@hooks';
 */

// Auth & User Hooks
export { useAuth } from './useAuth';
export { useUser } from './useUser';

// Post Hooks
export { useComments } from './useComments';
export { usePost } from './usePost';
export { usePosts } from './usePosts';

// Squad Hooks
export { useSquad } from './useSquad';
export { useSquads } from './useSquads';

// Chat Hooks
export { useChat } from './useChat';

// Community Hooks
export { useCommunity } from './useCommunity';

// Notification Hooks
export { useNotifications } from './useNotifications';

// LFG Hooks
export { useLFG } from './useLFG';

// Story Hooks
export { useStories } from './useStories';

// Tournament Hooks
export { useTournaments } from './useTournaments';

// Badge Hooks
export { useBadges } from './useBadges';

// Social Hooks
export { useFollow } from './useFollow';
export { useFriend } from './useFriend';

// Search Hooks
export { useSearch } from './useSearch';

// Moderation Hooks
export { useModeration } from './useModeration';

// Admin Hooks
export { useAdmin } from './useAdmin';

// Utility Hooks
export { useAnalytics } from './useAnalytics';
export { useAppState } from './useAppState';
export { useDebounce } from './useDebounce';
export { useDeepLink } from './useDeepLink';
export { useInfiniteScroll } from './useInfiniteScroll';
export { useKeyboard } from './useKeyboard';
export { useNetwork } from './useNetwork';
export { usePermissions } from './usePermissions';
export { usePullToRefresh } from './usePullToRefresh';
export { useRealtime } from './useRealtime';
export { useTheme } from './useTheme';
export { useThrottle } from './useThrottle';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useAuth,
  useUser,
  usePosts,
  usePost,
  useComments,
  useSquad,
  useSquads,
  useChat,
  useCommunity,
  useNotifications,
  useLFG,
  useStories,
  useTournaments,
  useBadges,
  useFollow,
  useFriend,
  useSearch,
  useModeration,
  useAdmin,
  useRealtime,
  useDebounce,
  useThrottle,
  useInfiniteScroll,
  usePullToRefresh,
  useKeyboard,
  useAppState,
  useNetwork,
  usePermissions,
  useDeepLink,
  useAnalytics,
  useTheme,
};