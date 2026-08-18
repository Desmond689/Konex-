/**
 * KONEX Notification Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useNotificationStore } from './notification.store';

export type {
    Notification,
    NotificationState
} from './notification.store';

export {
    selectError, selectIsLoading,
    selectIsRefreshing, selectNotifications,
    selectUnreadCount
} from './notification.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useNotificationStore,
};