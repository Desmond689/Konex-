/**
 * KONEX Search Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for search state management
 * 
 * Usage:
 * const { query, results, recentSearches, setQuery, setResults } = useSearchStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface SearchResults {
  users: any[];
  squads: any[];
  posts: any[];
  communities: any[];
  hashtags: any[];
}

export interface RecentSearch {
  id: string;
  query: string;
  createdAt: string;
}

export interface SearchState {
  // State
  query: string;
  results: SearchResults;
  recentSearches: RecentSearch[];
  isLoading: boolean;
  isSearching: boolean;
  hasResults: boolean;
  error: string | null;
  activeFilter: 'all' | 'users' | 'squads' | 'posts' | 'communities' | 'hashtags';
  
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResults) => void;
  setRecentSearches: (searches: RecentSearch[]) => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (id: string) => void;
  clearRecentSearches: () => void;
  setLoading: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
  setHasResults: (hasResults: boolean) => void;
  setError: (error: string | null) => void;
  setActiveFilter: (filter: SearchState['activeFilter']) => void;
  clearResults: () => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialResults: SearchResults = {
  users: [],
  squads: [],
  posts: [],
  communities: [],
  hashtags: [],
};

const initialState: Omit<SearchState, 
  'setQuery' | 'setResults' | 'setRecentSearches' | 'addRecentSearch' | 
  'removeRecentSearch' | 'clearRecentSearches' | 'setLoading' | 'setSearching' | 
  'setHasResults' | 'setError' | 'setActiveFilter' | 'clearResults' | 'reset'
> = {
  query: '',
  results: initialResults,
  recentSearches: [],
  isLoading: false,
  isSearching: false,
  hasResults: false,
  error: null,
  activeFilter: 'all',
};

// ============================================
// 3. STORE
// ============================================

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // QUERY ACTIONS
      // ============================================

      setQuery: (query: string) => {
        set({ query });
        if (__DEV__) {
          console.log(`🔍 Search query set: "${query}"`);
        }
      },

      // ============================================
      // RESULTS ACTIONS
      // ============================================

      setResults: (results: SearchResults) => {
        const hasResults = 
          results.users.length > 0 ||
          results.squads.length > 0 ||
          results.posts.length > 0 ||
          results.communities.length > 0 ||
          results.hashtags.length > 0;
        
        set({ results, hasResults });
        if (__DEV__) {
          console.log(`🔍 Search results updated: ${results.users.length + results.squads.length + results.posts.length + results.communities.length + results.hashtags.length} results`);
        }
      },

      clearResults: () => {
        set({ results: initialResults, hasResults: false });
        if (__DEV__) {
          console.log('🧹 Search results cleared');
        }
      },

      // ============================================
      // RECENT SEARCHES ACTIONS
      // ============================================

      setRecentSearches: (recentSearches: RecentSearch[]) => {
        set({ recentSearches });
        if (__DEV__) {
          console.log(`🔍 Recent searches updated: ${recentSearches.length}`);
        }
      },

      addRecentSearch: (query: string) => {
        if (!query || query.trim().length < 3) return;

        const trimmedQuery = query.trim();
        const { recentSearches } = get();

        // Remove duplicate if exists
        const filtered = recentSearches.filter((s) => s.query !== trimmedQuery);

        const newSearch: RecentSearch = {
          id: `recent_${Date.now()}`,
          query: trimmedQuery,
          createdAt: new Date().toISOString(),
        };

        // Keep only last 10 searches
        const updated = [newSearch, ...filtered].slice(0, 10);

        set({ recentSearches: updated });
        if (__DEV__) {
          console.log(`🔍 Recent search added: "${trimmedQuery}"`);
        }
      },

      removeRecentSearch: (id: string) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s.id !== id),
        }));
        if (__DEV__) {
          console.log(`🔍 Recent search removed: ${id}`);
        }
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
        if (__DEV__) {
          console.log('🧹 Recent searches cleared');
        }
      },

      // ============================================
      // LOADING STATES
      // ============================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      setHasResults: (hasResults: boolean) => {
        set({ hasResults });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Search store error:', error);
        }
      },

      // ============================================
      // FILTER ACTIONS
      // ============================================

      setActiveFilter: (activeFilter: SearchState['activeFilter']) => {
        set({ activeFilter });
        if (__DEV__) {
          console.log(`🔍 Search filter set: ${activeFilter}`);
        }
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Search store reset');
        }
      },
    }),
    {
      name: '@konex/search',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectQuery = (state: SearchState) => state.query;
export const selectResults = (state: SearchState) => state.results;
export const selectRecentSearches = (state: SearchState) => state.recentSearches;
export const selectIsLoading = (state: SearchState) => state.isLoading;
export const selectIsSearching = (state: SearchState) => state.isSearching;
export const selectHasResults = (state: SearchState) => state.hasResults;
export const selectError = (state: SearchState) => state.error;
export const selectActiveFilter = (state: SearchState) => state.activeFilter;

export const selectUsers = (state: SearchState) => state.results.users;
export const selectSquads = (state: SearchState) => state.results.squads;
export const selectPosts = (state: SearchState) => state.results.posts;
export const selectCommunities = (state: SearchState) => state.results.communities;
export const selectHashtags = (state: SearchState) => state.results.hashtags;

export const selectResultCount = (state: SearchState) => {
  const { users, squads, posts, communities, hashtags } = state.results;
  return users.length + squads.length + posts.length + communities.length + hashtags.length;
};

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useSearchStore;