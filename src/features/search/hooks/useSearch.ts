// @ts-nocheck
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
import { searchService } from '../../../api/services/search.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useDebounce } from '../../../hooks/useDebounce';
import { useUIStore } from '../../../store/uiStore';

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

export interface UseSearchOptions {
  communityId?: string;
  autoSearch?: boolean;
  delay?: number;
}

export interface UseSearchReturn {
  // Data
  results: SearchResults;
  query: string;
  isLoading: boolean;
  isSearching: boolean;
  hasResults: boolean;
  error: Error | null;
  recentSearches: any[];
  
  // Actions
  search: (query: string) => Promise<void>;
  clear: () => void;
  clearRecent: () => Promise<void>;
  saveSearch: (query: string) => Promise<void>;
  getRecentSearches: () => Promise<void>;
  
  // Category-specific search
  searchUsers: (query: string) => Promise<any[]>;
  searchSquads: (query: string) => Promise<any[]>;
  searchPosts: (query: string) => Promise<any[]>;
  searchCommunities: (query: string) => Promise<any[]>;
  searchHashtags: (query: string) => Promise<any[]>;
  
  // Utility
  setQuery: (query: string) => void;
  getResultCount: () => number;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    communityId,
    autoSearch = false,
    delay = 500,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();

  // State
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

      // Track analytics
      trackEvent('search_performed', {
        query: searchQuery,
        resultsCount: (
          searchResults.users.length +
          searchResults.squads.length +
          searchResults.posts.length +
          searchResults.communities.length +
          searchResults.hashtags.length
        ),
        types: {
          users: searchResults.users.length,
          squads: searchResults.squads.length,
          posts: searchResults.posts.length,
          communities: searchResults.communities.length,
          hashtags: searchResults.hashtags.length,
        },
      });

      logger.debug('🔍 Search completed', { 
        query: searchQuery, 
        results: searchResults.users.length + searchResults.squads.length + searchResults.posts.length + searchResults.communities.length + searchResults.hashtags.length,
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Search error', error);
      trackEvent('search_error', { query: searchQuery, error: error.message });
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

  const setQueryDirect = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (autoSearch) {
      debouncedSearch.debouncedCallback(newQuery);
    }
  }, [autoSearch, debouncedSearch]);

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
    trackEvent('search_cleared');
  }, [debouncedSearch, trackEvent]);

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
      trackEvent('recent_searches_cleared');
    } catch (err) {
      logger.error('❌ Clear recent searches error', err);
      showToast('Failed to clear recent searches', 'error');
      throw err;
    }
  }, [user, showToast, trackEvent]);

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
  // UTILITY
  // ============================================

  const getResultCount = useCallback(() => {
    return (
      results.users.length +
      results.squads.length +
      results.posts.length +
      results.communities.length +
      results.hashtags.length
    );
  }, [results]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    getRecentSearches();
  }, []);

  // Clear results when query is empty
  useEffect(() => {
    if (query.length === 0) {
      setResults({
        users: [],
        squads: [],
        posts: [],
        communities: [],
        hashtags: [],
      });
      setHasResults(false);
    }
  }, [query]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    results,
    query,
    isLoading,
    isSearching,
    hasResults,
    error,
    recentSearches,
    
    // Actions
    search,
    clear,
    clearRecent,
    saveSearch,
    getRecentSearches,
    
    // Category-specific search
    searchUsers,
    searchSquads,
    searchPosts,
    searchCommunities,
    searchHashtags,
    
    // Utility
    setQuery: setQueryDirect,
    getResultCount,
  };
};

export default useSearch;