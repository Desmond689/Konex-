/**
 * KONEX Home Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useFeedStore } from './feed.store';
export { useStoriesStore } from './stories.store';

export type {
    FeedState, FeedType
} from './feed.store';

export type {
    StoriesState, Story
} from './stories.store';

export {
    selectError as selectFeedError, selectIsLoading as selectFeedIsLoading,
    selectIsRefreshing as selectFeedIsRefreshing, selectFeedType, selectHasMore, selectPage, selectPosts, selectTotalItems
} from './feed.store';

export {
    selectCurrentStory, selectIsCreating, selectIsViewerOpen, selectMyStories, selectStories, selectError as selectStoriesError, selectIsLoading as selectStoriesIsLoading,
    selectIsRefreshing as selectStoriesIsRefreshing, selectViewerIndex
} from './stories.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useFeedStore,
  useStoriesStore,
};