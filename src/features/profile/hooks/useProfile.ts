// @ts-nocheck
/**
 * KONEX useProfile Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides profile functionality
 * 
 * Usage:
 * const { profile, updateProfile, followUser } = useProfile(userId);
 */

import { useCallback, useEffect, useState } from 'react';
import { storageService, uploadAvatar } from '../../../api/client/storage.client';
import { followService } from '../../../api/services/follow.service';
import { friendService } from '../../../api/services/friend.service';
import { userService } from '../../../api/services/user.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useUIStore } from '../../../store/uiStore';
import { useUserStore } from '../../../store/userStore';

// ============================================
// 1. TYPES
// ============================================

export interface UseProfileOptions {
  autoFetch?: boolean;
}

export interface UseProfileReturn {
  // Data
  profile: any | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  relationship: 'self' | 'stranger' | 'following' | 'friend' | 'friend_request_sent' | 'friend_request_received';
  
  // Actions
  fetchProfile: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<string>;
  uploadCover: (imageUri: string) => Promise<string>;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  sendFriendRequest: () => Promise<void>;
  cancelFriendRequest: () => Promise<void>;
  acceptFriendRequest: () => Promise<void>;
  declineFriendRequest: () => Promise<void>;
  removeFriend: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useProfile = (userId: string, options: UseProfileOptions = {}): UseProfileReturn => {
  const { autoFetch = true } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { profile, setProfile, setLoading, setError, clear: clearUser } = useUserStore();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<'self' | 'stranger' | 'following' | 'friend' | 'friend_request_sent' | 'friend_request_received'>('stranger');

  const isOwnProfile = user?.id === userId;

  // ============================================
  // FETCH PROFILE
  // ============================================

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setErrorState(null);

      const userProfile = await userService.getProfile(userId);
      setProfile(userProfile);

      // Determine relationship
      if (isOwnProfile) {
        setRelationship('self');
      } else {
        // Check if friends
        const areFriends = await friendService.areFriends(user?.id || '', userId);
        if (areFriends) {
          setRelationship('friend');
        } else {
          // Check friend request status
          const request = await friendService.getFriendRequestStatus(user?.id || '', userId);
          if (request?.status === 'pending') {
            if (request.senderId === user?.id) {
              setRelationship('friend_request_sent');
            } else {
              setRelationship('friend_request_received');
            }
          } else {
            // Check if following
            const isFollowing = await followService.isFollowing(user?.id || '', userId);
            setRelationship(isFollowing ? 'following' : 'stranger');
          }
        }
      }

      trackEvent('profile_view', { userId, isOwn: isOwnProfile });
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Fetch profile error', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile, user, setProfile, setLoading, trackEvent]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfile();
    setIsRefreshing(false);
  }, [fetchProfile]);

  // ============================================
  // UPDATE PROFILE
  // ============================================

  const updateProfile = useCallback(async (data: any) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setErrorState(null);

      const updated = await userService.updateProfile(user.id, data);
      setProfile(updated);

      trackEvent('profile_update', { fields: Object.keys(data) });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Update profile error', error);
      showToast('Failed to update profile', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, setProfile, setLoading, trackEvent, showToast]);

  // ============================================
  // UPLOAD AVATAR
  // ============================================

  const uploadAvatarImage = useCallback(async (imageUri: string) => {
    if (!user?.id) return '';

    try {
      setLoading(true);
      setErrorState(null);

      const url = await uploadAvatar(user.id, imageUri);
      await updateProfile({ avatar_url: url });

      trackEvent('avatar_upload');
      showToast('Avatar updated!', 'success');
      return url;
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Upload avatar error', error);
      showToast('Failed to upload avatar', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, updateProfile, setLoading, trackEvent, showToast]);

  // ============================================
  // UPLOAD COVER
  // ============================================

  const uploadCoverImage = useCallback(async (imageUri: string) => {
    if (!user?.id) return '';

    try {
      setLoading(true);
      setErrorState(null);

      const url = await storageService.uploadImage(
        'covers',
        `users/${user.id}/cover_${Date.now()}.jpg`,
        imageUri
      );
      await updateProfile({ cover_image_url: url });

      trackEvent('cover_upload');
      showToast('Cover image updated!', 'success');
      return url;
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Upload cover error', error);
      showToast('Failed to upload cover image', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, updateProfile, setLoading, trackEvent, showToast]);

  // ============================================
  // FOLLOW / UNFOLLOW
  // ============================================

  const follow = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await followService.followUser(user.id, userId);
      setRelationship('following');
      trackEvent('follow', { userId: userId });
      showToast('Followed!', 'success');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Follow error', error);
      showToast('Failed to follow', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  const unfollow = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await followService.unfollowUser(user.id, userId);
      setRelationship('stranger');
      trackEvent('unfollow', { userId: userId });
      showToast('Unfollowed', 'info');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Unfollow error', error);
      showToast('Failed to unfollow', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  // ============================================
  // FRIEND REQUESTS
  // ============================================

  const sendFriendRequest = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await friendService.sendFriendRequest(user.id, userId);
      setRelationship('friend_request_sent');
      trackEvent('friend_request_send', { userId: userId });
      showToast('Friend request sent!', 'success');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Send friend request error', error);
      showToast('Failed to send friend request', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  const cancelFriendRequest = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await friendService.cancelFriendRequest(user.id, userId);
      setRelationship('stranger');
      trackEvent('friend_request_cancel', { userId: userId });
      showToast('Friend request cancelled', 'info');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Cancel friend request error', error);
      showToast('Failed to cancel friend request', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  const acceptFriendRequest = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await friendService.acceptFriendRequest(user.id, userId);
      setRelationship('friend');
      trackEvent('friend_request_accept', { userId: userId });
      showToast('Friend added!', 'success');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Accept friend request error', error);
      showToast('Failed to accept friend request', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  const declineFriendRequest = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await friendService.declineFriendRequest(user.id, userId);
      setRelationship('stranger');
      trackEvent('friend_request_decline', { userId: userId });
      showToast('Friend request declined', 'info');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Decline friend request error', error);
      showToast('Failed to decline friend request', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  const removeFriend = useCallback(async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      await friendService.removeFriend(user.id, userId);
      setRelationship('stranger');
      trackEvent('friend_remove', { userId: userId });
      showToast('Friend removed', 'info');
    } catch (err) {
      const error = err as Error;
      setErrorState(error.message);
      logger.error('❌ Remove friend error', error);
      showToast('Failed to remove friend', 'error');
      throw error;
    }
  }, [user, userId, isOwnProfile, trackEvent, showToast]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && userId) {
      fetchProfile();
    }
  }, [userId, autoFetch]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    profile,
    isLoading: profile?.isLoading || false,
    isRefreshing,
    error,
    relationship,
    
    // Actions
    fetchProfile,
    refresh,
    updateProfile,
    uploadAvatar: uploadAvatarImage,
    uploadCover: uploadCoverImage,
    follow,
    unfollow,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    
    // Utility
    clearError,
  };
};

export default useProfile;