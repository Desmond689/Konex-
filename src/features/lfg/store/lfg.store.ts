/**
 * KONEX LFG Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for LFG (Looking For Group) state management
 * 
 * Usage:
 * const { posts, myPosts, currentPost, addPost, updatePost } = useLFGStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface LFGPost {
  id: string;
  authorId: string;
  authorGamerTag: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorSkillLevel: string;
  communityId: string;
  squadId: string | null;
  squadName: string | null;
  squadIcon: string | null;
  gameMode: string;
  playersNeeded: number;
  currentPartySize: number;
  rankRequirement: string | null;
  micRequired: boolean;
  message: string;
  status: 'active' | 'filled' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  isJoined: boolean;
  isAuthor: boolean;
  requests?: LFGRequest[];
}

export interface LFGRequest {
  id: string;
  userId: string;
  userGamerTag: string;
  userUsername: string;
  userAvatarUrl: string | null;
  userSkillLevel: string;
  userRole: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface LFGState {
  // State
  posts: LFGPost[];
  myPosts: LFGPost[];
  currentPost: LFGPost | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isJoining: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  totalItems: number;
  
  // Actions
  setPosts: (posts: LFGPost[]) => void;
  addPosts: (posts: LFGPost[]) => void;
  setMyPosts: (posts: LFGPost[]) => void;
  setCurrentPost: (post: LFGPost | null) => void;
  addPost: (post: LFGPost) => void;
  updatePost: (postId: string, updates: Partial<LFGPost>) => void;
  removePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setCreating: (creating: boolean) => void;
  setJoining: (joining: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setTotalItems: (total: number) => void;
  clearPosts: () => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<LFGState, 
  'setPosts' | 'addPosts' | 'setMyPosts' | 'setCurrentPost' | 'addPost' | 
  'updatePost' | 'removePost' | 'setLoading' | 'setRefreshing' | 'setCreating' | 
  'setJoining' | 'setHasMore' | 'setError' | 'setPage' | 'setTotalItems' | 
  'clearPosts' | 'reset'
> = {
  posts: [],
  myPosts: [],
  currentPost: null,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isJoining: false,
  hasMore: true,
  error: null,
  page: 0,
  totalItems: 0,
};

// ============================================
// 3. STORE
// ============================================

export const useLFGStore = create<LFGState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // POSTS ACTIONS
      // ============================================

      setPosts: (posts: LFGPost[]) => {
        set({ posts });
        if (__DEV__) {
          console.log(`🎮 LFG posts updated: ${posts.length} posts`);
        }
      },

      addPosts: (posts: LFGPost[]) => {
        set((state) => ({
          posts: [...state.posts, ...posts],
        }));
        if (__DEV__) {
          console.log(`🎮 LFG posts added: ${posts.length} posts`);
        }
      },

      setMyPosts: (myPosts: LFGPost[]) => {
        set({ myPosts });
        if (__DEV__) {
          console.log(`🎮 My LFG posts updated: ${myPosts.length} posts`);
        }
      },

      setCurrentPost: (currentPost: LFGPost | null) => {
        set({ currentPost });
        if (__DEV__ && currentPost) {
          console.log(`🎮 Current LFG post set: ${currentPost.id}`);
        }
      },

      addPost: (post: LFGPost) => {
        set((state) => ({
          posts: [post, ...state.posts],
          myPosts: post.authorId === get().myPosts[0]?.authorId 
            ? [post, ...state.myPosts] 
            : state.myPosts,
        }));
        if (__DEV__) {
          console.log(`🎮 LFG post added: ${post.id}`);
        }
      },

      updatePost: (postId: string, updates: Partial<LFGPost>) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
          myPosts: state.myPosts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
          currentPost: state.currentPost?.id === postId
            ? { ...state.currentPost, ...updates }
            : state.currentPost,
        }));
        if (__DEV__) {
          console.log(`🎮 LFG post updated: ${postId}`);
        }
      },

      removePost: (postId: string) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
          myPosts: state.myPosts.filter((post) => post.id !== postId),
          currentPost: state.currentPost?.id === postId ? null : state.currentPost,
        }));
        if (__DEV__) {
          console.log(`🎮 LFG post removed: ${postId}`);
        }
      },

      // ============================================
      // LOADING STATES
      // ============================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setRefreshing: (isRefreshing: boolean) => {
        set({ isRefreshing });
      },

      setCreating: (isCreating: boolean) => {
        set({ isCreating });
      },

      setJoining: (isJoining: boolean) => {
        set({ isJoining });
      },

      setHasMore: (hasMore: boolean) => {
        set({ hasMore });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ LFG store error:', error);
        }
      },

      setPage: (page: number) => {
        set({ page });
      },

      setTotalItems: (totalItems: number) => {
        set({ totalItems });
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      clearPosts: () => {
        set({ posts: [], page: 0, hasMore: true, totalItems: 0 });
        if (__DEV__) {
          console.log('🧹 LFG posts cleared');
        }
      },

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 LFG store reset');
        }
      },
    }),
    {
      name: '@konex/lfg',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myPosts: state.myPosts,
        posts: state.posts,
        totalItems: state.totalItems,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectPosts = (state: LFGState) => state.posts;
export const selectMyPosts = (state: LFGState) => state.myPosts;
export const selectCurrentPost = (state: LFGState) => state.currentPost;
export const selectIsLoading = (state: LFGState) => state.isLoading;
export const selectIsRefreshing = (state: LFGState) => state.isRefreshing;
export const selectIsCreating = (state: LFGState) => state.isCreating;
export const selectIsJoining = (state: LFGState) => state.isJoining;
export const selectHasMore = (state: LFGState) => state.hasMore;
export const selectError = (state: LFGState) => state.error;
export const selectPage = (state: LFGState) => state.page;
export const selectTotalItems = (state: LFGState) => state.totalItems;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useLFGStore;