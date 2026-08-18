/**
 * KONEX Community Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for community state management
 * 
 * Usage:
 * const { currentCommunity, members, setCurrentCommunity } = useCommunityStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export interface CommunityState {
  // State
  currentCommunity: any | null;
  communities: any[];
  myCommunities: any[];
  members: CommunityMember[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentCommunity: (community: any | null) => void;
  setCommunities: (communities: any[]) => void;
  setMyCommunities: (communities: any[]) => void;
  setMembers: (members: CommunityMember[]) => void;
  addCommunity: (community: any) => void;
  removeCommunity: (communityId: string) => void;
  updateCommunity: (communityId: string, updates: Partial<any>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clear: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<CommunityState, 
  'setCurrentCommunity' | 'setCommunities' | 'setMyCommunities' | 'setMembers' | 
  'addCommunity' | 'removeCommunity' | 'updateCommunity' | 'setLoading' | 
  'setError' | 'reset' | 'clear'
> = {
  currentCommunity: null,
  communities: [],
  myCommunities: [],
  members: [],
  isLoading: false,
  error: null,
};

// ============================================
// 3. STORE
// ============================================

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // SETTERS
      // ============================================

      setCurrentCommunity: (community: any | null) => {
        set({ currentCommunity: community });
        if (__DEV__) {
          console.log('🌐 Current community set:', community?.id);
        }
      },

      setCommunities: (communities: any[]) => {
        set({ communities });
        if (__DEV__) {
          console.log(`🌐 Communities updated: ${communities.length}`);
        }
      },

      setMyCommunities: (communities: any[]) => {
        set({ myCommunities: communities });
        if (__DEV__) {
          console.log(`🌐 My communities updated: ${communities.length}`);
        }
      },

      setMembers: (members: CommunityMember[]) => {
        set({ members });
        if (__DEV__) {
          console.log(`🌐 Community members updated: ${members.length}`);
        }
      },

      addCommunity: (community: any) => {
        set((state) => ({
          communities: [...state.communities, community],
        }));
        if (__DEV__) {
          console.log(`🌐 Community added: ${community.id}`);
        }
      },

      removeCommunity: (communityId: string) => {
        set((state) => ({
          communities: state.communities.filter((c) => c.id !== communityId),
          myCommunities: state.myCommunities.filter((c) => c.id !== communityId),
          currentCommunity: state.currentCommunity?.id === communityId ? null : state.currentCommunity,
        }));
        if (__DEV__) {
          console.log(`🌐 Community removed: ${communityId}`);
        }
      },

      updateCommunity: (communityId: string, updates: Partial<any>) => {
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
        if (__DEV__) {
          console.log(`🌐 Community updated: ${communityId}`);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Community store error:', error);
        }
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Community store reset');
        }
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
        if (__DEV__) {
          console.log('🧹 Community store cleared');
        }
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