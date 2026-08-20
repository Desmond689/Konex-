/**
 * KONEX NotificationList Component
 * Billion Dollar Code - Production Ready
 * 
 * A list of notifications with grouping and actions
 * 
 * Usage:
 * <NotificationList
 *   notifications={notifications}
 *   onMarkAsRead={handleMarkAsRead}
 *   onMarkAllAsRead={handleMarkAllAsRead}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import EmptyState from '../../molecules/EmptyState';
import NotificationFilter, { NotificationFilterType } from './NotificationFilter';
import NotificationItem, { Notification } from './NotificationItem';

// ============================================
// 1. TYPES
// ============================================

export interface NotificationListProps {
  /** List of notifications */
  notifications: Notification[];
  /** On notification press handler */
  onNotificationPress: (notification: Notification) => void;
  /** On mark as read handler */
  onMarkAsRead: (notificationId: string) => Promise<void>;
  /** On mark all as read handler */
  onMarkAllAsRead: () => Promise<void>;
  /** On action handler */
  onAction?: (notification: Notification, action: string) => Promise<void>;
  /** On actor press handler */
  onActorPress?: (userId: string) => void;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** Is loading */
  loading?: boolean;
  /** Has more data */
  hasMore?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead,
  onAction,
  onActorPress,
  onLoadMore,
  loading = false,
  hasMore = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const getFilteredNotifications = (): Notification[] => {
    if (activeFilter === 'all') return notifications;

    const typeMap: Record<NotificationFilterType, Notification['type'][]> = {
      all: [],
      social: ['friend_request', 'friend_accepted', 'follow'],
      squad: ['squad_invite', 'squad_join_request', 'squad_approved', 'squad_denied'],
      content: ['mention', 'reply', 'like', 'comment', 'share'],
      achievement: ['badge_earned'],
      system: ['tournament_reminder', 'tournament_start', 'system'],
    };

    const types = typeMap[activeFilter] || [];
    return notifications.filter((n) => types.includes(n.type));
  };

  const getCounts = (): Record<NotificationFilterType, number> => {
    const counts: Record<NotificationFilterType, number> = {
      all: notifications.length,
      social: 0,
      squad: 0,
      content: 0,
      achievement: 0,
      system: 0,
    };

    notifications.forEach((n) => {
      if (['friend_request', 'friend_accepted', 'follow'].includes(n.type)) {
        counts.social++;
      } else if (['squad_invite', 'squad_join_request', 'squad_approved', 'squad_denied'].includes(n.type)) {
        counts.squad++;
      } else if (['mention', 'reply', 'like', 'comment', 'share'].includes(n.type)) {
        counts.content++;
      } else if (n.type === 'badge_earned') {
        counts.achievement++;
      } else {
        counts.system++;
      }
    });

    return counts;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await onMarkAsRead(notificationId);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (unreadCount === 0) {
      Alert.alert('Info', 'No unread notifications');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          style: 'default',
          onPress: async () => {
            try {
              await onMarkAllAsRead();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          },
        },
      ]
    );
  };

  const handleAction = async (notification: Notification, action: string) => {
    if (onAction) {
      try {
        await onAction(notification, action);
      } catch (error) {
        Alert.alert('Error', 'Failed to perform action');
      }
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !onLoadMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const counts = getCounts();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={containerStyle} testID={testID}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>
          Notifications
          {unreadCount > 0 && (
            <Text style={{ fontSize: 14, fontWeight: '400', color: colors.textMuted }}>
              {' '}({unreadCount} unread)
            </Text>
          )}
        </Text>
        {unreadCount > 0 && (
          <Button
            title="Mark All Read"
            variant="ghost"
            size="sm"
            onPress={handleMarkAllAsRead}
          />
        )}
      </View>

      <NotificationFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description={
            activeFilter === 'all'
              ? "You're all caught up!"
              : 'No notifications in this category'
          }
          icon="🔔"
          style={{ padding: 40 }}
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={onNotificationPress}
              onAction={handleAction}
              onActorPress={onActorPress}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Loading...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default NotificationList;