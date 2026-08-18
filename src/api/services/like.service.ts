// src/api/services/like.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface ILikeService {
  toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  getLikeCount(postId: string): Promise<number>;
  hasLiked(postId: string, userId: string): Promise<boolean>;
  getLikesByUser(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getLikesByPost(postId: string, limit?: number, offset?: number): Promise<any[]>;
}

class LikeService implements ILikeService {
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    try {
      logger.info('🔄 Toggling like', { postId, userId });

      // Check if already liked
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      let liked: boolean;

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        liked = false;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) {
          throw error;
        }

        liked = true;
      }

      // Get updated count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) {
        throw countError;
      }

      const likeCount = count || 0;

      // Update post likes_count
      await supabase
        .from('posts')
        .update({ likes_count: likeCount })
        .eq('id', postId);

      logger.info('✅ Like toggled', { postId, userId, liked, count: likeCount });
      return { liked, count: likeCount };
    } catch (error) {
      logger.error('❌ Toggle like error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Like toggle failed',
        'Failed to toggle like. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getLikeCount(postId: string): Promise<number> {
    try {
      logger.info('📊 Getting like count', { postId });

      const { count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('❌ Get like count error', { error });
      return 0;
    }
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    try {
      logger.info('🔍 Checking if liked', { postId, userId });

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('❌ Check liked error', { error });
      return false;
    }
  }

  async getLikesByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('👤 Getting likes by user', { userId });

      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          post:posts (
            id,
            content,
            post_type,
            media_urls,
            author:users (
              id,
              gamer_tag,
              username,
              avatar_url
            )
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
      logger.error('❌ Get likes by user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Likes fetch failed',
        'Failed to fetch likes. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getLikesByPost(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('📊 Getting likes by post', { postId });

      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get likes by post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Likes fetch failed',
        'Failed to fetch likes. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  /** Convenience alias used by HomeScreen — inserts a like (no toggle) */
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      logger.info('❤️ Liking post', { postId, userId });
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        logger.info('Already liked, skipping insert', { postId, userId });
        return;
      }

      const { error } = await supabase.from('likes').insert({
        post_id: postId,
        user_id: userId,
      });
      if (error) throw error;

      const { count } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ likes_count: count || 0 })
        .eq('id', postId);

      logger.info('✅ Post liked', { postId, userId });
    } catch (error) {
      logger.error('❌ Like post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Like failed',
        'Failed to like post. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      logger.info('💔 Unliking post', { postId, userId });
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;

      const { count } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ likes_count: count || 0 })
        .eq('id', postId);

      logger.info('✅ Post unliked', { postId, userId });
    } catch (error) {
      logger.error('❌ Unlike post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unlike failed',
        'Failed to unlike post. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

}

export const likeService = new LikeService();
export default likeService;