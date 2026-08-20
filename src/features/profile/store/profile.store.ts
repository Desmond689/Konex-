/**
 * KONEX Profile Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for profile state management
 * 
 * Usage:
 * const { profile, setProfile, updateProfile, clearProfile } = useProfileStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface Profile {
  id: string;
  gamerTag: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  gameId: string;
  gameName: string;
  gamingStyle: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  role: 'Sniper' | 'Rusher' | 'Support' | 'Flex';
  squadId: string | null;
  squadName: string | null;
  squadRole: 'Leader' | 'Admin' | 'Member' | null;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  onlineStatus: 'online' | 'away' | 'offline';
  lastSeen: string;
  postsCount: number;
  clipsCount: number;
  lfgCount: number;
  badgesCount: number;
  squadsCount: number;
  privacyProfile: 'public' | 'friends' | 'private';
  privacyDm: 'everyone' | 'friends' | 'friendsAndSquad' | 'noOne';
  privacyFollow: 'everyone' | 'friends' | 'noOne';
  privacyFriendRequest: 'everyone' | 'mutualFriends';
  privacyShowOnlineStatus: boolean;
  privacyStory: 'everyone' | 'friends' | 'squad' | 'custom';
  featuredBadges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState {
  // State
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdated: string | null;
  
  // Actions
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnline: (isOnline: boolean) => void;
  setLastUpdated: () => void;
  incrementFollowers: () => void;
  decrementFollowers: () => void;
  incrementFollowing: () => void;
  decrementFollowing: () => void;
  incrementFriends: () => void;
  decrementFriends: () => void;
  incrementPosts: () => void;
  decrementPosts: () => void;
  incrementBadges: () => void;
  reset: () => void;
  clear: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<ProfileState, 
  'setProfile' | 'updateProfile' | 'clearProfile' | 'setLoading' | 
  'setError' | 'setOnline' | 'setLastUpdated' | 'incrementFollowers' | 
  'decrementFollowers' | 'incrementFollowing' | 'decrementFollowing' | 
  'incrementFriends' | 'decrementFriends' | 'incrementPosts' | 
  'decrementPosts' | 'incrementBadges' | 'reset' | 'clear'
> = {
  profile: null,
  isLoading: false,
  error: null,
  isOnline: false,
  lastUpdated: null,
};

// ============================================
// 3. STORE
// ============================================

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // PROFILE ACTIONS
      // ============================================

      setProfile: (profile: Profile) => {
        set({ 
          profile, 
          isLoading: false, 
          error: null,
          lastUpdated: new Date().toISOString(),
        });
        if (__DEV__) {
          console.log(`👤 Profile set: ${profile.gamerTag}`);
        }
      },

      updateProfile: (updates: Partial<Profile>) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
          lastUpdated: new Date().toISOString(),
        }));
        if (__DEV__) {
          console.log(`👤 Profile updated:`, Object.keys(updates));
        }
      },

      clearProfile: () => {
        set({ profile: null, lastUpdated: null });
        if (__DEV__) {
          console.log('👤 Profile cleared');
        }
      },

      // ============================================
      // LOADING STATES
      // ============================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Profile store error:', error);
        }
      },

      setOnline: (isOnline: boolean) => {
        set({ isOnline });
        if (__DEV__) {
          console.log(`🟢 Online status: ${isOnline}`);
        }
      },

      setLastUpdated: () => {
        set({ lastUpdated: new Date().toISOString() });
      },

      // ============================================
      // COUNTERS
      // ============================================

      incrementFollowers: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, followersCount: state.profile.followersCount + 1 }
            : null,
        }));
      },

      decrementFollowers: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, followersCount: Math.max(0, state.profile.followersCount - 1) }
            : null,
        }));
      },

      incrementFollowing: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, followingCount: state.profile.followingCount + 1 }
            : null,
        }));
      },

      decrementFollowing: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, followingCount: Math.max(0, state.profile.followingCount - 1) }
            : null,
        }));
      },

      incrementFriends: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, friendsCount: state.profile.friendsCount + 1 }
            : null,
        }));
      },

      decrementFriends: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, friendsCount: Math.max(0, state.profile.friendsCount - 1) }
            : null,
        }));
      },

      incrementPosts: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, postsCount: state.profile.postsCount + 1 }
            : null,
        }));
      },

      decrementPosts: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, postsCount: Math.max(0, state.profile.postsCount - 1) }
            : null,
        }));
      },

      incrementBadges: () => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, badgesCount: state.profile.badgesCount + 1 }
            : null,
        }));
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Profile store reset');
        }
      },

      clear: () => {
        set({
          profile: null,
          isLoading: false,
          error: null,
          isOnline: false,
          lastUpdated: null,
        });
        if (__DEV__) {
          console.log('🧹 Profile store cleared');
        }
      },
    }),
    {
      name: '@konex/profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        isOnline: state.isOnline,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectProfile = (state: ProfileState) => state.profile;
export const selectIsLoading = (state: ProfileState) => state.isLoading;
export const selectError = (state: ProfileState) => state.error;
export const selectIsOnline = (state: ProfileState) => state.isOnline;
export const selectLastUpdated = (state: ProfileState) => state.lastUpdated;
export const selectGamerTag = (state: ProfileState) => state.profile?.gamerTag;
export const selectUsername = (state: ProfileState) => state.profile?.username;
export const selectSquadId = (state: ProfileState) => state.profile?.squadId;
export const selectSquadRole = (state: ProfileState) => state.profile?.squadRole;
export const selectFollowersCount = (state: ProfileState) => state.profile?.followersCount;
export const selectFollowingCount = (state: ProfileState) => state.profile?.followingCount;
export const selectFriendsCount = (state: ProfileState) => state.profile?.friendsCount;
export const selectBadgesCount = (state: ProfileState) => state.profile?.badgesCount;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useProfileStore;