/**
 * KONEX Community Store
 * Billion Dollar Code - Production Ready
 * 
 * Manages community state including:
 * - Community data
 * - User's communities
 * - Community members
 * - Community settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface Community {
  id: string;
  name: string;
  gameName: string;
  gameLogoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  memberCount: number;
  onlineCount: number;
  rules: string[];
  isVerified: boolean;
  isOfficial: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export interface CommunityState {
  // State
  currentCommunity: Community | null;
  communities: Community[];
  myCommunities: Community[];
  members: CommunityMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentCommunity: (community: Community | null) => void;
  setCommunities: (communities: Community[]) => void;
  setMyCommunities: (communities: Community[]) => void;
  setMembers: (members: CommunityMember[]) => void;
  addCommunity: (community: Community) => void;
  removeCommunity: (communityId: string) => void;
  updateCommunity: (communityId: string, updates: Partial<Community>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clear: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: CommunityState = {
  currentCommunity: null,
  communities: [],
  myCommunities: [],
  members: [],
  isLoading: false,
  error: null,
  setCurrentCommunity: () => {},
  setCommunities: () => {},
  setMyCommunities: () => {},
  setMembers: () => {},
  addCommunity: () => {},
  removeCommunity: () => {},
  updateCommunity: () => {},
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
  clear: () => {},
};

// ============================================
// 3. STORE
// ============================================

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentCommunity: (community: Community | null) => {
        set({ currentCommunity: community });
      },

      setCommunities: (communities: Community[]) => {
        set({ communities });
      },

      setMyCommunities: (communities: Community[]) => {
        set({ myCommunities: communities });
      },

      setMembers: (members: CommunityMember[]) => {
        set({ members });
      },

      addCommunity: (community: Community) => {
        set((state) => ({
          communities: [...state.communities, community],
        }));
      },

      removeCommunity: (communityId: string) => {
        set((state) => ({
          communities: state.communities.filter((c) => c.id !== communityId),
          myCommunities: state.myCommunities.filter((c) => c.id !== communityId),
        }));
      },

      updateCommunity: (communityId: string, updates: Partial<Community>) => {
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId ? { ...c, ...updates } : c
          ),
          myCommunities: state.myCommunities.map((c) =>
            c.id === communityId ? { ...c, ...updates } : c
          ),
          currentCommunity:
            state.currentCommunity?.id === communityId
              ? { ...state.currentCommunity, ...updates }
              : state.currentCommunity,
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },

      clear: () => {
        set({
          currentCommunity: null,
          communities: [],
          myCommunities: [],
          members: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: '@konex/community',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        communities: state.communities,
        myCommunities: state.myCommunities,
        currentCommunity: state.currentCommunity,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectCurrentCommunity = (state: CommunityState) => state.currentCommunity;
export const selectCommunities = (state: CommunityState) => state.communities;
export const selectMyCommunities = (state: CommunityState) => state.myCommunities;
export const selectMembers = (state: CommunityState) => state.members;
export const selectIsLoading = (state: CommunityState) => state.isLoading;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useCommunityStore;