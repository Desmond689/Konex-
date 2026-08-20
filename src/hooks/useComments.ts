/**
 * KONEX useComments Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides comments management
 * 
 * Usage:
 * const { comments, addComment, deleteComment, likeComment } = useComments(postId);
 */

import { useCallback, useEffect, useState } from 'react';
import { commentService } from '../api/services/comment.service';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseCommentsOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UseCommentsReturn {
  comments: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<any>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  reportComment: (commentId: string, reason: string, details?: string) => Promise<void>;
}

export const useComments = (
  postId: string,
  options: UseCommentsOptions = {}
): UseCommentsReturn => {
  const { initialLimit = 20, autoFetch = true } = options;
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();

  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // ============================================
  // FETCH COMMENTS
  // ============================================

  const fetchComments = useCallback(async (pageNum: number, refresh: boolean = false) => {
    if (!postId) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await commentService.getCommentsByPost(
        postId,
        initialLimit,
        pageNum * initialLimit
      );

      const commentsData = result || [];
      const hasMoreData = commentsData.length >= initialLimit;

      if (refresh || pageNum === 0) {
        setComments(commentsData);
        setPage(pageNum + 1);
        setHasMore(hasMoreData);
        setTotal(commentsData.length);
      } else {
        setComments(prev => [...prev, ...commentsData]);
        setPage(pageNum + 1);
        setHasMore(hasMoreData);
        setTotal(prev => prev + commentsData.length);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch comments error', error);
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      } else if (pageNum === 0) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [postId, initialLimit]);

  // ============================================
  // LOAD MORE / REFRESH
  // ============================================

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    await fetchComments(page, false);
  }, [page, hasMore, isLoadingMore, isLoading, fetchComments]);

  const refresh = useCallback(async () => {
    await fetchComments(0, true);
  }, [fetchComments]);

  // ============================================
  // COMMENT ACTIONS
  // ============================================

  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const newComment = await commentService.createComment(
        postId,
        user?.id || '',
        content,
        parentId
      );

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
        setTotal(prev => prev + 1);
      }

      trackEvent('comment_add', { postId, parentId });
      showToast('Comment added!', 'success');
      return newComment;
    } catch (err) {
      logger.error('❌ Add comment error', err);
      showToast('Failed to add comment', 'error');
      throw err;
    }
  }, [postId, user, trackEvent, showToast]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const updated = await commentService.updateComment(commentId, user?.id || '', content);
      
      setComments(prev => {
        const updateRecursive = (items: any[]): any[] => {
          return items.map(item => {
            if (item.id === commentId) {
              return { ...item, content: updated.content };
            }
            if (item.replies) {
              return { ...item, replies: updateRecursive(item.replies) };
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      trackEvent('comment_update', { commentId });
      showToast('Comment updated!', 'success');
    } catch (err) {
      logger.error('❌ Update comment error', err);
      showToast('Failed to update comment', 'error');
      throw err;
    }
  }, [user, trackEvent, showToast]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId, user?.id || '');
      
      setComments(prev => {
        const filterRecursive = (items: any[]): any[] => {
          return items.filter(item => {
            if (item.id === commentId) return false;
            if (item.replies) {
              item.replies = filterRecursive(item.replies);
            }
            return true;
          });
        };
        return filterRecursive(prev);
      });
      setTotal(prev => Math.max(0, prev - 1));

      trackEvent('comment_delete', { commentId });
      showToast('Comment deleted', 'info');
    } catch (err) {
      logger.error('❌ Delete comment error', err);
      showToast('Failed to delete comment', 'error');
      throw err;
    }
  }, [user, trackEvent, showToast]);

  const likeComment = useCallback(async (commentId: string) => {
    try {
      await commentService.likeComment(commentId, user?.id || '');
      
      setComments(prev => {
        const updateRecursive = (items: any[]): any[] => {
          return items.map(item => {
            if (item.id === commentId) {
              return { ...item, likesCount: (item.likesCount || 0) + 1 };
            }
            if (item.replies) {
              return { ...item, replies: updateRecursive(item.replies) };
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      trackEvent('comment_like', { commentId });
    } catch (err) {
      logger.error('❌ Like comment error', err);
      throw err;
    }
  }, [user, trackEvent]);

  const unlikeComment = useCallback(async (commentId: string) => {
    try {
      await commentService.unlikeComment(commentId, user?.id || '');
      
      setComments(prev => {
        const updateRecursive = (items: any[]): any[] => {
          return items.map(item => {
            if (item.id === commentId) {
              return { ...item, likesCount: Math.max(0, (item.likesCount || 0) - 1) };
            }
            if (item.replies) {
              return { ...item, replies: updateRecursive(item.replies) };
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      trackEvent('comment_unlike', { commentId });
    } catch (err) {
      logger.error('❌ Unlike comment error', err);
      throw err;
    }
  }, [user, trackEvent]);

  const reportComment = useCallback(async (commentId: string, reason: string, details?: string) => {
    try {
      await commentService.reportComment(commentId, user?.id || '', reason, details);
      trackEvent('comment_report', { commentId, reason });
      showToast('Report submitted successfully', 'success');
    } catch (err) {
      logger.error('❌ Report comment error', err);
      showToast('Failed to submit report', 'error');
      throw err;
    }
  }, [user, trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && postId) {
      fetchComments(0);
    }
  }, [postId, autoFetch]);

  return {
    comments,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    total,
    loadMore,
    refresh,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    reportComment,
  };
};

export default useComments;