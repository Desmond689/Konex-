/**
 * KONEX useLFG Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides LFG (Looking For Group) functionality
 * 
 * Usage:
 * const { posts, createLFG, joinLFG } = useLFG({ communityId: '123' });
 */

import { useCallback, useEffect, useState } from 'react';
import { lfgService } from '../../../api/services/lfg.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { useRealtime } from '../../../hooks/useRealtime';
import { useUIStore } from '../../../store/uiStore';
import { useLFGStore } from '../store/lfg.store';

// ============================================
// 1. TYPES
// ============================================

export interface UseLFGOptions {
  /** Community ID to filter LFG posts */
  communityId?: string;
  /** Squad ID to filter LFG posts */
  squadId?: string;
  /** Auto fetch on mount */
  autoFetch?: boolean;
  /** Initial page size */
  initialLimit?: number;
}

export interface UseLFGReturn {
  // Data
  posts: any[];
  myPosts: any[];
  currentPost: any | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isJoining: boolean;
  hasMore: boolean;
  
  // Error states
  error: Error | null;
  
  // Fetch functions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // LFG actions
  createLFG: (data: any) => Promise<any>;
  updateLFG: (lfgId: string, data: any) => Promise<void>;
  deleteLFG: (lfgId: string) => Promise<void>;
  joinLFG: (lfgId: string) => Promise<void>;
  leaveLFG: (lfgId: string) => Promise<void>;
  markFilled: (lfgId: string) => Promise<void>;
  cancelLFG: (lfgId: string) => Promise<void>;
  getLFG: (lfgId: string) => Promise<any>;
  
  // Requests
  approveRequest: (lfgId: string, userId: string) => Promise<void>;
  denyRequest: (lfgId: string, userId: string) => Promise<void>;
  getLFGRequests: (lfgId: string) => Promise<any[]>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

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
  const { subscribe, unsubscribe } = useRealtime();
  
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
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

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
        result = await lfgService.getGlobalLFG(pageSize, page * pageSize);
      }

      const postsData = Array.isArray(result) ? result : [];
      
      // Update store
      if (page === 0) {
        setPosts(postsData);
      } else {
        setPosts([...posts, ...postsData]);
      }

      trackEvent('lfg_fetch', {
        communityId,
        squadId,
        count: postsData.length,
        page,
      });

      return {
        data: postsData,
        hasMore: postsData.length >= pageSize,
        total: postsData.length,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch LFG posts error', error);
      throw error;
    }
  }, [communityId, squadId, posts, setPosts, trackEvent]);

  // ============================================
  // INFINITE SCROLL
  // ============================================

  const {
    data,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    reset,
  } = useInfiniteScroll(fetchLFGPosts, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => setError(err),
    onSuccess: (newData) => {
      trackEvent('lfg_page_loaded', {
        communityId,
        count: newData.length,
      });
    },
  });

  // ============================================
  // CREATE LFG
  // ============================================

  const createLFG = useCallback(async (lfgData: any) => {
    try {
      setIsCreating(true);
      setError(null);

      const newLFG = await lfgService.createLFG({
        ...lfgData,
        author_id: user?.id,
        community_id: communityId || null,
        squad_id: squadId || null,
        status: 'active',
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      });

      addPost(newLFG);
      
      trackEvent('lfg_create', {
        lfgId: newLFG.id,
        gameMode: lfgData.gameMode,
        playersNeeded: lfgData.playersNeeded,
        communityId,
        squadId,
      });

      showToast('LFG created successfully!', 'success');
      return newLFG;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Create LFG error', error);
      showToast('Failed to create LFG', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user, communityId, squadId, addPost, trackEvent, showToast]);

  // ============================================
  // UPDATE / DELETE LFG
  // ============================================

  const updateLFG = useCallback(async (lfgId: string, lfgData: any) => {
    try {
      const updated = await lfgService.updateLFG(lfgId, lfgData);
      updatePost(lfgId, updated);
      
      trackEvent('lfg_update', { lfgId });
      showToast('LFG updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Update LFG error', error);
      showToast('Failed to update LFG', 'error');
      throw error;
    }
  }, [updatePost, trackEvent, showToast]);

  const deleteLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.deleteLFG(lfgId);
      removePost(lfgId);
      
      trackEvent('lfg_delete', { lfgId });
      showToast('LFG deleted', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete LFG error', error);
      showToast('Failed to delete LFG', 'error');
      throw error;
    }
  }, [removePost, trackEvent, showToast]);

  // ============================================
  // JOIN / LEAVE LFG
  // ============================================

  const joinLFG = useCallback(async (lfgId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await lfgService.joinLFG(lfgId, user?.id || '');
      
      // Update local state
      const post = data.find((p: any) => p.id === lfgId);
      if (post) {
        updatePost(lfgId, {
          currentPartySize: post.currentPartySize + 1,
          isJoined: true,
        });
      }
      
      trackEvent('lfg_join', { lfgId });
      showToast('Joined LFG!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Join LFG error', error);
      showToast(error.message || 'Failed to join LFG', 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, data, updatePost, trackEvent, showToast]);

  const leaveLFG = useCallback(async (lfgId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await lfgService.leaveLFG(lfgId, user?.id || '');
      
      // Update local state
      const post = data.find((p: any) => p.id === lfgId);
      if (post) {
        updatePost(lfgId, {
          currentPartySize: post.currentPartySize - 1,
          isJoined: false,
        });
      }
      
      trackEvent('lfg_leave', { lfgId });
      showToast('Left LFG', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Leave LFG error', error);
      showToast(error.message || 'Failed to leave LFG', 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, data, updatePost, trackEvent, showToast]);

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
      const error = err as Error;
      setError(error);
      logger.error('❌ Mark LFG filled error', error);
      showToast('Failed to mark LFG as filled', 'error');
      throw error;
    }
  }, [user, updatePost, trackEvent, showToast]);

  const cancelLFG = useCallback(async (lfgId: string) => {
    try {
      await lfgService.cancelLFG(lfgId, user?.id || '');
      updatePost(lfgId, { status: 'cancelled' });
      
      trackEvent('lfg_cancel', { lfgId });
      showToast('LFG cancelled', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Cancel LFG error', error);
      showToast('Failed to cancel LFG', 'error');
      throw error;
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
      const error = err as Error;
      setError(error);
      logger.error('❌ Get LFG error', error);
      throw error;
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
      const error = err as Error;
      setError(error);
      logger.error('❌ Approve LFG request error', error);
      showToast('Failed to approve request', 'error');
      throw error;
    }
  }, [trackEvent, showToast]);

  const denyRequest = useCallback(async (lfgId: string, targetUserId: string) => {
    try {
      await lfgService.denyLFGRequest(lfgId, targetUserId);
      
      trackEvent('lfg_request_deny', { lfgId, userId: targetUserId });
      showToast('Request denied', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Deny LFG request error', error);
      showToast('Failed to deny request', 'error');
      throw error;
    }
  }, [trackEvent, showToast]);

  const getLFGRequests = useCallback(async (lfgId: string) => {
    try {
      return await lfgService.getLFGRequests(lfgId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Get LFG requests error', error);
      return [];
    }
  }, []);

  // ============================================
  // FETCH MY LFG POSTS
  // ============================================

  const fetchMyLFGPosts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await lfgService.getLFGByUser(user.id);
      setMyPosts(result || []);
    } catch (err) {
      logger.error('❌ Fetch my LFG posts error', err);
    }
  }, [user, setMyPosts]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!communityId) return;

    const subscription = subscribe(
      `lfg_${communityId}`,
      {
        table: 'lfg_posts',
        filter: { community_id: communityId },
        onInsert: (payload) => {
          addPost(payload);
          trackEvent('lfg_realtime_insert', { lfgId: payload.id });
        },
        onUpdate: (payload) => {
          updatePost(payload.id, payload);
        },
        onDelete: (payload) => {
          removePost(payload.id);
        },
      }
    );

    setRealtimeSubscription(subscription);

    return () => {
      if (subscription) {
        unsubscribe(subscription.id);
      }
    };
  }, [communityId, subscribe, unsubscribe, addPost, updatePost, removePost, trackEvent]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    reset();
    setError(null);
  }, [reset]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && (communityId || squadId)) {
      resetState();
      loadMore();
    }
  }, [communityId, squadId, autoFetch]);

  // Fetch user's LFG posts
  useEffect(() => {
    if (user?.id) {
      fetchMyLFGPosts();
    }
  }, [user?.id]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    posts: data,
    myPosts,
    currentPost,
    
    // Loading states
    isLoading,
    isRefreshing,
    isCreating,
    isJoining,
    hasMore,
    
    // Error states
    error,
    
    // Fetch functions
    loadMore,
    refresh,
    
    // LFG actions
    createLFG,
    updateLFG,
    deleteLFG,
    joinLFG,
    leaveLFG,
    markFilled,
    cancelLFG,
    getLFG,
    
    // Requests
    approveRequest,
    denyRequest,
    getLFGRequests,
    
    // Utility
    clearError,
    reset: resetState,
  };
};

export default useLFG;