/**
 * KONEX Notification Store — server-backed only
 */
import { create } from 'zustand';
import { notificationService } from '../api/services/notification.service';
import { useAuthStore } from './authStore';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (loading: boolean) => void;
  initializeNotifications: () => Promise<void>;
  reset: () => void;
}

function mapRow(n: any): AppNotification {
  return {
    id: n.id,
    type: n.type || 'system',
    title: n.title || n.type || 'Notification',
    body: n.body || n.message || '',
    read: Boolean(n.is_read ?? n.read),
    createdAt: n.created_at || n.createdAt || new Date().toISOString(),
    data: n.data,
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      error: null,
    }),
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),
  markRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  initializeNotifications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ notifications: [], unreadCount: 0, isLoading: false, error: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const rows = await notificationService.getNotifications(userId);
      const notifications = (rows || []).map(mapRow);
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      set({
        isLoading: false,
        error: e?.userMessage || e?.message || 'Failed to load notifications',
        // Do not invent notifications
        notifications: [],
        unreadCount: 0,
      });
    }
  },
  reset: () => set({ notifications: [], unreadCount: 0, isLoading: false, error: null }),
}));

export default useNotificationStore;
