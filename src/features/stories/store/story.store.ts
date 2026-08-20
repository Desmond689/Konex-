/**
 * KONEX Story Store
 * Billion Dollar Code - Production Ready
 *
 * Zustand store for the stories feature's local state:
 * the current story feed, the signed-in user's own stories,
 * and whichever story is currently open in the full-screen viewer.
 *
 * Usage:
 * const { stories, myStories, addStory, markViewed } = useStoryStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface StoryUser {
  id: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  onlineStatus?: 'online' | 'away' | 'offline';
}

export interface StoryViewRecord {
  id: string;
  userId: string;
  viewedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  text: string | null;
  expiresAt: string;
  createdAt: string;
  user?: StoryUser;
  views?: StoryViewRecord[];
  hasViewed?: boolean;
  viewCount?: number;
}

export interface StoryState {
  // State
  stories: Story[];
  myStories: Story[];
  currentStory: Story | null;
  activeViewerIndex: number;
  isViewerOpen: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  error: string | null;

  // Setters
  setStories: (stories: Story[]) => void;
  setMyStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;

  // Mutations
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  markViewed: (storyId: string) => void;

  // Viewer controls
  openViewer: (index?: number) => void;
  closeViewer: () => void;
  setActiveViewerIndex: (index: number) => void;

  // Loading / error
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setCreating: (creating: boolean) => void;
  setError: (error: string | null) => void;

  // Reset / clear
  reset: () => void;
  clear: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<
  StoryState,
  | 'setStories'
  | 'setMyStories'
  | 'setCurrentStory'
  | 'addStory'
  | 'removeStory'
  | 'updateStory'
  | 'markViewed'
  | 'openViewer'
  | 'closeViewer'
  | 'setActiveViewerIndex'
  | 'setLoading'
  | 'setRefreshing'
  | 'setCreating'
  | 'setError'
  | 'reset'
  | 'clear'
> = {
  stories: [],
  myStories: [],
  currentStory: null,
  activeViewerIndex: 0,
  isViewerOpen: false,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  error: null,
};

// ============================================
// 3. STORE
// ============================================

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // SETTERS
      // ============================================

      setStories: (stories: Story[]) => {
        set({ stories });
        if (__DEV__) {
          console.log(`📸 Stories updated: ${stories.length}`);
        }
      },

      setMyStories: (myStories: Story[]) => {
        set({ myStories });
        if (__DEV__) {
          console.log(`📸 My stories updated: ${myStories.length}`);
        }
      },

      setCurrentStory: (story: Story | null) => {
        set({ currentStory: story });
        if (__DEV__) {
          console.log('📸 Current story set:', story?.id);
        }
      },

      // ============================================
      // MUTATIONS
      // ============================================

      addStory: (story: Story) => {
        set((state) => ({
          stories: [story, ...state.stories],
          myStories:
            story.userId === state.myStories[0]?.userId || state.myStories.length === 0
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
          stories: state.stories.map((s) => (s.id === storyId ? { ...s, ...updates } : s)),
          myStories: state.myStories.map((s) =>
            s.id === storyId ? { ...s, ...updates } : s
          ),
          currentStory:
            state.currentStory?.id === storyId
              ? { ...state.currentStory, ...updates }
              : state.currentStory,
        }));
      },

      markViewed: (storyId: string) => {
        set((state) => ({
          stories: state.stories.map((s) =>
            s.id === storyId
              ? { ...s, hasViewed: true, viewCount: (s.viewCount || 0) + 1 }
              : s
          ),
        }));
        if (__DEV__) {
          console.log(`👀 Story marked viewed: ${storyId}`);
        }
      },

      // ============================================
      // VIEWER CONTROLS
      // ============================================

      openViewer: (index: number = 0) => {
        set({ isViewerOpen: true, activeViewerIndex: index });
      },

      closeViewer: () => {
        set({ isViewerOpen: false, currentStory: null, activeViewerIndex: 0 });
      },

      setActiveViewerIndex: (index: number) => {
        set({ activeViewerIndex: index });
      },

      // ============================================
      // LOADING / ERROR
      // ============================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setRefreshing: (refreshing: boolean) => {
        set({ isRefreshing: refreshing });
      },

      setCreating: (creating: boolean) => {
        set({ isCreating: creating });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Story store error:', error);
        }
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Story store reset');
        }
      },

      clear: () => {
        set({
          stories: [],
          myStories: [],
          currentStory: null,
          activeViewerIndex: 0,
          isViewerOpen: false,
          isLoading: false,
          isRefreshing: false,
          isCreating: false,
          error: null,
        });
        if (__DEV__) {
          console.log('🧹 Story store cleared');
        }
      },
    }),
    {
      name: '@konex/stories',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stories: state.stories,
        myStories: state.myStories,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectStories = (state: StoryState) => state.stories;
export const selectMyStories = (state: StoryState) => state.myStories;
export const selectCurrentStory = (state: StoryState) => state.currentStory;
export const selectIsViewerOpen = (state: StoryState) => state.isViewerOpen;
export const selectActiveViewerIndex = (state: StoryState) => state.activeViewerIndex;
export const selectIsLoading = (state: StoryState) => state.isLoading;
export const selectIsCreating = (state: StoryState) => state.isCreating;
export const selectError = (state: StoryState) => state.error;
export const selectHasUnviewedStories = (state: StoryState) =>
  state.stories.some((s) => !s.hasViewed);

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useStoryStore;