/**
 * KONEX LFG Store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LFGPost {
  id: string;
  authorId: string;
  communityId: string;
  squadId: string | null;
  gameMode: string;
  playersNeeded: number;
  currentPartySize: number;
  rankRequirement: string | null;
  micRequired: boolean;
  message: string;
  status: 'active' | 'filled' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  author?: {
    id: string;
    gamerTag: string;
    username: string;
    avatarUrl: string | null;
    skillLevel: string;
  };
  squad?: {
    id: string;
    name: string;
    iconUrl: string | null;
  };
}

export interface LFGState {
  posts: LFGPost[];
  currentPost: LFGPost | null;
  myPosts: LFGPost[];
  isLoading: boolean;
  error: string | null;
  setPosts: (posts: LFGPost[]) => void;
  setCurrentPost: (post: LFGPost | null) => void;
  setMyPosts: (posts: LFGPost[]) => void;
  addPost: (post: LFGPost) => void;
  updatePost: (postId: string, updates: Partial<LFGPost>) => void;
  removePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: LFGState = {
  posts: [],
  currentPost: null,
  myPosts: [],
  isLoading: false,
  error: null,
  setPosts: () => {},
  setCurrentPost: () => {},
  setMyPosts: () => {},
  addPost: () => {},
  updatePost: () => {},
  removePost: () => {},
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
};

export const useLFGStore = create<LFGState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPosts: (posts: LFGPost[]) => set({ posts }),
      setCurrentPost: (post: LFGPost | null) => set({ currentPost: post }),
      setMyPosts: (myPosts: LFGPost[]) => set({ myPosts }),
      addPost: (post: LFGPost) => {
        set((state) => ({
          posts: [post, ...state.posts],
          myPosts: [post, ...state.myPosts],
        }));
      },
      updatePost: (postId: string, updates: Partial<LFGPost>) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
          myPosts: state.myPosts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
          currentPost: state.currentPost?.id === postId ? { ...state.currentPost, ...updates } : state.currentPost,
        }));
      },
      removePost: (postId: string) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
          myPosts: state.myPosts.filter((p) => p.id !== postId),
          currentPost: state.currentPost?.id === postId ? null : state.currentPost,
        }));
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: '@konex/lfg',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myPosts: state.myPosts,
      }),
    }
  )
);

export default useLFGStore;