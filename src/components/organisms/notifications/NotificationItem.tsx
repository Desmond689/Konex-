/**
 * KONEX NotificationItem Component
 * Billion Dollar Code - Production Ready
 * 
 * A single notification item with actions
 * 
 * Usage:
 * <NotificationItem
 *   notification={notification}
 *   onPress={handlePress}
 *   onAction={handleAction}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';

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
  actorId?: string;
  actorGamerTag?: string;
  actorAvatarUrl?: string | null;
  readAt?: string | null;
}

export interface NotificationItemProps {
  /** Notification data */
  notification: Notification;
  /** On press handler */
  onPress: (notification: Notification) => void;
  /** On action handler */
  onAction?: (notification: Notification, action: string) => void;
  /** On actor press handler */
  onActorPress?: (userId: string) => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onAction,
  onActorPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'friend_request':
        return 'user-plus';
      case 'friend_accepted':
        return 'user-check';
      case 'follow':
        return 'user';
      case 'squad_invite':
        return 'users';
      case 'squad_join_request':
        return 'user-plus';
      case 'squad_approved':
        return 'check-circle';
      case 'squad_denied':
        return 'x-circle';
      case 'mention':
        return 'at-sign';
      case 'reply':
        return 'message-circle';
      case 'like':
        return 'heart';
      case 'comment':
        return 'message-square';
      case 'share':
        return 'share-2';
      case 'badge_earned':
        return 'award';
      case 'tournament_reminder':
        return 'calendar';
      case 'tournament_start':
        return 'play-circle';
      case 'system':
        return 'bell';
      default:
        return 'bell';
    }
  };

  const getIconColor = (type: Notification['type']): string => {
    switch (type) {
      case 'friend_request':
        return colors.primary;
      case 'friend_accepted':
        return colors.success;
      case 'follow':
        return colors.info;
      case 'squad_invite':
        return colors.primary;
      case 'squad_approved':
        return colors.success;
      case 'squad_denied':
        return colors.error;
      case 'mention':
        return colors.warning;
      case 'like':
        return colors.error;
      case 'badge_earned':
        return colors.success;
      case 'tournament_start':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getActionButtons = (): { label: string; action: string; variant: 'primary' | 'success' | 'danger' | 'outline' }[] => {
    if (!notification.isActionable || !notification.actionData) return [];

    switch (notification.type) {
      case 'friend_request':
        return [
          { label: 'Accept', action: 'accept', variant: 'success' },
          { label: 'Decline', action: 'decline', variant: 'outline' },
        ];
      case 'squad_invite':
        return [
          { label: 'Join', action: 'join', variant: 'primary' },
          { label: 'Decline', action: 'decline', variant: 'outline' },
        ];
      case 'squad_join_request':
        return [
          { label: 'Approve', action: 'approve', variant: 'success' },
          { label: 'Deny', action: 'deny', variant: 'outline' },
        ];
      default:
        return [];
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: notification.isRead ? colors.surface : colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    opacity: notification.isRead ? 0.8 : 1,
    ...style,
  };

  const avatarContainerStyle: ViewStyle = {
    marginRight: 12,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
  };

  const titleStyle: TextStyle = {
    fontSize: 14,
    fontWeight: notification.isRead ? '500' : '600',
    color: colors.text,
  };

  const bodyStyle: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  };

  const timeStyle: TextStyle = {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  };

  const actionButtons = getActionButtons();

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      testID={testID}
      disabled={notification.isRead}
    >
      {notification.actorId && notification.actorGamerTag ? (
        <TouchableOpacity
          style={avatarContainerStyle}
          onPress={() => onActorPress?.(notification.actorId!)}
        >
          <Avatar
            source={notification.actorAvatarUrl ? { uri: notification.actorAvatarUrl } : undefined}
            name={notification.actorGamerTag}
            size="md"
          />
        </TouchableOpacity>
      ) : (
        <View style={avatarContainerStyle}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: getIconColor(notification.type) + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name={getIcon(notification.type)}
              size={20}
              color={getIconColor(notification.type)}
            />
          </View>
        </View>
      )}

      <View style={contentStyle}>
        <Text style={titleStyle}>{notification.title}</Text>
        <Text style={bodyStyle}>{notification.body}</Text>
        <Text style={timeStyle}>
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          {notification.readAt && (
            <Text style={{ color: colors.textMuted, marginLeft: 4 }}>
              • Read
            </Text>
          )}
        </Text>

        {actionButtons.length > 0 && onAction && (
          <View style={actionsStyle}>
            {actionButtons.map((btn) => (
              <Button
                key={btn.action}
                title={btn.label}
                variant={btn.variant}
                size="xs"
                onPress={() => onAction(notification, btn.action)}
              />
            ))}
          </View>
        )}
      </View>

      {!notification.isRead && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            marginLeft: 8,
            marginTop: 4,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

export default NotificationItem;