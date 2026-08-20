// src/api/services/friend.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IFriendService {
  sendFriendRequest(senderId: string, receiverId: string): Promise<void>;
  acceptFriendRequest(requestId: string, userId: string): Promise<void>;
  declineFriendRequest(requestId: string, userId: string): Promise<void>;
  cancelFriendRequest(requestId: string, userId: string): Promise<void>;
  getFriendRequests(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getFriends(userId: string, limit?: number, offset?: number): Promise<any[]>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  areFriends(userId1: string, userId2: string): Promise<boolean>;
  getFriendCount(userId: string): Promise<number>;
  getMutualFriends(userId1: string, userId2: string, limit?: number): Promise<any[]>;
}

class FriendService implements IFriendService {
  async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    try {
      logger.info('🤝 Sending friend request', { senderId, receiverId });

      if (senderId === receiverId) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Cannot friend self',
          'You cannot send a friend request to yourself.',
          ErrorSeverity.WARNING
        );
      }

      // Check if already friends
      const areFriends = await this.areFriends(senderId, receiverId);
      if (areFriends) {
        throw new KonexError(
          ErrorCode.DB_DUPLICATE_RECORD,
          'Already friends',
          'You are already friends with this user.',
          ErrorSeverity.WARNING
        );
      }

      // Check for existing request
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('id, status')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'pending') {
          throw new KonexError(
            ErrorCode.DB_DUPLICATE_RECORD,
            'Request pending',
            'A friend request already exists between you and this user.',
            ErrorSeverity.WARNING
          );
        }
        // If it was previously declined, delete and create new
        if (existing.status === 'declined') {
          await supabase.from('friend_requests').delete().eq('id', existing.id);
        }
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Friend request sent', { senderId, receiverId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Send friend request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Friend request failed',
        'Failed to send friend request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      logger.info('🤝 Accepting friend request', { requestId, userId });

      const { data: request } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Request not found',
          'No friend request found with this ID.',
          ErrorSeverity.WARNING,
          { requestId }
        );
      }

      if (request.receiver_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You cannot accept this friend request.',
          ErrorSeverity.WARNING,
          { requestId, userId }
        );
      }

      // Update request status
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      // Create friend relationship
      await supabase
        .from('friends')
        .insert({
          user_id: request.sender_id,
          friend_id: request.receiver_id,
        });

      await supabase
        .from('friends')
        .insert({
          user_id: request.receiver_id,
          friend_id: request.sender_id,
        });

      // Update friend counts
      await supabase
        .from('users')
        .update({ friends_count: supabase.sql`friends_count + 1` })
        .eq('id', request.sender_id);

      await supabase
        .from('users')
        .update({ friends_count: supabase.sql`friends_count + 1` })
        .eq('id', request.receiver_id);

      logger.info('✅ Friend request accepted', { requestId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Accept friend request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Accept failed',
        'Failed to accept friend request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async declineFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      logger.info('🤝 Declining friend request', { requestId, userId });

      const { data: request } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Request not found',
          'No friend request found with this ID.',
          ErrorSeverity.WARNING,
          { requestId }
        );
      }

      if (request.receiver_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You cannot decline this friend request.',
          ErrorSeverity.WARNING,
          { requestId, userId }
        );
      }

      await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      logger.info('✅ Friend request declined', { requestId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Decline friend request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Decline failed',
        'Failed to decline friend request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      logger.info('🤝 Cancelling friend request', { requestId, userId });

      const { data: request } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Request not found',
          'No friend request found with this ID.',
          ErrorSeverity.WARNING,
          { requestId }
        );
      }

      if (request.sender_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only cancel your own friend requests.',
          ErrorSeverity.WARNING,
          { requestId, userId }
        );
      }

      await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      logger.info('✅ Friend request cancelled', { requestId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Cancel friend request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Cancel failed',
        'Failed to cancel friend request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getFriendRequests(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🤝 Fetching friend requests', { userId });

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          created_at,
          sender:users!sender_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          receiver:users!receiver_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get friend requests error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Friend requests fetch failed',
        'Failed to fetch friend requests. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getFriends(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🤝 Fetching friends', { userId });

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          created_at,
          friend:users!friends_friend_id_fkey (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
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
      logger.error('❌ Get friends error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Friends fetch failed',
        'Failed to fetch friends. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      logger.info('🤝 Removing friend', { userId, friendId });

      await supabase
        .from('friends')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      await supabase
        .from('friends')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      // Update friend counts
      await supabase
        .from('users')
        .update({ friends_count: supabase.sql`friends_count - 1` })
        .eq('id', userId);

      await supabase
        .from('users')
        .update({ friends_count: supabase.sql`friends_count - 1` })
        .eq('id', friendId);

      logger.info('✅ Friend removed', { userId, friendId });
    } catch (error) {
      logger.error('❌ Remove friend error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Remove failed',
        'Failed to remove friend. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', userId1)
        .eq('friend_id', userId2)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('❌ Check friends error', { error });
      return false;
    }
  }

  async getFriendCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('friends')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('❌ Get friend count error', { error });
      return 0;
    }
  }

  async getMutualFriends(
    userId1: string,
    userId2: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      logger.info('🤝 Fetching mutual friends', { userId1, userId2 });

      const { data: friends1 } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId1);

      const { data: friends2 } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId2);

      const friendIds1 = new Set((friends1 || []).map((f: any) => f.friend_id));
      const mutualIds = (friends2 || [])
        .map((f: any) => f.friend_id)
        .filter((id: string) => friendIds1.has(id))
        .slice(0, limit);

      if (mutualIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          gamer_tag,
          username,
          avatar_url,
          online_status
        `)
        .in('id', mutualIds);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get mutual friends error', { error });
      return [];
    }
  }
}

export const friendService = new FriendService();
export default friendService;