/**
 * KONEX Story Store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  text: string | null;
  expiresAt: string;
  createdAt: string;
  user?: {
    id: string;
    gamerTag: string;
    username: string;
    avatarUrl: string | null;
  };
  views?: Array<{
    id: string;
    userId: string;
    viewedAt: string;
  }>;
  hasViewed?: boolean;
  viewCount?: number;
}

export interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  myStories: Story[];
  isLoading: boolean;
  error: string | null;
  setStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;
  setMyStories: (stories: Story[]) => void;
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  markViewed: (storyId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: StoryState = {
  stories: [],
  currentStory: null,
  myStories: [],
  isLoading: false,
  error: null,
  setStories: () => {},
  setCurrentStory: () => {},
  setMyStories: () => {},
  addStory: () => {},
  removeStory: () => {},
  markViewed: () => {},
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
};

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStories: (stories: Story[]) => set({ stories }),
      setCurrentStory: (story: Story | null) => set({ currentStory: story }),
      setMyStories: (myStories: Story[]) => set({ myStories }),
      addStory: (story: Story) => {
        set((state) => ({
          stories: [story, ...state.stories],
          myStories: [story, ...state.myStories],
        }));
      },
      removeStory: (storyId: string) => {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== storyId),
          myStories: state.myStories.filter((s) => s.id !== storyId),
          currentStory: state.currentStory?.id === storyId ? null : state.currentStory,
        }));
      },
      markViewed: (storyId: string) => {
        set((state) => ({
          stories: state.stories.map((s) =>
            s.id === storyId ? { ...s, hasViewed: true, viewCount: (s.viewCount || 0) + 1 } : s
          ),
        }));
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
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

export default useStoryStore;