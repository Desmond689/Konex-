/**
 * KONEX Stories Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for stories state management
 * 
 * Usage:
 * const { stories, myStories, currentStory, addStory } = useStoriesStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface Story {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  mediaUrl: string;
  type: 'image' | 'video';
  text: string | null;
  expiresAt: string;
  createdAt: string;
  hasViewed: boolean;
  viewCount: number;
  views: Array<{
    userId: string;
    viewedAt: string;
  }>;
}

export interface StoriesState {
  // State
  stories: Story[];
  myStories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  error: string | null;
  viewerIndex: number;
  isViewerOpen: boolean;
  
  // Actions
  setStories: (stories: Story[]) => void;
  setMyStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  markViewed: (storyId: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setCreating: (creating: boolean) => void;
  setError: (error: string | null) => void;
  setViewerIndex: (index: number) => void;
  setViewerOpen: (isOpen: boolean) => void;
  clearStories: () => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<StoriesState, 
  'setStories' | 'setMyStories' | 'setCurrentStory' | 'addStory' | 
  'removeStory' | 'updateStory' | 'markViewed' | 'setLoading' | 
  'setRefreshing' | 'setCreating' | 'setError' | 'setViewerIndex' | 
  'setViewerOpen' | 'clearStories' | 'reset'
> = {
  stories: [],
  myStories: [],
  currentStory: null,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  error: null,
  viewerIndex: 0,
  isViewerOpen: false,
};

// ============================================
// 3. STORE
// ============================================

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // STORIES ACTIONS
      // ============================================

      setStories: (stories: Story[]) => {
        set({ stories });
        if (__DEV__) {
          console.log(`📸 Stories updated: ${stories.length} stories`);
        }
      },

      setMyStories: (myStories: Story[]) => {
        set({ myStories });
        if (__DEV__) {
          console.log(`📸 My stories updated: ${myStories.length} stories`);
        }
      },

      setCurrentStory: (currentStory: Story | null) => {
        set({ currentStory });
        if (__DEV__ && currentStory) {
          console.log(`📸 Current story set: ${currentStory.id}`);
        }
      },

      addStory: (story: Story) => {
        set((state) => ({
          stories: [story, ...state.stories],
          myStories: story.userId === get().myStories[0]?.userId 
            ? [story, ...state.myStories] 
            : state.myStories,
        }));
        if (__DEV__) {
          console.log(`📸 Story added: ${story.id}`);
        }
      },

      removeStory: (storyId: string) => {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== storyId),
          myStories: state.myStories.filter((s) => s.id !== storyId),
          currentStory: state.currentStory?.id === storyId ? null : state.currentStory,
        }));
        if (__DEV__) {
          console.log(`📸 Story removed: ${storyId}`);
        }
      },

      updateStory: (storyId: string, updates: Partial<Story>) => {
        set((state) => ({
          stories: state.stories.map((s) =>
            s.id === storyId ? { ...s, ...updates } : s
          ),
          myStories: state.myStories.map((s) =>
            s.id === storyId ? { ...s, ...updates } : s
          ),
          currentStory: state.currentStory?.id === storyId
            ? { ...state.currentStory, ...updates }
            : state.currentStory,
        }));
        if (__DEV__) {
          console.log(`📸 Story updated: ${storyId}`);
        }
      },

      markViewed: (storyId: string) => {
        set((state) => ({
          stories: state.stories.map((s) =>
            s.id === storyId ? { ...s, hasViewed: true, viewCount: s.viewCount + 1 } : s
          ),
        }));
        if (__DEV__) {
          console.log(`📸 Story marked viewed: ${storyId}`);
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

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Stories store error:', error);
        }
      },

      // ============================================
      // VIEWER STATE
      // ============================================

      setViewerIndex: (viewerIndex: number) => {
        set({ viewerIndex });
        if (__DEV__) {
          console.log(`📸 Viewer index set: ${viewerIndex}`);
        }
      },

      setViewerOpen: (isViewerOpen: boolean) => {
        set({ isViewerOpen });
        if (__DEV__) {
          console.log(`📸 Viewer open: ${isViewerOpen}`);
        }
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      clearStories: () => {
        set({ stories: [], myStories: [], currentStory: null });
        if (__DEV__) {
          console.log('🧹 Stories cleared');
        }
      },

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Stories store reset');
        }
      },
    }),
    {
      name: '@konex/stories',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myStories: state.myStories,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectStories = (state: StoriesState) => state.stories;
export const selectMyStories = (state: StoriesState) => state.myStories;
export const selectCurrentStory = (state: StoriesState) => state.currentStory;
export const selectIsLoading = (state: StoriesState) => state.isLoading;
export const selectIsRefreshing = (state: StoriesState) => state.isRefreshing;
export const selectIsCreating = (state: StoriesState) => state.isCreating;
export const selectError = (state: StoriesState) => state.error;
export const selectViewerIndex = (state: StoriesState) => state.viewerIndex;
export const selectIsViewerOpen = (state: StoriesState) => state.isViewerOpen;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useStoriesStore;