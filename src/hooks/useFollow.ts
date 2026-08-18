/**
 * KONEX useFollow Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides follow/unfollow functionality
 * 
 * Usage:
 * const { isFollowing, follow, unfollow } = useFollow(targetUserId);
 */

import { useCallback, useEffect, useState } from 'react';
import { followService } from '../api/services/follow.service';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseFollowReturn {
  isFollowing: boolean;
  isLoading: boolean;
  followersCount: number;
  followingCount: number;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  toggleFollow: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useFollow = (targetUserId: string): UseFollowReturn => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  // ============================================
  // CHECK FOLLOW STATUS
  // ============================================

  const checkFollowStatus = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      const status = await followService.isFollowing(user.id, targetUserId);
      setIsFollowing(status);
    } catch (err) {
      logger.error('❌ Check follow status error', err);
    }
  }, [user, targetUserId]);

  // ============================================
  // GET FOLLOW COUNTS
  // ============================================

  const getFollowCounts = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const counts = await followService.getFollowCounts(targetUserId);
      setFollowersCount(counts.followers);
      setFollowingCount(counts.following);
    } catch (err) {
      logger.error('❌ Get follow counts error', err);
    }
  }, [targetUserId]);

  // ============================================
  // FOLLOW / UNFOLLOW
  // ============================================

  const follow = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      setIsLoading(true);
      await followService.followUser(user.id, targetUserId);
      
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      
      trackEvent('user_follow', {
        followerId: user.id,
        followingId: targetUserId,
      });
      
      showToast('Followed user', 'success');
    } catch (err) {
      logger.error('❌ Follow user error', err);
      showToast('Failed to follow user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, targetUserId, trackEvent, showToast]);

  const unfollow = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      setIsLoading(true);
      await followService.unfollowUser(user.id, targetUserId);
      
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      
      trackEvent('user_unfollow', {
        followerId: user.id,
        followingId: targetUserId,
      });
      
      showToast('Unfollowed user', 'info');
    } catch (err) {
      logger.error('❌ Unfollow user error', err);
      showToast('Failed to unfollow user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, targetUserId, trackEvent, showToast]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [isFollowing, follow, unfollow]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    await Promise.all([
      checkFollowStatus(),
      getFollowCounts(),
    ]);
  }, [checkFollowStatus, getFollowCounts]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (user?.id && targetUserId) {
      refresh();
    }
  }, [user?.id, targetUserId]);

  return {
    isFollowing,
    isLoading,
    followersCount,
    followingCount,
    follow,
    unfollow,
    toggleFollow,
    refresh,
  };
};

export default useFollow;