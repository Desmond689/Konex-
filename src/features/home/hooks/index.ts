/**
 * KONEX Home Hooks - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useFeed } from './useFeed';
export { useStories } from './useStories';

export type {
    FeedType,
    UseFeedOptions,
    UseFeedReturn
} from './useFeed';

export type {
    UseStoriesOptions,
    UseStoriesReturn
} from './useStories';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useFeed,
  useStories,
};