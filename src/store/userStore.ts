/**
 * KONEX User Store
 * Billion Dollar Code - Production Ready
 * 
 * Manages user profile state including:
 * - User profile data
 * - User settings
 * - User privacy settings
 * - Followers/Following counts
 * - Squad membership
 * - Badges
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface UserProfile {
  id: string;
  gamerTag: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  gameId: string;
  gamingStyle: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  role: 'Sniper' | 'Rusher' | 'Support' | 'Flex';
  squadId: string | null;
  squadRole: 'Leader' | 'Admin' | 'Member' | null;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  onlineStatus: 'online' | 'away' | 'offline';
  lastSeen: string;
  featuredBadges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  privacyProfile: 'public' | 'friends' | 'private';
  privacyDm: 'everyone' | 'friends' | 'friendsAndSquad' | 'noOne';
  privacyFollow: 'everyone' | 'friends' | 'noOne';
  privacyFriendRequest: 'everyone' | 'mutualFriends';
  privacyShowOnlineStatus: boolean;
  privacyStory: 'everyone' | 'friends' | 'squad' | 'custom';
  notifications: {
    push: boolean;
    email: boolean;
    sounds: boolean;
    vibrations: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface UserState {
  // State
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  setSettings: (settings: UserSettings) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnline: (isOnline: boolean) => void;
  incrementFollowers: () => void;
  decrementFollowers: () => void;
  incrementFollowing: () => void;
  decrementFollowing: () => void;
  incrementFriends: () => void;
  decrementFriends: () => void;
  reset: () => void;
  clear: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialSettings: UserSettings = {
  privacyProfile: 'public',
  privacyDm: 'everyone',
  privacyFollow: 'everyone',
  privacyFriendRequest: 'everyone',
  privacyShowOnlineStatus: true,
  privacyStory: 'friends',
  notifications: {
    push: true,
    email: true,
    sounds: true,
    vibrations: true,
  },
  theme: 'system',
};

const initialState: UserState = {
  profile: null,
  settings: initialSettings,
  isLoading: true,
  error: null,
  isOnline: false,
  setProfile: () => {},
  setSettings: () => {},
  updateProfile: () => {},
  updateSettings: () => {},
  setLoading: () => {},
  setError: () => {},
  setOnline: () => {},
  incrementFollowers: () => {},
  decrementFollowers: () => {},
  incrementFollowing: () => {},
  decrementFollowing: () => {},
  incrementFriends: () => {},
  decrementFriends: () => {},
  reset: () => {},
  clear: () => {},
};

// ============================================
// 3. STORE
// ============================================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // SETTERS
      // ============================================

      setProfile: (profile: UserProfile) => {
        set({
          profile,
          isLoading: false,
          error: null,
        });
        if (__DEV__) {
          console.log('👤 Profile set:', { userId: profile.id, gamerTag: profile.gamerTag });
        }
      },

      setSettings: (settings: UserSettings) => {
        set({ settings });
        if (__DEV__) {
          console.log('⚙️ Settings updated');
        }
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
        if (__DEV__) {
          console.log('📝 Profile updated:', Object.keys(updates));
        }
      },

      updateSettings: (updates: Partial<UserSettings>) => {
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...updates } : null,
        }));
        if (__DEV__) {
          console.log('⚙️ Settings updated:', Object.keys(updates));
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ User store error:', error);
        }
      },

      setOnline: (isOnline: boolean) => {
        set({ isOnline });
      },

      // ============================================
      // COUNTERS
      // ============================================

      incrementFollowers: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                followersCount: state.profile.followersCount + 1,
              }
            : null,
        }));
      },

      decrementFollowers: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                followersCount: Math.max(0, state.profile.followersCount - 1),
              }
            : null,
        }));
      },

      incrementFollowing: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                followingCount: state.profile.followingCount + 1,
              }
            : null,
        }));
      },

      decrementFollowing: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                followingCount: Math.max(0, state.profile.followingCount - 1),
              }
            : null,
        }));
      },

      incrementFriends: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                friendsCount: state.profile.friendsCount + 1,
              }
            : null,
        }));
      },

      decrementFriends: () => {
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                friendsCount: Math.max(0, state.profile.friendsCount - 1),
              }
            : null,
        }));
      },

      // ============================================
      // RESET/CLEAR
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 User store reset');
        }
      },

      clear: () => {
        set({
          profile: null,
          settings: initialSettings,
          isLoading: false,
          error: null,
          isOnline: false,
        });
        if (__DEV__) {
          console.log('🧹 User store cleared');
        }
      },
    }),
    {
      name: '@konex/user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectProfile = (state: UserState) => state.profile;
export const selectSettings = (state: UserState) => state.settings;
export const selectIsLoading = (state: UserState) => state.isLoading;
export const selectError = (state: UserState) => state.error;
export const selectIsOnline = (state: UserState) => state.isOnline;
export const selectGamerTag = (state: UserState) => state.profile?.gamerTag;
export const selectUsername = (state: UserState) => state.profile?.username;
export const selectSquadId = (state: UserState) => state.profile?.squadId;
export const selectSquadRole = (state: UserState) => state.profile?.squadRole;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useUserStore;