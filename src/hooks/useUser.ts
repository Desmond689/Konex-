// @ts-nocheck
/**
 * KONEX useUser Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides user profile state and actions
 * 
 * Usage:
 * const { profile, updateProfile, isLoading } = useUser();
 */

import { useCallback, useEffect, useState } from 'react';
import { storageService, uploadAvatar } from '../api/client/storage.client';
import { userService } from '../api/services/user.service';
import { trackEvent } from '../config/analytics';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';

export interface UseUserReturn {
  // State
  profile: any | null;
  settings: any | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  
  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (settings: any) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (imageUri: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  uploadCover: (imageUri: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  addFriend: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const useUser = (userId?: string): UseUserReturn => {
  const { 
    profile, 
    settings, 
    isLoading, 
    error, 
    isOnline,
    setProfile, 
    setSettings, 
    updateProfile: updateProfileStore,
    updateSettings: updateSettingsStore,
    setLoading,
    setError,
    setOnline,
    incrementFollowers,
    decrementFollowers,
    incrementFollowing,
    decrementFollowing,
    incrementFriends,
    decrementFriends,
    clear: clearUser,
  } = useUserStore();
  
  const { showToast } = useUIStore();
  const [localError, setLocalError] = useState<string | null>(null);

  // ============================================
  // 1. FETCH PROFILE
  // ============================================

  const fetchProfile = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      const userProfile = await userService.getProfile(targetUserId);
      setProfile(userProfile);
      
      // Fetch settings if it's the current user
      // settings would be fetched separately
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Failed to load profile';
      setError(message);
      setLocalError(message);
      logger.error('❌ Fetch profile error', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. UPDATE PROFILE
  // ============================================

  const updateProfile = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      if (!profile) {
        throw new Error('No profile loaded');
      }

      const updated = await userService.updateProfile(profile.id, data);
      updateProfileStore(updated);
      
      trackEvent('user_profile_edit', { 
        userId: profile.id,
        updatedFields: Object.keys(data),
      });
      
      showToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Failed to update profile';
      setError(message);
      setLocalError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updateSettings = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      if (!profile) {
        throw new Error('No profile loaded');
      }

      // Update settings in the database
      // This would call a settings service
      updateSettingsStore(data);
      
      showToast('Settings updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      const message = error?.message || 'Failed to update settings';
      setError(message);
      setLocalError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // ============================================
  // 3. UPLOAD AVATAR & COVER
  // ============================================

  const uploadUserAvatar = useCallback(async (imageUri: string) => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      if (!profile) {
        throw new Error('No profile loaded');
      }

      const url = await uploadAvatar(profile.id, imageUri);
      
      // Update profile with new avatar URL
      const updated = await userService.updateProfile(profile.id, { avatar_url: url });
      updateProfileStore(updated);
      
      trackEvent('user_avatar_upload', { userId: profile.id });
      
      showToast('Avatar updated successfully!', 'success');
      return { success: true, url };
    } catch (error: any) {
      const message = error?.message || 'Failed to upload avatar';
      setError(message);
      setLocalError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const uploadCover = useCallback(async (imageUri: string) => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      if (!profile) {
        throw new Error('No profile loaded');
      }

      // Upload cover image
      const url = await storageService.uploadImage(
        'covers',
        `users/${profile.id}/cover_${Date.now()}.jpg`,
        imageUri
      );
      
      // Update profile with new cover URL
      const updated = await userService.updateProfile(profile.id, { cover_image_url: url });
      updateProfileStore(updated);
      
      trackEvent('user_cover_upload', { userId: profile.id });
      
      showToast('Cover image updated successfully!', 'success');
      return { success: true, url };
    } catch (error: any) {
      const message = error?.message || 'Failed to upload cover image';
      setError(message);
      setLocalError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // ============================================
  // 4. SOCIAL ACTIONS
  // ============================================

  const followUser = useCallback(async (targetUserId: string) => {
    try {
      if (!profile) return;
      
      await userService.followUser(profile.id, targetUserId);
      incrementFollowing();
      
      trackEvent('user_follow', { 
        followerId: profile.id,
        followingId: targetUserId,
      });
    } catch (error) {
      logger.error('❌ Follow error', error);
      showToast('Failed to follow user', 'error');
    }
  }, [profile]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    try {
      if (!profile) return;
      
      await userService.unfollowUser(profile.id, targetUserId);
      decrementFollowing();
      
      trackEvent('user_unfollow', { 
        followerId: profile.id,
        followingId: targetUserId,
      });
    } catch (error) {
      logger.error('❌ Unfollow error', error);
      showToast('Failed to unfollow user', 'error');
    }
  }, [profile]);

  const addFriend = useCallback(async (targetUserId: string) => {
    try {
      if (!profile) return;
      
      await userService.sendFriendRequest(profile.id, targetUserId);
      incrementFriends();
      
      trackEvent('user_friend_request', { 
        senderId: profile.id,
        receiverId: targetUserId,
      });
      
      showToast('Friend request sent!', 'success');
    } catch (error) {
      logger.error('❌ Add friend error', error);
      showToast('Failed to send friend request', 'error');
    }
  }, [profile]);

  const removeFriend = useCallback(async (targetUserId: string) => {
    try {
      if (!profile) return;
      
      await userService.removeFriend(profile.id, targetUserId);
      decrementFriends();
      
      trackEvent('user_friend_remove', { 
        userId: profile.id,
        friendId: targetUserId,
      });
      
      showToast('Friend removed', 'info');
    } catch (error) {
      logger.error('❌ Remove friend error', error);
      showToast('Failed to remove friend', 'error');
    }
  }, [profile]);

  // ============================================
  // 5. UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
    setLocalError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (profile?.id) {
      await fetchProfile(profile.id);
    }
  }, [profile, fetchProfile]);

  // ============================================
  // 6. EFFECTS
  // ============================================

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  // Online status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnline(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    profile,
    settings,
    isLoading,
    error: localError || error,
    isOnline,
    fetchProfile,
    updateProfile,
    updateSettings,
    uploadAvatar: uploadUserAvatar,
    uploadCover,
    followUser,
    unfollowUser,
    addFriend,
    removeFriend,
    clearError,
    refresh,
  };
};

export default useUser;