/**
 * KONEX Feed Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for feed state management
 * 
 * Usage:
 * const { posts, feedType, setPosts, setFeedType } = useFeedStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export type FeedType = 'for_you' | 'following' | 'trending' | 'latest';

export interface FeedState {
  // State
  posts: any[];
  feedType: FeedType;
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  totalItems: number;
  
  // Actions
  setPosts: (posts: any[]) => void;
  addPosts: (posts: any[]) => void;
  updatePost: (postId: string, updates: Partial<any>) => void;
  removePost: (postId: string) => void;
  setFeedType: (type: FeedType) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
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

const initialState: Omit<FeedState, 
  'setPosts' | 'addPosts' | 'updatePost' | 'removePost' | 'setFeedType' | 
  'setLoading' | 'setRefreshing' | 'setHasMore' | 'setError' | 'setPage' | 
  'setTotalItems' | 'clearPosts' | 'reset'
> = {
  posts: [],
  feedType: 'for_you',
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
  error: null,
  page: 0,
  totalItems: 0,
};

// ============================================
// 3. STORE
// ============================================

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // POSTS ACTIONS
      // ============================================

      setPosts: (posts: any[]) => {
        set({ posts });
        if (__DEV__) {
          console.log(`📱 Feed posts updated: ${posts.length} posts`);
        }
      },

      addPosts: (posts: any[]) => {
        set((state) => ({
          posts: [...state.posts, ...posts],
        }));
        if (__DEV__) {
          console.log(`📱 Feed posts added: ${posts.length} posts`);
        }
      },

      updatePost: (postId: string, updates: Partial<any>) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
        }));
        if (__DEV__) {
          console.log(`📱 Feed post updated: ${postId}`);
        }
      },

      removePost: (postId: string) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
        }));
        if (__DEV__) {
          console.log(`📱 Feed post removed: ${postId}`);
        }
      },

      // ============================================
      // FEED TYPE
      // ============================================

      setFeedType: (feedType: FeedType) => {
        set({ feedType, posts: [], page: 0, hasMore: true });
        if (__DEV__) {
          console.log(`📱 Feed type changed: ${feedType}`);
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

      setHasMore: (hasMore: boolean) => {
        set({ hasMore });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Feed store error:', error);
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
          console.log('🧹 Feed posts cleared');
        }
      },

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Feed store reset');
        }
      },
    }),
    {
      name: '@konex/feed',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        feedType: state.feedType,
        posts: state.posts,
        totalItems: state.totalItems,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectPosts = (state: FeedState) => state.posts;
export const selectFeedType = (state: FeedState) => state.feedType;
export const selectIsLoading = (state: FeedState) => state.isLoading;
export const selectIsRefreshing = (state: FeedState) => state.isRefreshing;
export const selectHasMore = (state: FeedState) => state.hasMore;
export const selectError = (state: FeedState) => state.error;
export const selectPage = (state: FeedState) => state.page;
export const selectTotalItems = (state: FeedState) => state.totalItems;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useFeedStore;