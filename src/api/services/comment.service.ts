// src/api/services/comment.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface ICommentService {
  getComment(commentId: string): Promise<any>;
  getCommentsByPost(postId: string, limit?: number, offset?: number): Promise<any[]>;
  getReplies(commentId: string, limit?: number, offset?: number): Promise<any[]>;
  createComment(postId: string, userId: string, content: string, parentId?: string): Promise<any>;
  updateComment(commentId: string, userId: string, content: string): Promise<any>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  likeComment(commentId: string, userId: string): Promise<void>;
  unlikeComment(commentId: string, userId: string): Promise<void>;
  reportComment(commentId: string, userId: string, reason: string, details?: string): Promise<void>;
}

class CommentService implements ICommentService {
  async getComment(commentId: string): Promise<any> {
    try {
      logger.info('💬 Fetching comment', { commentId });

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          post:posts (
            id,
            title,
            author_id
          )
        `)
        .eq('id', commentId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get comment error', { error, commentId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comment fetch failed',
        'Failed to fetch comment. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getCommentsByPost(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('💬 Fetching comments for post', { postId });

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          replies:comments (
            id,
            content,
            created_at,
            author:users (
              id,
              gamer_tag,
              username,
              avatar_url
            )
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get comments by post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comments fetch failed',
        'Failed to fetch comments. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getReplies(
    commentId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('💬 Fetching replies for comment', { commentId });

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('parent_id', commentId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get replies error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Replies fetch failed',
        'Failed to fetch replies. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<any> {
    try {
      logger.info('💬 Creating comment', { postId, userId });

      if (!content || content.trim().length === 0) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Content required',
          'Please enter a comment.',
          ErrorSeverity.WARNING
        );
      }

      if (content.length > 500) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_PASSWORD,
          'Comment too long',
          'Comment must be less than 500 characters.',
          ErrorSeverity.WARNING
        );
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: userId,
          content: content.trim(),
          parent_id: parentId || null,
        })
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      await supabase
        .from('posts')
        .update({ comments_count: supabase.sql`comments_count + 1` })
        .eq('id', postId);

      logger.info('✅ Comment created', { commentId: data.id });
      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Create comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comment creation failed',
        'Failed to create comment. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<any> {
    try {
      logger.info('💬 Updating comment', { commentId, userId });

      // Check ownership
      const { data: existing } = await supabase
        .from('comments')
        .select('author_id')
        .eq('id', commentId)
        .single();

      if (!existing) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Comment not found',
          'No comment found with this ID.',
          ErrorSeverity.WARNING,
          { commentId }
        );
      }

      if (existing.author_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only edit your own comments.',
          ErrorSeverity.WARNING,
          { commentId, userId }
        );
      }

      if (!content || content.trim().length === 0) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Content required',
          'Please enter a comment.',
          ErrorSeverity.WARNING
        );
      }

      const { data, error } = await supabase
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Comment updated', { commentId });
      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Update comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comment update failed',
        'Failed to update comment. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      logger.info('💬 Deleting comment', { commentId, userId });

      const { data: comment } = await supabase
        .from('comments')
        .select('author_id, post_id')
        .eq('id', commentId)
        .single();

      if (!comment) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Comment not found',
          'No comment found with this ID.',
          ErrorSeverity.WARNING,
          { commentId }
        );
      }

      if (comment.author_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only delete your own comments.',
          ErrorSeverity.WARNING,
          { commentId, userId }
        );
      }

      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      await supabase
        .from('posts')
        .update({ comments_count: supabase.sql`comments_count - 1` })
        .eq('id', comment.post_id);

      logger.info('✅ Comment deleted', { commentId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Delete comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comment deletion failed',
        'Failed to delete comment. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    try {
      logger.info('❤️ Liking comment', { commentId, userId });

      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId,
        });

      if (error) {
        throw error;
      }

      await supabase
        .from('comments')
        .update({ likes_count: supabase.sql`likes_count + 1` })
        .eq('id', commentId);

      logger.info('✅ Comment liked', { commentId, userId });
    } catch (error) {
      logger.error('❌ Like comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Like failed',
        'Failed to like comment. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    try {
      logger.info('💔 Unliking comment', { commentId, userId });

      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      await supabase
        .from('comments')
        .update({ likes_count: supabase.sql`likes_count - 1` })
        .eq('id', commentId);

      logger.info('✅ Comment unliked', { commentId, userId });
    } catch (error) {
      logger.error('❌ Unlike comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unlike failed',
        'Failed to unlike comment. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async reportComment(
    commentId: string,
    userId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    try {
      logger.info('🚩 Reporting comment', { commentId, userId, reason });

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: userId,
          reported_comment_id: commentId,
          reason,
          details: details || null,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Comment reported', { commentId, userId });
    } catch (error) {
      logger.error('❌ Report comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report failed',
        'Failed to report comment. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const commentService = new CommentService();
export default commentService;