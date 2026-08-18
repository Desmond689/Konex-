/**
 * KONEX useFriend Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides friend request functionality
 * 
 * Usage:
 * const { isFriend, sendRequest, acceptRequest } = useFriend(targetUserId);
 */

import { useCallback, useEffect, useState } from 'react';
import { friendService } from '../api/services/friend.service';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseFriendReturn {
  isFriend: boolean;
  isFriendRequestPending: boolean;
  isFriendRequestSent: boolean;
  isLoading: boolean;
  friendsCount: number;
  sendRequest: () => Promise<void>;
  cancelRequest: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  removeFriend: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useFriend = (targetUserId: string): UseFriendReturn => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();

  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isFriendRequestPending, setIsFriendRequestPending] = useState<boolean>(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  // ============================================
  // CHECK FRIEND STATUS
  // ============================================

  const checkFriendStatus = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      const [friends, requests, count] = await Promise.all([
        friendService.areFriends(user.id, targetUserId),
        friendService.getFriendRequestStatus(user.id, targetUserId),
        friendService.getFriendCount(targetUserId),
      ]);

      setIsFriend(friends);
      setIsFriendRequestPending(requests?.status === 'pending' && requests?.receiverId === user.id);
      setIsFriendRequestSent(requests?.status === 'pending' && requests?.senderId === user.id);
      setPendingRequestId(requests?.id || null);
      setFriendsCount(count);
    } catch (err) {
      logger.error('❌ Check friend status error', err);
    }
  }, [user, targetUserId]);

  // ============================================
  // FRIEND OPERATIONS
  // ============================================

  const sendRequest = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      setIsLoading(true);
      await friendService.sendFriendRequest(user.id, targetUserId);
      
      setIsFriendRequestSent(true);
      
      trackEvent('friend_request_send', {
        senderId: user.id,
        receiverId: targetUserId,
      });
      
      showToast('Friend request sent!', 'success');
    } catch (err) {
      logger.error('❌ Send friend request error', err);
      showToast('Failed to send friend request', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, targetUserId, trackEvent, showToast]);

  const cancelRequest = useCallback(async () => {
    if (!pendingRequestId) return;

    try {
      setIsLoading(true);
      await friendService.cancelFriendRequest(pendingRequestId, user?.id || '');
      
      setIsFriendRequestSent(false);
      setPendingRequestId(null);
      
      trackEvent('friend_request_cancel', { requestId: pendingRequestId });
      showToast('Friend request cancelled', 'info');
    } catch (err) {
      logger.error('❌ Cancel friend request error', err);
      showToast('Failed to cancel friend request', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pendingRequestId, user, trackEvent, showToast]);

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      await friendService.acceptFriendRequest(requestId, user?.id || '');
      
      setIsFriend(true);
      setIsFriendRequestPending(false);
      setFriendsCount(prev => prev + 1);
      
      trackEvent('friend_request_accept', { requestId });
      showToast('Friend request accepted!', 'success');
    } catch (err) {
      logger.error('❌ Accept friend request error', err);
      showToast('Failed to accept friend request', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const declineRequest = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      await friendService.declineFriendRequest(requestId, user?.id || '');
      
      setIsFriendRequestPending(false);
      
      trackEvent('friend_request_decline', { requestId });
      showToast('Friend request declined', 'info');
    } catch (err) {
      logger.error('❌ Decline friend request error', err);
      showToast('Failed to decline friend request', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const removeFriend = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      setIsLoading(true);
      await friendService.removeFriend(user.id, targetUserId);
      
      setIsFriend(false);
      setFriendsCount(prev => Math.max(0, prev - 1));
      
      trackEvent('friend_remove', {
        userId: user.id,
        friendId: targetUserId,
      });
      
      showToast('Friend removed', 'info');
    } catch (err) {
      logger.error('❌ Remove friend error', err);
      showToast('Failed to remove friend', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, targetUserId, trackEvent, showToast]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    await checkFriendStatus();
  }, [checkFriendStatus]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (user?.id && targetUserId) {
      refresh();
    }
  }, [user?.id, targetUserId]);

  return {
    isFriend,
    isFriendRequestPending,
    isFriendRequestSent,
    isLoading,
    friendsCount,
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    refresh,
  };
};

export default useFriend;