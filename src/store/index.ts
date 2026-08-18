/**
 * KONEX Store - Main Export
 * Billion Dollar Code - Production Ready
 * 
 * This file exports all Zustand stores for the application.
 * 
 * Usage:
 * import { useAuthStore, useUserStore, useUIStore } from '@store';
 */

// Export all stores
export { default as adminStoreDefault, useAdminStore } from './adminStore';
export { default as authStoreDefault, useAuthStore } from './authStore';
export { default as chatStoreDefault, useChatStore } from './chatStore';
export { default as communityStoreDefault, useCommunityStore } from './communityStore';
export { default as lfgStoreDefault, useLFGStore } from './lfgStore';
export { default as moderationStoreDefault, useModerationStore } from './moderationStore';
export { default as notificationStoreDefault, useNotificationStore } from './notificationStore';
export { default as postStoreDefault, usePostStore } from './postStore';
export { default as squadStoreDefault, useSquadStore } from './squadStore';
export { default as storyStoreDefault, useStoryStore } from './storyStore';
export { default as tournamentStoreDefault, useTournamentStore } from './tournamentStore';
export { default as uiStoreDefault, useUIStore } from './uiStore';
export { default as userStoreDefault, useUserStore } from './userStore';

// ============================================
// 2. STORE TYPES
// ============================================

export type {
    AuthActions, AuthState
} from './authStore';

export type {
    UserActions, UserState
} from './userStore';

export type {
    CommunityActions, CommunityState
} from './communityStore';

export type {
    SquadActions, SquadState
} from './squadStore';

export type {
    PostActions, PostState
} from './postStore';

export type {
    ChatActions, ChatState
} from './chatStore';

export type {
    NotificationActions, NotificationState
} from './notificationStore';

export type {
    LFGActions, LFGState
} from './lfgStore';

export type {
    StoryActions, StoryState
} from './storyStore';

export type {
    TournamentActions, TournamentState
} from './tournamentStore';

export type {
    ModerationActions, ModerationState
} from './moderationStore';

export type {
    AdminActions, AdminState
} from './adminStore';

export type {
    UIActions, UIState
} from './uiStore';

// ============================================
// 3. STORE HELPERS
// ============================================

import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';
import { useUserStore } from './userStore';

/**
 * Reset all stores to their initial state
 */
export const resetAllStores = (): void => {
  useAuthStore.getState().reset();
  useUserStore.getState().reset();
  useUIStore.getState().reset();
  // Add other stores as needed
};

/**
 * Get the current app state summary
 */
export const getAppState = () => {
  const auth = useAuthStore.getState();
  const user = useUserStore.getState();
  const ui = useUIStore.getState();

  return {
    isAuthenticated: auth.isAuthenticated,
    user: user.profile,
    isLoading: ui.isLoading,
    isOnline: ui.isOnline,
    theme: ui.theme,
  };
};

/**
 * Check if the app is ready
 */
export const isAppReady = (): boolean => {
  const auth = useAuthStore.getState();
  const ui = useUIStore.getState();
  
  return !auth.isLoading && !ui.isLoading;
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  useAuthStore,
  useUserStore,
  useCommunityStore,
  useSquadStore,
  usePostStore,
  useChatStore,
  useNotificationStore,
  useLFGStore,
  useStoryStore,
  useTournamentStore,
  useModerationStore,
  useAdminStore,
  useUIStore,
  resetAllStores,
  getAppState,
  isAppReady,
};