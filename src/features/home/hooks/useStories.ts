/**
 * KONEX useStories Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides stories functionality for the home screen
 * 
 * Usage:
 * const { stories, createStory, viewStory, refresh } = useStories();
 */

import { useCallback, useEffect, useState } from 'react';
import { storageService } from '../../../api/client/storage.client';
import { storyService } from '../../../api/services/story.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRealtime } from '../../../hooks/useRealtime';
import { useStoryStore } from '../../../store/storyStore';
import { useUIStore } from '../../../store/uiStore';

// ============================================
// 1. TYPES
// ============================================

export interface UseStoriesOptions {
  /** Auto fetch on mount */
  autoFetch?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface UseStoriesReturn {
  // Data
  stories: any[];
  myStories: any[];
  currentStory: any | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  
  // Error states
  error: Error | null;
  
  // Actions
  fetchStories: () => Promise<void>;
  refresh: () => Promise<void>;
  createStory: (mediaUri: string, type: 'image' | 'video', text?: string) => Promise<any>;
  deleteStory: (storyId: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  getStory: (storyId: string) => Promise<any>;
  getStoryViewers: (storyId: string) => Promise<any[]>;
  hasViewedStory: (storyId: string) => Promise<boolean>;
  
  // Navigation
  openStoryViewer: (userId: string) => void;
  closeStoryViewer: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useStories = (options: UseStoriesOptions = {}): UseStoriesReturn => {
  const {
    autoFetch = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { subscribe } = useRealtime();
  
  const {
    stories,
    myStories,
    currentStory,
    setStories,
    setMyStories,
    setCurrentStory,
    addStory,
    removeStory,
    markViewed,
  } = useStoryStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);

  // ============================================
  // FETCH STORIES
  // ============================================

  const fetchStories = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [storiesData, myStoriesData] = await Promise.all([
        storyService.getStories(user.id),
        storyService.getUserStories(user.id),
      ]);

      setStories(storiesData || []);
      setMyStories(myStoriesData || []);

      trackEvent('stories_view', { count: storiesData.length });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch stories error', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, setStories, setMyStories, trackEvent]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsRefreshing(true);
      setError(null);

      const [storiesData, myStoriesData] = await Promise.all([
        storyService.getStories(user.id),
        storyService.getUserStories(user.id),
      ]);

      setStories(storiesData || []);
      setMyStories(myStoriesData || []);

      trackEvent('stories_refresh', { count: storiesData.length });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Refresh stories error', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, setStories, setMyStories, trackEvent]);

  // ============================================
  // CREATE STORY
  // ============================================

  const createStory = useCallback(async (mediaUri: string, type: 'image' | 'video', text?: string) => {
    try {
      setIsCreating(true);
      setError(null);

      // Upload media to storage
      const bucket = type === 'image' ? 'story_images' : 'story_videos';
      const path = `users/${user?.id}/stories/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${type === 'image' ? 'jpg' : 'mp4'}`;
      
      const mediaUrl = await storageService.uploadFile(bucket, path, mediaUri, {
        contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
      });

      // Create story in database
      const newStory = await storyService.createStory(
        user?.id || '',
        mediaUrl,
        type,
        text
      );

      addStory(newStory);
      
      trackEvent('story_create', {
        storyId: newStory.id,
        type,
        hasText: !!text,
      });

      showToast('Story posted! 🎉', 'success');
      return newStory;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Create story error', error);
      showToast('Failed to create story', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user, addStory, trackEvent, showToast]);

  // ============================================
  // DELETE STORY
  // ============================================

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await storyService.deleteStory(storyId, user?.id || '');
      removeStory(storyId);
      
      trackEvent('story_delete', { storyId });
      showToast('Story deleted', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete story error', error);
      showToast('Failed to delete story', 'error');
      throw error;
    }
  }, [user, removeStory, trackEvent, showToast]);

  // ============================================
  // VIEW STORY
  // ============================================

  const viewStory = useCallback(async (storyId: string) => {
    try {
      await storyService.viewStory(storyId, user?.id || '');
      markViewed(storyId);
      
      trackEvent('story_view', { storyId });
    } catch (err) {
      logger.error('❌ View story error', err);
    }
  }, [user, markViewed, trackEvent]);

  // ============================================
  // GET STORY
  // ============================================

  const getStory = useCallback(async (storyId: string) => {
    try {
      return await storyService.getStory(storyId);
    } catch (err) {
      logger.error('❌ Get story error', err);
      throw err;
    }
  }, []);

  // ============================================
  // GET STORY VIEWERS
  // ============================================

  const getStoryViewers = useCallback(async (storyId: string) => {
    try {
      return await storyService.getStoryViewers(storyId);
    } catch (err) {
      logger.error('❌ Get story viewers error', err);
      return [];
    }
  }, []);

  // ============================================
  // HAS VIEWED STORY
  // ============================================

  const hasViewedStory = useCallback(async (storyId: string) => {
    try {
      return await storyService.hasViewedStory(storyId, user?.id || '');
    } catch (err) {
      logger.error('❌ Check viewed story error', err);
      return false;
    }
  }, [user]);

  // ============================================
  // NAVIGATION
  // ============================================

  const openStoryViewer = useCallback((userId: string) => {
    // Find all stories from this user
    const userStories = stories.filter((s) => s.userId === userId);
    if (userStories.length === 0) return;

    // Find the index of the first unseen story
    const firstUnseenIndex = userStories.findIndex((s) => !s.hasViewed);
    const index = firstUnseenIndex >= 0 ? firstUnseenIndex : 0;

    setViewerIndex(index);
    setIsViewerOpen(true);
    
    // Set current story
    if (userStories[index]) {
      setCurrentStory(userStories[index]);
    }
  }, [stories, setCurrentStory]);

  const closeStoryViewer = useCallback(() => {
    setIsViewerOpen(false);
    setCurrentStory(null);
    
    // Refresh stories after viewing
    refresh();
  }, [setCurrentStory, refresh]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStories = useCallback(() => {
    setError(null);
    setIsViewerOpen(false);
    setCurrentStory(null);
  }, [setCurrentStory]);

  // ============================================
  // EFFECTS
  // ============================================

  // Initial fetch
  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchStories();
    }
  }, [autoFetch, user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoFetch || !user?.id) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [user?.id, autoFetch, refreshInterval, refresh]);

  // Subscribe to new stories via realtime
  useEffect(() => {
    if (!user?.id) return;

    const subscription = subscribe(
      `stories_${user.id}`,
      {
        table: 'stories',
        filter: { user_id: user.id },
        onInsert: (payload) => {
          addStory(payload);
          trackEvent('story_received', { storyId: payload.id });
        },
      }
    );

    return () => {
      if (subscription) {
        unsubscribe(subscription.id);
      }
    };
  }, [user?.id, subscribe, addStory, trackEvent]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    stories,
    myStories,
    currentStory,
    
    // Loading states
    isLoading,
    isRefreshing,
    isCreating,
    
    // Error states
    error,
    
    // Actions
    fetchStories,
    refresh,
    createStory,
    deleteStory,
    viewStory,
    getStory,
    getStoryViewers,
    hasViewedStory,
    
    // Navigation
    openStoryViewer,
    closeStoryViewer,
    
    // Utility
    clearError,
    reset: resetStories,
  };
};

export default useStories;