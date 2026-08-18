/**
 * KONEX Post Store
 */

import { create } from 'zustand';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  communityId?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  likedByMe?: boolean;
}

interface PostState {
  feed: Post[];
  isLoading: boolean;
  hasMore: boolean;
  setFeed: (posts: Post[]) => void;
  appendFeed: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  removePost: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  feed: [],
  isLoading: false,
  hasMore: true,
  setFeed: (feed) => set({ feed }),
  appendFeed: (posts) => set((s) => ({ feed: [...s.feed, ...posts] })),
  addPost: (post) => set((s) => ({ feed: [post, ...s.feed] })),
  updatePost: (id, patch) =>
    set((s) => ({
      feed: s.feed.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePost: (id) => set((s) => ({ feed: s.feed.filter((p) => p.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  reset: () => set({ feed: [], isLoading: false, hasMore: true }),
}));

export default usePostStore;
