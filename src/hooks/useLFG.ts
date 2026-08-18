/**
 * KONEX useLFG Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides LFG (Looking For Group) management
 * 
 * Usage:
 * const { posts, createLFG, joinLFG } = useLFG();
 */

import { useCallback, useEffect, useState } from 'react';
import { lfgService } from '../api/services/lfg.service';
import { logger } from '../core/logger/logger.service';
import { useLFGStore } from '../store/lfgStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';
import { useInfiniteScroll } from './useInfiniteScroll';

export interface UseLFGOptions {
  communityId?: string;
  squadId?: string;
  autoFetch?: boolean;
  initialLimit?: number;
}

export interface UseLFGReturn {
  posts: any[];
  myPosts: any[];
  currentPost: any | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createLFG: (data: any) => Promise<any>;
  updateLFG: (lfgId: string, data: any) => Promise<void>;
  deleteLFG: (lfgId: string) => Promise<void>;
  joinLFG: (lfgId: string) => Promise<void>;
  leaveLFG: (lfgId: string) => Promise<void>;
  markFilled: (lfgId: string) => Promise<void>;
  cancelLFG: (lfgId: string) => Promise<void>;
  getLFG: (lfgId: string) => Promise<any>;
  approveRequest: (lfgId: string, userId: string) => Promise<void>;
  denyRequest: (lfgId: string, userId: string) => Promise<void>;
}

export const useLFG = (options: UseLFGOptions = {}): UseLFGReturn => {
  const {
    communityId,
    squadId,
    autoFetch = true,
    initialLimit = 20,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    posts,
    myPosts,
    currentPost,
    setPosts,
    setMyPosts,
    setCurrentPost,
    addPost,
    updatePost,
    removePost,
  } = useLFGStore();

  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH LFG POSTS
  // ============================================

  const fetchLFGPosts = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;
      if (communityId) {
        result = await lfgService.getActiveLFG(communityId, pageSize, page * pageSize);
      } else if (squadId) {
        result = await lfgService.getLFGBySquad(squadId, pageSize, page * pageSize);
      } else {
        result = [];
      }

      return {
        data: result || [],
        hasMore: result.length >= pageSize,
        total: result.length,
      };
    } catch (err) {
      logger.error('❌ Fetch LFG posts error', err);
      throw err;
    }
  }, [communityId, squadId]);

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
  } = useInfiniteScroll(fetchLFGPosts, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => setError(err),
  });

  // ============================================
  // CREATE LFG
  // ============================================

  const createLFG = useCallback(async (data: any) => {
    try {
      const newLFG = await lfgService.createLFG({
        ...data,
        author_id: user?.id,
        community_id: communityId,
        squad_id: squadId || null,
      });

      addPost(newLFG);
      
      trackEvent('lfg_create', {
        lfgId: newLFG.id,
        gameMode: data.gameMode,
        playersNeeded: data.playersNeeded,
      });

      showToast('LFG created successfully!', 'success');
      return newLFG;
    } catch (err) {
      logger.error('❌ Create LFG error', err);
      showToast('Failed to create LFG', 'error');
      throw err;
    }
  }, [user, communityId, squadId, addPost, trackEvent, showToast]);

  // ============================================
  // UPDATE / DELETE LFG
  // ============================================

  const updateLFG = useCallback(async (lfgId: string, data: any) => {
    try {
      const updated = await lfgService.updateLFG(lfgId, data);
      updatePost(lfgId, updated);
      
      trackEvent('lfg_update', { lfgId });
      showToast('LFG updated successfully!', 'success');
    } catch (err) {
      logger.error('❌ Update LFG error', err);
      showToast('Failed to update LFG', 'error');
      throw err;
    }
  }, [updatePost, trackEvent, showToast]);

  const deleteLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.deleteLFG(lfgId);
      removePost(lfgId);
      
      trackEvent('lfg_delete', { lfgId });
      showToast('LFG deleted', 'info');
    } catch (err) {
      logger.error('❌ Delete LFG error', err);
      showToast('Failed to delete LFG', 'error');
      throw err;
    }
  }, [removePost, trackEvent, showToast]);

  // ============================================
  // JOIN / LEAVE LFG
  // ============================================

  const joinLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.joinLFG(lfgId, user?.id || '');
      
      // Refresh LFG data
      await refresh();
      
      trackEvent('lfg_join', { lfgId });
      showToast('Joined LFG!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Join LFG error', error);
      showToast(error.message || 'Failed to join LFG', 'error');
      throw err;
    }
  }, [user, refresh, trackEvent, showToast]);

  const leaveLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.leaveLFG(lfgId, user?.id || '');
      
      // Refresh LFG data
      await refresh();
      
      trackEvent('lfg_leave', { lfgId });
      showToast('Left LFG', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Leave LFG error', error);
      showToast(error.message || 'Failed to leave LFG', 'error');
      throw err;
    }
  }, [user, refresh, trackEvent, showToast]);

  // ============================================
  // MARK FILLED / CANCEL
  // ============================================

  const markFilled = useCallback(async (lfgId: string) => {
    try {
      await lfgService.markFilled(lfgId, user?.id || '');
      updatePost(lfgId, { status: 'filled' });
      
      trackEvent('lfg_fill', { lfgId });
      showToast('LFG marked as filled', 'success');
    } catch (err) {
      logger.error('❌ Mark LFG filled error', err);
      showToast('Failed to mark LFG as filled', 'error');
      throw err;
    }
  }, [user, updatePost, trackEvent, showToast]);

  const cancelLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.cancelLFG(lfgId, user?.id || '');
      updatePost(lfgId, { status: 'cancelled' });
      
      trackEvent('lfg_cancel', { lfgId });
      showToast('LFG cancelled', 'info');
    } catch (err) {
      logger.error('❌ Cancel LFG error', err);
      showToast('Failed to cancel LFG', 'error');
      throw err;
    }
  }, [user, updatePost, trackEvent, showToast]);

  // ============================================
  // GET SINGLE LFG
  // ============================================

  const getLFG = useCallback(async (lfgId: string) => {
    try {
      const result = await lfgService.getLFG(lfgId);
      setCurrentPost(result);
      return result;
    } catch (err) {
      logger.error('❌ Get LFG error', err);
      throw err;
    }
  }, [setCurrentPost]);

  // ============================================
  // REQUESTS
  // ============================================

  const approveRequest = useCallback(async (lfgId: string, targetUserId: string) => {
    try {
      await lfgService.approveLFGRequest(lfgId, targetUserId);
      
      trackEvent('lfg_request_approve', { lfgId, userId: targetUserId });
      showToast('Request approved', 'success');
    } catch (err) {
      logger.error('❌ Approve LFG request error', err);
      showToast('Failed to approve request', 'error');
      throw err;
    }
  }, [trackEvent, showToast]);

  const denyRequest = useCallback(async (lfgId: string, targetUserId: string) => {
    try {
      await lfgService.denyLFGRequest(lfgId, targetUserId);
      
      trackEvent('lfg_request_deny', { lfgId, userId: targetUserId });
      showToast('Request denied', 'info');
    } catch (err) {
      logger.error('❌ Deny LFG request error', err);
      showToast('Failed to deny request', 'error');
      throw err;
    }
  }, [trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && (communityId || squadId)) {
      reset();
      loadMore();
    }
  }, [communityId, squadId, autoFetch]);

  // Fetch user's LFG posts
  useEffect(() => {
    if (user?.id) {
      lfgService.getLFGByUser(user.id).then((result) => {
        setMyPosts(result || []);
      }).catch((err) => {
        logger.error('❌ Fetch user LFG posts error', err);
      });
    }
  }, [user?.id, setMyPosts]);

  return {
    posts: data,
    myPosts,
    currentPost,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    createLFG,
    updateLFG,
    deleteLFG,
    joinLFG,
    leaveLFG,
    markFilled,
    cancelLFG,
    getLFG,
    approveRequest,
    denyRequest,
  };
};

export default useLFG;