// @ts-nocheck
/**
 * KONEX useStories Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides stories management
 * 
 * Usage:
 * const { stories, createStory, viewStory } = useStories();
 */

import { useCallback, useEffect, useState } from 'react';
import { storyService } from '../api/services/story.service';
import { logger } from '../core/logger/logger.service';
import { useStoryStore } from '../store/storyStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseStoriesOptions {
  autoFetch?: boolean;
}

export interface UseStoriesReturn {
  stories: any[];
  myStories: any[];
  currentStory: any | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  fetchStories: () => Promise<void>;
  refresh: () => Promise<void>;
  createStory: (mediaUri: string, type: 'image' | 'video', text?: string) => Promise<any>;
  deleteStory: (storyId: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  getStory: (storyId: string) => Promise<any>;
  getStoryViewers: (storyId: string) => Promise<any[]>;
  hasViewedStory: (storyId: string) => Promise<boolean>;
}

export const useStories = (options: UseStoriesOptions = {}): UseStoriesReturn => {
  const { autoFetch = true } = options;
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
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
  const [error, setError] = useState<Error | null>(null);

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
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Refresh stories error', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, setStories, setMyStories]);

  // ============================================
  // CREATE STORY
  // ============================================

  const createStory = useCallback(async (mediaUri: string, type: 'image' | 'video', text?: string) => {
    try {
      // Upload media
      const mediaUrl = await storyService.uploadStoryMedia(mediaUri, user?.id || '', type);
      
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

      showToast('Story posted!', 'success');
      return newStory;
    } catch (err) {
      logger.error('❌ Create story error', err);
      showToast('Failed to create story', 'error');
      throw err;
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
      logger.error('❌ Delete story error', err);
      showToast('Failed to delete story', 'error');
      throw err;
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
      throw err;
    }
  }, [user, markViewed, trackEvent]);

  // ============================================
  // GET SINGLE STORY
  // ============================================

  const getStory = useCallback(async (storyId: string) => {
    try {
      const result = await storyService.getStory(storyId);
      setCurrentStory(result);
      return result;
    } catch (err) {
      logger.error('❌ Get story error', err);
      throw err;
    }
  }, [setCurrentStory]);

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
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchStories();
    }
  }, [user?.id, autoFetch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoFetch || !user?.id) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, autoFetch, refresh]);

  return {
    stories,
    myStories,
    currentStory,
    isLoading,
    isRefreshing,
    error,
    fetchStories,
    refresh,
    createStory,
    deleteStory,
    viewStory,
    getStory,
    getStoryViewers,
    hasViewedStory,
  };
};

export default useStories;