/**
 * KONEX useSearch Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides search functionality across the app
 * 
 * Usage:
 * const { results, search, clear, isSearching } = useSearch();
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchService } from '../api/services/search.service';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';
import { useDebounce } from './useDebounce';

export interface UseSearchOptions {
  communityId?: string;
  autoSearch?: boolean;
  delay?: number;
}

export interface SearchResults {
  users: any[];
  squads: any[];
  posts: any[];
  communities: any[];
  hashtags: any[];
}

export interface UseSearchReturn {
  results: SearchResults;
  isLoading: boolean;
  isSearching: boolean;
  hasResults: boolean;
  error: Error | null;
  query: string;
  recentSearches: any[];
  search: (query: string) => Promise<void>;
  clear: () => void;
  clearRecent: () => Promise<void>;
  saveSearch: (query: string) => Promise<void>;
  getRecentSearches: () => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  searchSquads: (query: string) => Promise<any[]>;
  searchPosts: (query: string) => Promise<any[]>;
  searchCommunities: (query: string) => Promise<any[]>;
  searchHashtags: (query: string) => Promise<any[]>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    communityId,
    autoSearch = false,
    delay = 500,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResults>({
    users: [],
    squads: [],
    posts: [],
    communities: [],
    hashtags: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [hasResults, setHasResults] = useState<boolean>(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // PERFORM SEARCH
  // ============================================

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults({
        users: [],
        squads: [],
        posts: [],
        communities: [],
        hashtags: [],
      });
      setHasResults(false);
      setIsSearching(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsSearching(true);
      setError(null);

      const result = await searchService.search(searchQuery.trim(), communityId);

      const searchResults = {
        users: result.users || [],
        squads: result.squads || [],
        posts: result.posts || [],
        communities: result.communities || [],
        hashtags: result.hashtags || [],
      };

      setResults(searchResults);
      setHasResults(
        searchResults.users.length > 0 ||
        searchResults.squads.length > 0 ||
        searchResults.posts.length > 0 ||
        searchResults.communities.length > 0 ||
        searchResults.hashtags.length > 0
      );

      // Save to recent searches
      if (searchQuery.trim().length >= 3) {
        await searchService.saveSearch(user?.id || '', searchQuery.trim());
        await getRecentSearches();
      }

      trackEvent('search', {
        query: searchQuery,
        resultsCount: (
          searchResults.users.length +
          searchResults.squads.length +
          searchResults.posts.length +
          searchResults.communities.length +
          searchResults.hashtags.length
        ),
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Search error', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [communityId, user, trackEvent]);

  // ============================================
  // SEARCH WITH DEBOUNCE
  // ============================================

  const debouncedSearch = useDebounce(
    (searchQuery: string) => performSearch(searchQuery),
    delay
  );

  // ============================================
  // SEARCH FUNCTIONS
  // ============================================

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    if (autoSearch) {
      debouncedSearch.debouncedCallback(searchQuery);
    } else {
      await performSearch(searchQuery);
    }
  }, [autoSearch, performSearch, debouncedSearch]);

  const clear = useCallback(() => {
    setQuery('');
    setResults({
      users: [],
      squads: [],
      posts: [],
      communities: [],
      hashtags: [],
    });
    setHasResults(false);
    setIsSearching(false);
    setError(null);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  // ============================================
  // RECENT SEARCHES
  // ============================================

  const getRecentSearches = useCallback(async () => {
    if (!user?.id) return;

    try {
      const searches = await searchService.getRecentSearches(user.id);
      setRecentSearches(searches || []);
    } catch (err) {
      logger.error('❌ Get recent searches error', err);
    }
  }, [user]);

  const saveSearch = useCallback(async (searchQuery: string) => {
    if (!user?.id || !searchQuery || searchQuery.trim().length < 3) return;

    try {
      await searchService.saveSearch(user.id, searchQuery.trim());
      await getRecentSearches();
    } catch (err) {
      logger.error('❌ Save search error', err);
    }
  }, [user, getRecentSearches]);

  const clearRecent = useCallback(async () => {
    if (!user?.id) return;

    try {
      await searchService.clearRecentSearches(user.id);
      setRecentSearches([]);
      showToast('Recent searches cleared', 'info');
    } catch (err) {
      logger.error('❌ Clear recent searches error', err);
      showToast('Failed to clear recent searches', 'error');
      throw err;
    }
  }, [user, showToast]);

  // ============================================
  // CATEGORY SEARCH FUNCTIONS
  // ============================================

  const searchUsers = useCallback(async (searchQuery: string) => {
    try {
      return await searchService.searchUsers(searchQuery, communityId);
    } catch (err) {
      logger.error('❌ Search users error', err);
      return [];
    }
  }, [communityId]);

  const searchSquads = useCallback(async (searchQuery: string) => {
    try {
      return await searchService.searchSquads(searchQuery, communityId);
    } catch (err) {
      logger.error('❌ Search squads error', err);
      return [];
    }
  }, [communityId]);

  const searchPosts = useCallback(async (searchQuery: string) => {
    try {
      return await searchService.searchPosts(searchQuery, communityId);
    } catch (err) {
      logger.error('❌ Search posts error', err);
      return [];
    }
  }, [communityId]);

  const searchCommunities = useCallback(async (searchQuery: string) => {
    try {
      return await searchService.searchCommunities(searchQuery);
    } catch (err) {
      logger.error('❌ Search communities error', err);
      return [];
    }
  }, []);

  const searchHashtags = useCallback(async (searchQuery: string) => {
    try {
      return await searchService.searchHashtags(searchQuery);
    } catch (err) {
      logger.error('❌ Search hashtags error', err);
      return [];
    }
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    getRecentSearches();
  }, []);

  return {
    results,
    isLoading,
    isSearching,
    hasResults,
    error,
    query,
    recentSearches,
    search,
    clear,
    clearRecent,
    saveSearch,
    getRecentSearches,
    searchUsers,
    searchSquads,
    searchPosts,
    searchCommunities,
    searchHashtags,
  };
};

export default useSearch;