// @ts-nocheck
/**
 * KONEX useNotification Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides notification functionality
 * 
 * Usage:
 * const { notifications, unreadCount, markAsRead } = useNotification();
 */

import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../../../api/services/notification.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRealtime } from '../../../hooks/useRealtime';
import { useNotificationStore } from '../../../store/notificationStore';
import { useUIStore } from '../../../store/uiStore';

// ============================================
// 1. TYPES
// ============================================

export interface UseNotificationOptions {
  autoFetch?: boolean;
  initialLimit?: number;
}

export interface UseNotificationReturn {
  // Data
  notifications: any[];
  unreadCount: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error states
  error: Error | null;
  
  // Fetch functions
  fetchNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useNotification = (options: UseNotificationOptions = {}): UseNotificationReturn => {
  const {
    autoFetch = true,
    initialLimit = 20,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { subscribe, unsubscribe } = useRealtime();
  
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
    removeNotification,
    clearAll: clearAllStore,
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================

  const fetchNotifications = useCallback(async (reset: boolean = false) => {
    if (!user?.id) return;

    try {
      if (reset) {
        setIsLoading(true);
        setPage(0);
      }
      setError(null);

      const result = await notificationService.getNotifications(
        user.id,
        initialLimit,
        reset ? 0 : page * initialLimit
      );

      const notificationsData = result || [];
      const hasMoreData = notificationsData.length >= initialLimit;

      if (reset || page === 0) {
        setNotifications(notificationsData);
        setPage(1);
      } else {
        setNotifications([...notifications, ...notificationsData]);
        setPage(page + 1);
      }
      setHasMore(hasMoreData);

      trackEvent('notifications_view', { count: notificationsData.length });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch notifications error', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user, notifications, page, initialLimit, setNotifications, trackEvent]);

  // ============================================
  // LOAD MORE / REFRESH
  // ============================================

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    await fetchNotifications(false);
  }, [isLoadingMore, hasMore, isLoading, fetchNotifications]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications(true);
    setIsRefreshing(false);
  }, [fetchNotifications]);

  // ============================================
  // MARK AS READ
  // ============================================

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await notificationService.markAsRead(notificationId, user?.id || '');
      markAsReadStore(notificationId);
      
      trackEvent('notification_mark_read', { notificationId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Mark notification read error', error);
      showToast('Failed to mark notification as read', 'error');
      throw error;
    }
  }, [user, markAsReadStore, trackEvent, showToast]);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await notificationService.markAllAsRead(user?.id || '');
      markAllAsReadStore();
      
      trackEvent('notifications_mark_all_read', { count: unreadCount });
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Mark all notifications read error', error);
      showToast('Failed to mark all as read', 'error');
      throw error;
    }
  }, [user, markAllAsReadStore, unreadCount, trackEvent, showToast]);

  // ============================================
  // DELETE / CLEAR
  // ============================================

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await notificationService.deleteNotification(notificationId, user?.id || '');
      removeNotification(notificationId);
      
      trackEvent('notification_delete', { notificationId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete notification error', error);
      showToast('Failed to delete notification', 'error');
      throw error;
    }
  }, [user, removeNotification, trackEvent, showToast]);

  const clearAll = useCallback(async () => {
    try {
      clearAllStore();
      trackEvent('notifications_clear_all');
      showToast('All notifications cleared', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Clear notifications error', error);
      showToast('Failed to clear notifications', 'error');
      throw error;
    }
  }, [clearAllStore, trackEvent, showToast]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setIsRefreshing(false);
    setIsLoadingMore(false);
  }, []);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!user?.id) return;

    const subscription = subscribe(
      `notifications_${user.id}`,
      {
        table: 'notifications',
        filter: { user_id: user.id },
        onInsert: (payload) => {
          addNotification(payload);
          trackEvent('notification_received', { type: payload.type });
          showToast(payload.title || 'New notification', 'info');
        },
      }
    );

    setRealtimeSubscription(subscription);

    return () => {
      if (subscription) {
        unsubscribe(subscription.id);
      }
    };
  }, [user?.id, subscribe, unsubscribe, addNotification, trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchNotifications(true);
    }
  }, [autoFetch, user?.id]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    notifications,
    unreadCount,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error states
    error,
    
    // Fetch functions
    fetchNotifications: () => fetchNotifications(true),
    loadMore,
    refresh,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    
    // Utility
    clearError,
    reset: resetState,
  };
};

export default useNotification;