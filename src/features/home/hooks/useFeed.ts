// @ts-nocheck
/**
 * KONEX useFeed Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides feed functionality for the home screen
 * 
 * Usage:
 * const { posts, loadMore, refresh, createPost, likePost } = useFeed();
 */

import { useCallback, useEffect, useState } from 'react';
import { likeService } from '../../../api/services/like.service';
import { postService } from '../../../api/services/post.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { usePostStore } from '../../../store/postStore';
import { useUIStore } from '../../../store/uiStore';

// ============================================
// 1. TYPES
// ============================================

export type FeedType = 'for_you' | 'following' | 'trending' | 'latest';

export interface UseFeedOptions {
  /** Feed type to display */
  feedType?: FeedType;
  /** Community ID to filter */
  communityId?: string;
  /** Squad ID to filter */
  squadId?: string;
  /** User ID to filter */
  userId?: string;
  /** Initial page size */
  initialLimit?: number;
  /** Auto fetch on mount */
  autoFetch?: boolean;
}

export interface UseFeedReturn {
  // Data
  posts: any[];
  feedType: FeedType;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  
  // Error states
  error: Error | null;
  
  // Fetch functions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFeedType: (type: FeedType) => void;
  
  // Post actions
  createPost: (data: any) => Promise<any>;
  updatePost: (postId: string, data: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  sharePost: (postId: string, squadId?: string) => Promise<void>;
  reportPost: (postId: string, reason: string, details?: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  getPostById: (postId: string) => any | undefined;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useFeed = (options: UseFeedOptions = {}): UseFeedReturn => {
  const {
    feedType: initialFeedType = 'for_you',
    communityId,
    squadId,
    userId,
    initialLimit = 20,
    autoFetch = true,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { 
    posts, 
    setFeed, 
    addPost: addPostStore,
    updatePost: updatePostStore,
    removePost: removePostStore,
  } = usePostStore();

  const [feedType, setFeedTypeState] = useState<FeedType>(initialFeedType);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH FUNCTION
  // ============================================

  const fetchPosts = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;
      let total = 0;

      switch (feedType) {
        case 'for_you':
          result = await postService.getFeed(user?.id || '', pageSize, page * pageSize);
          break;
        case 'following':
          // Fetch posts from followed users
          result = await postService.getFollowingFeed(user?.id || '', pageSize, page * pageSize);
          break;
        case 'trending':
          if (communityId) {
            result = await postService.getTrendingPosts(communityId, pageSize);
          } else {
            result = await postService.getGlobalTrending(pageSize);
          }
          break;
        case 'latest':
          if (communityId) {
            result = await postService.getPostsByCommunity(communityId, pageSize, page * pageSize);
          } else if (squadId) {
            result = await postService.getPostsBySquad(squadId, pageSize, page * pageSize);
          } else if (userId) {
            result = await postService.getPostsByUser(userId, pageSize, page * pageSize);
          } else {
            result = await postService.getLatestPosts(pageSize, page * pageSize);
          }
          break;
        default:
          result = await postService.getFeed(user?.id || '', pageSize, page * pageSize);
      }

      const postsData = Array.isArray(result) ? result : result?.data || [];
      total = result?.total || postsData.length;

      // Update feed store
      if (page === 0) {
        setFeed(postsData);
      } else {
        setFeed([...posts, ...postsData]);
      }

      trackEvent('feed_loaded', {
        feedType,
        count: postsData.length,
        page,
        communityId,
      });

      return {
        data: postsData,
        hasMore: postsData.length >= pageSize && total > (page + 1) * pageSize,
        total,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch feed error', error);
      throw error;
    }
  }, [user, feedType, communityId, squadId, userId, posts, setFeed, trackEvent]);

  // ============================================
  // INFINITE SCROLL
  // ============================================

  const {
    data,
    isLoading,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    reset,
    setData,
  } = useInfiniteScroll(fetchPosts, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => setError(err),
    onSuccess: (newData) => {
      trackEvent('feed_page_loaded', {
        feedType,
        count: newData.length,
      });
    },
  });

  // ============================================
  // SET FEED TYPE
  // ============================================

  const setFeedType = useCallback((type: FeedType) => {
    setFeedTypeState(type);
    reset();
    loadMore();
    
    trackEvent('feed_type_changed', { 
      from: feedType,
      to: type,
    });
  }, [feedType, reset, loadMore, trackEvent]);

  // ============================================
  // POST ACTIONS
  // ============================================

  const createPost = useCallback(async (postData: any) => {
    try {
      const newPost = await postService.createPost({
        ...postData,
        author_id: user?.id,
        community_id: communityId || null,
        squad_id: squadId || null,
      });

      addPostStore(newPost);
      
      trackEvent('post_create', {
        postId: newPost.id,
        type: postData.postType,
        communityId,
        squadId,
      });

      showToast('Post created successfully!', 'success');
      return newPost;
    } catch (err) {
      logger.error('❌ Create post error', err);
      showToast('Failed to create post', 'error');
      throw err;
    }
  }, [user, communityId, squadId, addPostStore, trackEvent, showToast]);

  const updatePost = useCallback(async (postId: string, postData: any) => {
    try {
      const updated = await postService.updatePost(postId, postData);
      updatePostStore(postId, updated);
      
      trackEvent('post_edit', { postId });
      showToast('Post updated successfully!', 'success');
    } catch (err) {
      logger.error('❌ Update post error', err);
      showToast('Failed to update post', 'error');
      throw err;
    }
  }, [updatePostStore, trackEvent, showToast]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postService.deletePost(postId);
      removePostStore(postId);
      
      trackEvent('post_delete', { postId });
      showToast('Post deleted', 'info');
    } catch (err) {
      logger.error('❌ Delete post error', err);
      showToast('Failed to delete post', 'error');
      throw err;
    }
  }, [removePostStore, trackEvent, showToast]);

  const likePost = useCallback(async (postId: string) => {
    try {
      await likeService.toggleLike(postId, user?.id || '');
      
      // Update local state
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        const newLiked = !post.isLiked;
        const newCount = post.likesCount + (newLiked ? 1 : -1);
        updatePostStore(postId, {
          likesCount: newCount,
          isLiked: newLiked,
        });
      }
      
      trackEvent('post_like', { postId });
    } catch (err) {
      logger.error('❌ Like post error', err);
    }
  }, [user, data, updatePostStore, trackEvent]);

  const unlikePost = useCallback(async (postId: string) => {
    try {
      await likeService.toggleLike(postId, user?.id || '');
      
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          likesCount: Math.max(0, post.likesCount - 1),
          isLiked: false,
        });
      }
      
      trackEvent('post_unlike', { postId });
    } catch (err) {
      logger.error('❌ Unlike post error', err);
    }
  }, [user, data, updatePostStore, trackEvent]);

  const savePost = useCallback(async (postId: string) => {
    try {
      await postService.savePost(postId, user?.id || '');
      
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          savesCount: post.savesCount + 1,
          isSaved: true,
        });
      }
      
      trackEvent('post_save', { postId });
      showToast('Post saved!', 'success');
    } catch (err) {
      logger.error('❌ Save post error', err);
      showToast('Failed to save post', 'error');
      throw err;
    }
  }, [user, data, updatePostStore, trackEvent, showToast]);

  const unsavePost = useCallback(async (postId: string) => {
    try {
      await postService.unsavePost(postId, user?.id || '');
      
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          savesCount: Math.max(0, post.savesCount - 1),
          isSaved: false,
        });
      }
      
      trackEvent('post_unsave', { postId });
      showToast('Post unsaved', 'info');
    } catch (err) {
      logger.error('❌ Unsave post error', err);
      showToast('Failed to unsave post', 'error');
      throw err;
    }
  }, [user, data, updatePostStore, trackEvent, showToast]);

  const sharePost = useCallback(async (postId: string, targetSquadId?: string) => {
    try {
      await postService.sharePost(postId, user?.id || '', targetSquadId);
      
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          sharesCount: post.sharesCount + 1,
        });
      }
      
      trackEvent('post_share', { postId, targetSquadId });
      showToast('Post shared!', 'success');
    } catch (err) {
      logger.error('❌ Share post error', err);
      showToast('Failed to share post', 'error');
      throw err;
    }
  }, [user, data, updatePostStore, trackEvent, showToast]);

  const reportPost = useCallback(async (postId: string, reason: string, details?: string) => {
    try {
      await postService.reportPost(postId, user?.id || '', reason, details);
      trackEvent('post_report', { postId, reason });
      showToast('Report submitted successfully', 'success');
    } catch (err) {
      logger.error('❌ Report post error', err);
      showToast('Failed to submit report', 'error');
      throw err;
    }
  }, [user, trackEvent, showToast]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetFeed = useCallback(() => {
    reset();
    setError(null);
  }, [reset]);

  const getPostById = useCallback((postId: string) => {
    return data.find((p: any) => p.id === postId);
  }, [data]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch) {
      reset();
      loadMore();
    }
  }, [autoFetch]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    posts: data,
    feedType,
    
    // Loading states
    isLoading,
    isRefreshing,
    hasMore,
    
    // Error states
    error,
    
    // Fetch functions
    loadMore,
    refresh,
    setFeedType,
    
    // Post actions
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    sharePost,
    reportPost,
    
    // Utility
    clearError,
    reset: resetFeed,
    getPostById,
  };
};

export default useFeed;