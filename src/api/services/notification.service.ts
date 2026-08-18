// src/api/services/notification.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface INotificationService {
  createNotification(data: any): Promise<any>;
  getNotifications(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string, userId: string): Promise<void>;
  getNotificationTypes(): string[];
  sendPushNotification(userId: string, notification: any): Promise<void>;
}

class NotificationService implements INotificationService {
  private notificationTypes = [
    'friend_request',
    'friend_accepted',
    'follow',
    'squad_invite',
    'squad_join_request',
    'squad_approved',
    'squad_denied',
    'mention',
    'reply',
    'like',
    'comment',
    'share',
    'badge_earned',
    'tournament_reminder',
    'tournament_start',
    'system',
  ];

  async createNotification(data: any): Promise<any> {
    try {
      logger.info('🔔 Creating notification', { userId: data.user_id });

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Notification created', { notificationId: notification.id });
      return notification;
    } catch (error) {
      logger.error('❌ Create notification error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Notification creation failed',
        'Failed to create notification. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🔔 Fetching notifications for user', { userId });

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users!actor_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          target:users!target_id (
            id,
            gamer_tag,
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get notifications error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Notifications fetch failed',
        'Failed to fetch notifications. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      logger.info('🔔 Getting unread count', { userId });

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('❌ Get unread count error', { error });
      return 0;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      logger.info('🔔 Marking notification as read', { notificationId, userId });

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ Notification marked as read', { notificationId });
    } catch (error) {
      logger.error('❌ Mark notification read error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Mark read failed',
        'Failed to mark notification as read. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      logger.info('🔔 Marking all notifications as read', { userId });

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      logger.info('✅ All notifications marked as read', { userId });
    } catch (error) {
      logger.error('❌ Mark all read error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Mark all read failed',
        'Failed to mark all notifications as read. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      logger.info('🔔 Deleting notification', { notificationId, userId });

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ Notification deleted', { notificationId });
    } catch (error) {
      logger.error('❌ Delete notification error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Delete failed',
        'Failed to delete notification. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  getNotificationTypes(): string[] {
    return this.notificationTypes;
  }

  async sendPushNotification(userId: string, notification: any): Promise<void> {
    try {
      logger.info('📲 Sending push notification', { userId });

      // This would integrate with OneSignal or FCM
      // For now, we just log it
      logger.debug('📲 Push notification payload', {
        userId,
        notification,
      });

      // In production:
      // - Get user's push tokens
      // - Send to OneSignal/FCM
      // - Handle errors
    } catch (error) {
      logger.error('❌ Send push notification error', { error });
    }
  }

  // Convenience methods for common notifications
  async sendFriendRequest(actorId: string, targetId: string): Promise<void> {
    await this.createNotification({
      user_id: targetId,
      actor_id: actorId,
      type: 'friend_request',
      title: 'Friend Request',
      body: 'sent you a friend request',
      is_actionable: true,
      action_data: { type: 'friend_request' },
    });
  }

  async sendFriendAccepted(actorId: string, targetId: string): Promise<void> {
    await this.createNotification({
      user_id: targetId,
      actor_id: actorId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      body: 'accepted your friend request',
      is_actionable: false,
    });
  }

  async sendSquadInvite(actorId: string, targetId: string, squadId: string): Promise<void> {
    await this.createNotification({
      user_id: targetId,
      actor_id: actorId,
      type: 'squad_invite',
      title: 'Squad Invite',
      body: 'invited you to join their squad',
      is_actionable: true,
      action_data: { type: 'squad_invite', squad_id: squadId },
    });
  }

  async sendLikeNotification(actorId: string, targetId: string, postId: string): Promise<void> {
    await this.createNotification({
      user_id: targetId,
      actor_id: actorId,
      type: 'like',
      title: 'New Like',
      body: 'liked your post',
      is_actionable: true,
      action_data: { type: 'post', post_id: postId },
    });
  }

  async sendCommentNotification(actorId: string, targetId: string, postId: string): Promise<void> {
    await this.createNotification({
      user_id: targetId,
      actor_id: actorId,
      type: 'comment',
      title: 'New Comment',
      body: 'commented on your post',
      is_actionable: true,
      action_data: { type: 'post', post_id: postId },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;