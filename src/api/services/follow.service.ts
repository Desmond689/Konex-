// src/api/services/follow.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IFollowService {
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getFollowing(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getFollowCounts(userId: string): Promise<{ followers: number; following: number }>;
}

class FollowService implements IFollowService {
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      logger.info('👤 Following user', { followerId, followingId });

      if (followerId === followingId) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Cannot follow self',
          'You cannot follow yourself.',
          ErrorSeverity.WARNING
        );
      }

      // Check if already following
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (existing) {
        logger.debug('Already following', { followerId, followingId });
        return;
      }

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (error) {
        throw error;
      }

      // Update counts
      await supabase
        .from('users')
        .update({ following_count: supabase.sql`following_count + 1` })
        .eq('id', followerId);

      await supabase
        .from('users')
        .update({ followers_count: supabase.sql`followers_count + 1` })
        .eq('id', followingId);

      logger.info('✅ User followed', { followerId, followingId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Follow user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Follow failed',
        'Failed to follow user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      logger.info('👤 Unfollowing user', { followerId, followingId });

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        throw error;
      }

      // Update counts
      await supabase
        .from('users')
        .update({ following_count: supabase.sql`following_count - 1` })
        .eq('id', followerId);

      await supabase
        .from('users')
        .update({ followers_count: supabase.sql`followers_count - 1` })
        .eq('id', followingId);

      logger.info('✅ User unfollowed', { followerId, followingId });
    } catch (error) {
      logger.error('❌ Unfollow user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unfollow failed',
        'Failed to unfollow user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('❌ Check following error', { error });
      return false;
    }
  }

  async getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('👤 Fetching followers', { userId });

      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower:users!follows_follower_id_fkey (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get followers error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Followers fetch failed',
        'Failed to fetch followers. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('👤 Fetching following', { userId });

      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          following:users!follows_following_id_fkey (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get following error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Following fetch failed',
        'Failed to fetch following. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    try {
      logger.info('👤 Fetching follow counts', { userId });

      const { data, error } = await supabase
        .from('users')
        .select('followers_count, following_count')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        followers: data?.followers_count || 0,
        following: data?.following_count || 0,
      };
    } catch (error) {
      logger.error('❌ Get follow counts error', { error });
      return { followers: 0, following: 0 };
    }
  }
}

export const followService = new FollowService();
export default followService;