/**
 * KONEX Notification Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for notification state management
 * 
 * Usage:
 * const { notifications, unreadCount, addNotification } = useNotificationStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'follow' | 'squad_invite' | 'squad_join_request' | 'squad_approved' | 'squad_denied' | 'mention' | 'reply' | 'like' | 'comment' | 'share' | 'badge_earned' | 'tournament_reminder' | 'tournament_start' | 'system';
  title: string;
  body: string;
  data: Record<string, any> | null;
  isRead: boolean;
  isActionable: boolean;
  actionData: Record<string, any> | null;
  createdAt: string;
  readAt: string | null;
  actorId?: string;
  actorGamerTag?: string;
  actorAvatarUrl?: string | null;
}

export interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<NotificationState, 
  'setNotifications' | 'addNotification' | 'markAsRead' | 'markAllAsRead' | 
  'removeNotification' | 'clearAll' | 'setLoading' | 'setRefreshing' | 
  'setError' | 'reset'
> = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

// ============================================
// 3. STORE
// ============================================

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // NOTIFICATION ACTIONS
      // ============================================

      setNotifications: (notifications: Notification[]) => {
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        set({ notifications, unreadCount });
        if (__DEV__) {
          console.log(`🔔 Notifications updated: ${notifications.length}, unread: ${unreadCount}`);
        }
      },

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
        }));
        if (__DEV__) {
          console.log(`🔔 Notification added: ${notification.id}`);
        }
      },

      markAsRead: (notificationId: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId);
          if (!notification || notification.isRead) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
        if (__DEV__) {
          console.log(`🔔 Notification marked as read: ${notificationId}`);
        }
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
          unreadCount: 0,
        }));
        if (__DEV__) {
          console.log('🔔 All notifications marked as read');
        }
      },

      removeNotification: (notificationId: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId);
          return {
            notifications: state.notifications.filter((n) => n.id !== notificationId),
            unreadCount: notification && !notification.isRead 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        });
        if (__DEV__) {
          console.log(`🔔 Notification removed: ${notificationId}`);
        }
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
        if (__DEV__) {
          console.log('🧹 All notifications cleared');
        }
      },

      // ============================================
      // LOADING STATES
      // ============================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setRefreshing: (isRefreshing: boolean) => {
        set({ isRefreshing });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Notification store error:', error);
        }
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Notification store reset');
        }
      },
    }),
    {
      name: '@konex/notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectNotifications = (state: NotificationState) => state.notifications;
export const selectUnreadCount = (state: NotificationState) => state.unreadCount;
export const selectIsLoading = (state: NotificationState) => state.isLoading;
export const selectIsRefreshing = (state: NotificationState) => state.isRefreshing;
export const selectError = (state: NotificationState) => state.error;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useNotificationStore;