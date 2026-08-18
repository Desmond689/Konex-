/**
 * KONEX Search Components - Main Export
 * Billion Dollar Code - Production Ready
 */

export { SearchBar } from './SearchBar';
export { SearchFilter } from './SearchFilter';
export { SearchResult } from './SearchResult';

export type {
    SearchBarProps
} from './SearchBar';

export type {
    SearchCounts,
    SearchFilterProps, SearchFilterType
} from './SearchFilter';

export type {
    SearchResultData,
    SearchResultProps, SearchResultType
} from './SearchResult';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  SearchBar,
  SearchFilter,
  SearchResult,
};