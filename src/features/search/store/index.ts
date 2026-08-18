/**
 * KONEX Search Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useSearchStore } from './search.store';

export type {
    RecentSearch, SearchResults, SearchState
} from './search.store';

export {
    selectActiveFilter, selectCommunities, selectError, selectHashtags, selectHasResults, selectIsLoading,
    selectIsSearching, selectPosts, selectQuery, selectRecentSearches, selectResultCount, selectResults, selectSquads, selectUsers
} from './search.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useSearchStore,
};