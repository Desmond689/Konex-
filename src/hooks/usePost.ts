// @ts-nocheck
/**
 * KONEX usePost Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides single post management
 * 
 * Usage:
 * const { post, isLoading, likePost, comment } = usePost(postId);
 */

import { useCallback, useEffect, useState } from 'react';
import { postService } from '../api/services/post.service';
import { logger } from '../core/logger/logger.service';
import { usePostStore } from '../store/postStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UsePostReturn {
  post: any | null;
  isLoading: boolean;
  error: Error | null;
  comments: any[];
  isLiked: boolean;
  isSaved: boolean;
  fetchPost: () => Promise<void>;
  refresh: () => Promise<void>;
  likePost: () => Promise<void>;
  unlikePost: () => Promise<void>;
  savePost: () => Promise<void>;
  unsavePost: () => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  reportPost: (reason: string, details?: string) => Promise<void>;
  sharePost: (squadId?: string) => Promise<void>;
}

export const usePost = (postId: string): UsePostReturn => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { currentPost, setCurrentPost, updatePost: updatePostStore } = usePostStore();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const post = currentPost?.id === postId ? currentPost : null;

  // ============================================
  // FETCH POST
  // ============================================

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [postData, commentsData] = await Promise.all([
        postService.getPostWithDetails(postId),
        postService.getPostComments(postId),
      ]);

      setCurrentPost(postData);
      setComments(commentsData || []);
      setIsLiked(postData.userLiked || false);
      setIsSaved(postData.userSaved || false);

      trackEvent('post_view', { postId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch post error', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, setCurrentPost, trackEvent]);

  // ============================================
  // LIKE / UNLIKE
  // ============================================

  const likePost = useCallback(async () => {
    try {
      await postService.likePost(postId, user?.id || '');
      setIsLiked(true);
      if (post) {
        updatePostStore(postId, {
          likesCount: (post.likesCount || 0) + 1,
          userLiked: true,
        });
      }
      trackEvent('post_like', { postId });
    } catch (err) {
      logger.error('❌ Like post error', err);
      throw err;
    }
  }, [postId, user, post, updatePostStore, trackEvent]);

  const unlikePost = useCallback(async () => {
    try {
      await postService.unlikePost(postId, user?.id || '');
      setIsLiked(false);
      if (post) {
        updatePostStore(postId, {
          likesCount: Math.max(0, (post.likesCount || 0) - 1),
          userLiked: false,
        });
      }
      trackEvent('post_unlike', { postId });
    } catch (err) {
      logger.error('❌ Unlike post error', err);
      throw err;
    }
  }, [postId, user, post, updatePostStore, trackEvent]);

  // ============================================
  // SAVE / UN SAVE
  // ============================================

  const savePost = useCallback(async () => {
    try {
      await postService.savePost(postId, user?.id || '');
      setIsSaved(true);
      if (post) {
        updatePostStore(postId, {
          savesCount: (post.savesCount || 0) + 1,
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
  }, [postId, user, post, updatePostStore, trackEvent, showToast]);

  const unsavePost = useCallback(async () => {
    try {
      await postService.unsavePost(postId, user?.id || '');
      setIsSaved(false);
      if (post) {
        updatePostStore(postId, {
          savesCount: Math.max(0, (post.savesCount || 0) - 1),
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
  }, [postId, user, post, updatePostStore, trackEvent, showToast]);

  // ============================================
  // COMMENTS
  // ============================================

  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const newComment = await postService.addComment(postId, user?.id || '', content, parentId);
      
      if (parentId) {
        // Add as reply
        setComments(prev => {
          const parentComment = prev.find(c => c.id === parentId);
          if (parentComment) {
            parentComment.replies = [...(parentComment.replies || []), newComment];
          }
          return [...prev];
        });
      } else {
        setComments(prev => [newComment, ...prev]);
      }

      // Update comment count
      if (post) {
        updatePostStore(postId, {
          commentsCount: (post.commentsCount || 0) + 1,
        });
      }

      trackEvent('post_comment', { postId, parentId });
      return newComment;
    } catch (err) {
      logger.error('❌ Add comment error', err);
      showToast('Failed to add comment', 'error');
      throw err;
    }
  }, [postId, user, post, updatePostStore, trackEvent, showToast]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await postService.deleteComment(commentId, user?.id || '');
      
      setComments(prev => {
        // Remove from main comments
        const filtered = prev.filter(c => c.id !== commentId);
        // Remove from replies
        return filtered.map(c => {
          if (c.replies) {
            c.replies = c.replies.filter((r: any) => r.id !== commentId);
          }
          return c;
        });
      });

      if (post) {
        updatePostStore(postId, {
          commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
        });
      }

      trackEvent('post_comment_delete', { postId, commentId });
      showToast('Comment deleted', 'info');
    } catch (err) {
      logger.error('❌ Delete comment error', err);
      showToast('Failed to delete comment', 'error');
      throw err;
    }
  }, [postId, user, post, updatePostStore, trackEvent, showToast]);

  // ============================================
  // REPORT / SHARE
  // ============================================

  const reportPost = useCallback(async (reason: string, details?: string) => {
    try {
      await postService.reportPost(postId, user?.id || '', reason, details);
      trackEvent('post_report', { postId, reason });
      showToast('Report submitted successfully', 'success');
    } catch (err) {
      logger.error('❌ Report post error', err);
      showToast('Failed to submit report', 'error');
      throw err;
    }
  }, [postId, user, trackEvent, showToast]);

  const sharePost = useCallback(async (squadId?: string) => {
    try {
      await postService.sharePost(postId, user?.id || '', squadId);
      if (post) {
        updatePostStore(postId, {
          sharesCount: (post.sharesCount || 0) + 1,
        });
      }
      trackEvent('post_share', { postId, squadId });
      showToast('Post shared!', 'success');
    } catch (err) {
      logger.error('❌ Share post error', err);
      showToast('Failed to share post', 'error');
      throw err;
    }
  }, [postId, user, post, updatePostStore, trackEvent, showToast]);

  // ============================================
  // REFRESH / INIT
  // ============================================

  const refresh = useCallback(async () => {
    await fetchPost();
  }, [fetchPost]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  return {
    post,
    isLoading,
    error,
    comments,
    isLiked,
    isSaved,
    fetchPost,
    refresh,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    addComment,
    deleteComment,
    reportPost,
    sharePost,
  };
};

export default usePost;