// @ts-nocheck
/**
 * KONEX usePosts Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides posts/feed management
 * 
 * Usage:
 * const { posts, loadMore, createPost, likePost } = usePosts();
 */

import { useCallback, useState } from 'react';
import { postService } from '../api/services/post.service';
import { logger } from '../core/logger/logger.service';
import { usePostStore } from '../store/postStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';
import { useInfiniteScroll } from './useInfiniteScroll';

export interface UsePostsOptions {
  communityId?: string;
  squadId?: string;
  userId?: string;
  feedType?: 'feed' | 'trending' | 'following' | 'recommended';
  initialLimit?: number;
}

export interface UsePostsReturn {
  posts: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createPost: (data: any) => Promise<any>;
  updatePost: (postId: string, data: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  reportPost: (postId: string, reason: string, details?: string) => Promise<void>;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const {
    communityId,
    squadId,
    userId,
    feedType = 'feed',
    initialLimit = 20,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { 
    posts,
    setPosts,
    addPost: addPostStore,
    updatePost: updatePostStore,
    removePost: removePostStore,
  } = usePostStore();

  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH FUNCTION
  // ============================================

  const fetchPosts = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;

      if (feedType === 'feed') {
        result = await postService.getFeed(user?.id || '', pageSize, page * pageSize);
      } else if (feedType === 'trending' && communityId) {
        result = await postService.getTrendingPosts(communityId, pageSize);
      } else if (squadId) {
        result = await postService.getPostsBySquad(squadId, pageSize, page * pageSize);
      } else if (communityId) {
        result = await postService.getPostsByCommunity(communityId, pageSize, page * pageSize);
      } else if (userId) {
        result = await postService.getPostsByUser(userId, pageSize, page * pageSize);
      } else {
        result = [];
      }

      return {
        data: Array.isArray(result) ? result : result.data || [],
        hasMore: result.length >= pageSize,
        total: result.total || result.length,
      };
    } catch (err) {
      logger.error('❌ Fetch posts error', err);
      throw err;
    }
  }, [user, feedType, communityId, squadId, userId]);

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
  });

  // ============================================
  // CREATE POST
  // ============================================

  const createPost = useCallback(async (data: any) => {
    try {
      const newPost = await postService.createPost({
        ...data,
        author_id: user?.id,
        community_id: communityId,
        squad_id: squadId || null,
      });

      addPostStore(newPost);
      
      trackEvent('post_create', {
        postId: newPost.id,
        type: data.postType,
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

  // ============================================
  // UPDATE POST
  // ============================================

  const updatePost = useCallback(async (postId: string, data: any) => {
    try {
      const updated = await postService.updatePost(postId, data);
      updatePostStore(postId, updated);
      
      trackEvent('post_edit', { postId });
      showToast('Post updated successfully!', 'success');
    } catch (err) {
      logger.error('❌ Update post error', err);
      showToast('Failed to update post', 'error');
      throw err;
    }
  }, [updatePostStore, trackEvent, showToast]);

  // ============================================
  // DELETE POST
  // ============================================

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

  // ============================================
  // LIKE / UNLIKE
  // ============================================

  const likePost = useCallback(async (postId: string) => {
    try {
      await postService.likePost(postId, user?.id || '');
      
      const post = data.find(p => p.id === postId);
      if (post) {
        const newLiked = !post.userLiked;
        const newCount = post.likesCount + (newLiked ? 1 : -1);
        updatePostStore(postId, {
          likesCount: newCount,
          userLiked: newLiked,
        });
      }
      
      trackEvent('post_like', { postId });
    } catch (err) {
      logger.error('❌ Like post error', err);
      throw err;
    }
  }, [user, data, updatePostStore, trackEvent]);

  const unlikePost = useCallback(async (postId: string) => {
    try {
      await postService.unlikePost(postId, user?.id || '');
      
      const post = data.find(p => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          likesCount: Math.max(0, post.likesCount - 1),
          userLiked: false,
        });
      }
      
      trackEvent('post_unlike', { postId });
    } catch (err) {
      logger.error('❌ Unlike post error', err);
      throw err;
    }
  }, [user, data, updatePostStore, trackEvent]);

  // ============================================
  // SAVE / UN SAVE
  // ============================================

  const savePost = useCallback(async (postId: string) => {
    try {
      await postService.savePost(postId, user?.id || '');
      
      const post = data.find(p => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          savesCount: post.savesCount + 1,
          userSaved: true,
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
      
      const post = data.find(p => p.id === postId);
      if (post) {
        updatePostStore(postId, {
          savesCount: Math.max(0, post.savesCount - 1),
          userSaved: false,
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

  // ============================================
  // REPORT POST
  // ============================================

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

  return {
    posts: data,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    reportPost,
  };
};

export default usePosts;