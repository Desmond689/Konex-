/**
 * KONEX useCommunity Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides community functionality for the community feature
 * 
 * Usage:
 * const { community, members, joinCommunity } = useCommunity(communityId);
 */

import { useCallback, useEffect, useState } from 'react';
import { communityService } from '../../../api/services/community.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useCommunityStore } from '../../../store/communityStore';
import { useUIStore } from '../../../store/uiStore';

export interface UseCommunityOptions {
  autoFetch?: boolean;
  includeMembers?: boolean;
  includeSquads?: boolean;
  includePosts?: boolean;
}

export interface UseCommunityReturn {
  community: any | null;
  members: any[];
  squads: any[];
  posts: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  isMember: boolean;
  fetchCommunity: () => Promise<void>;
  refresh: () => Promise<void>;
  joinCommunity: () => Promise<void>;
  leaveCommunity: () => Promise<void>;
  updateCommunity: (data: any) => Promise<void>;
}

export const useCommunity = (communityId: string, options: UseCommunityOptions = {}): UseCommunityReturn => {
  const {
    autoFetch = true,
    includeMembers = false,
    includeSquads = false,
    includePosts = false,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const { 
    currentCommunity,
    members,
    setCurrentCommunity,
    setMembers,
    addCommunity,
    removeCommunity,
    updateCommunity: updateCommunityStore,
  } = useCommunityStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [squads, setSquads] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const community = currentCommunity?.id === communityId ? currentCommunity : null;
  const isMember = true; // This would be checked from user's communities

  // ============================================
  // FETCH COMMUNITY
  // ============================================

  const fetchCommunity = useCallback(async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [communityData, membersData, squadsData, postsData] = await Promise.all([
        communityService.getCommunity(communityId),
        includeMembers ? communityService.getCommunityMembers(communityId) : [],
        includeSquads ? communityService.getCommunitySquads(communityId) : [],
        includePosts ? communityService.getCommunityPosts(communityId) : [],
      ]);

      setCurrentCommunity(communityData);
      if (includeMembers) setMembers(membersData);
      if (includeSquads) setSquads(squadsData);
      if (includePosts) setPosts(postsData);

      trackEvent('community_view', { communityId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch community error', error);
    } finally {
      setIsLoading(false);
    }
  }, [communityId, includeMembers, includeSquads, includePosts, setCurrentCommunity, setMembers, trackEvent]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    if (!communityId) return;

    try {
      setIsRefreshing(true);
      setError(null);

      const [communityData, membersData, squadsData, postsData] = await Promise.all([
        communityService.getCommunity(communityId),
        includeMembers ? communityService.getCommunityMembers(communityId) : [],
        includeSquads ? communityService.getCommunitySquads(communityId) : [],
        includePosts ? communityService.getCommunityPosts(communityId) : [],
      ]);

      setCurrentCommunity(communityData);
      if (includeMembers) setMembers(membersData);
      if (includeSquads) setSquads(squadsData);
      if (includePosts) setPosts(postsData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Refresh community error', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [communityId, includeMembers, includeSquads, includePosts, setCurrentCommunity, setMembers]);

  // ============================================
  // JOIN / LEAVE
  // ============================================

  const joinCommunity = useCallback(async () => {
    try {
      await communityService.joinCommunity(user?.id || '', communityId);
      
      // Refresh community data
      await refresh();
      
      trackEvent('community_join', { communityId });
      showToast('Joined community successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Join community error', error);
      showToast(error.message || 'Failed to join community', 'error');
      throw err;
    }
  }, [user, communityId, refresh, trackEvent, showToast]);

  const leaveCommunity = useCallback(async () => {
    try {
      await communityService.leaveCommunity(user?.id || '', communityId);
      
      // Refresh community data
      await refresh();
      
      trackEvent('community_leave', { communityId });
      showToast('Left community', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Leave community error', error);
      showToast(error.message || 'Failed to leave community', 'error');
      throw err;
    }
  }, [user, communityId, refresh, trackEvent, showToast]);

  // ============================================
  // UPDATE COMMUNITY
  // ============================================

  const updateCommunity = useCallback(async (data: any) => {
    try {
      const updated = await communityService.updateCommunity(communityId, data);
      updateCommunityStore(communityId, updated);
      
      trackEvent('community_edit', { communityId });
      showToast('Community updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Update community error', error);
      showToast(error.message || 'Failed to update community', 'error');
      throw err;
    }
  }, [communityId, updateCommunityStore, trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && communityId) {
      fetchCommunity();
    }
  }, [communityId, autoFetch]);

  return {
    community,
    members,
    squads,
    posts,
    isLoading,
    isRefreshing,
    error,
    isMember,
    fetchCommunity,
    refresh,
    joinCommunity,
    leaveCommunity,
    updateCommunity,
  };
};

export default useCommunity;