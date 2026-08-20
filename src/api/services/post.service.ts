// src/api/services/post.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';
import { Post, PostInsert, PostUpdate } from '../types/database.types';

export interface IPostService {
  getPost(postId: string): Promise<Post>;
  createPost(data: PostInsert): Promise<Post>;
  updatePost(postId: string, data: PostUpdate): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  getPostsByCommunity(communityId: string, limit?: number, offset?: number): Promise<Post[]>;
  getPostsBySquad(squadId: string, limit?: number, offset?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  getFeed(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  getPostLikes(postId: string, limit?: number, offset?: number): Promise<any[]>;
  getPostComments(postId: string, limit?: number, offset?: number): Promise<any[]>;
  addComment(postId: string, userId: string, content: string): Promise<any>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  savePost(postId: string, userId: string): Promise<void>;
  unsavePost(postId: string, userId: string): Promise<void>;
  reportPost(postId: string, userId: string, reason: string, details?: string): Promise<void>;
}

class PostService implements IPostService {
  async getPost(postId: string): Promise<Post> {
    try {
      logger.info('📱 Fetching post', { postId });

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Post not found',
            'No post found with this ID.',
            ErrorSeverity.WARNING,
            { postId }
          );
        }
        throw error;
      }

      if (!data) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Post not found',
          'No post found with this ID.',
          ErrorSeverity.WARNING,
          { postId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get post error', { error, postId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Post fetch failed',
        'Failed to fetch post. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async createPost(data: PostInsert | Record<string, any>): Promise<Post> {
    try {
      const author = (data as any).author || (data as any).author_id;
      logger.info('📱 Creating post', { authorId: author });

      // Align with database.types posts.Insert
      const contentRaw = (data as any).content;
      const content =
        typeof contentRaw === 'string'
          ? { text: contentRaw, type: 'text' }
          : contentRaw || { text: '', type: 'text' };

      const payload: Record<string, unknown> = {
        type: (data as any).type || 'text',
        category: (data as any).category || 'general',
        author,
        content,
        visibility: (data as any).visibility || 'public',
        status: (data as any).status || 'published',
        tags: (data as any).tags || [],
        game_tags: (data as any).game_tags || [],
        mentions: (data as any).mentions || [],
        likes: [],
        comments: [],
        shares: 0,
        saves: 0,
        reports: [],
        is_pinned: false,
        is_edited: false,
        is_featured: false,
        is_sponsored: false,
        community_id: (data as any).community_id ?? null,
        squad_id: (data as any).squad_id ?? null,
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Post created', { postId: post.id });
      return post;
    } catch (error) {
      logger.error('❌ Create post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Post creation failed',
        'Failed to create post. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updatePost(postId: string, data: PostUpdate): Promise<Post> {
    try {
      logger.info('📱 Updating post', { postId });

      const { data: post, error } = await supabase
        .from('posts')
        .update(data)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Post updated', { postId });
      return post;
    } catch (error) {
      logger.error('❌ Update post error', { error, postId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Post update failed',
        'Failed to update post. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      logger.info('📱 Deleting post', { postId });

      const { error } = await supabase
        .from('posts')
        .update({ status: 'removed' })
        .eq('id', postId);

      if (error) {
        throw error;
      }

      logger.info('✅ Post deleted', { postId });
    } catch (error) {
      logger.error('❌ Delete post error', { error, postId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Post deletion failed',
        'Failed to delete post. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getPostsByCommunity(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    try {
      logger.info('📱 Fetching posts by community', { communityId });

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          squad:squads (
            id,
            name,
            icon_url
          )
        `)
        .eq('community_id', communityId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get posts by community error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Posts fetch failed',
        'Failed to fetch posts. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getPostsBySquad(
    squadId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    try {
      logger.info('📱 Fetching posts by squad', { squadId });

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url
          )
        `)
        .eq('squad_id', squadId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get posts by squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Posts fetch failed',
        'Failed to fetch posts. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getPostsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    try {
      logger.info('📱 Fetching posts by user', { userId });

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          squad:squads (
            id,
            name,
            icon_url
          )
        `)
        .eq('author', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get posts by user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Posts fetch failed',
        'Failed to fetch posts. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getFeed(userId: string, limit: number = 15, offset: number = 0): Promise<Post[]> {
    try {
      logger.info('📱 Fetching feed for user', { userId, limit, offset });

      // Lean columns only — no comments payload, no SELECT *
      const { data, error } = await supabase
        .from('posts')
        .select(
          'id, type, category, author, content, visibility, status, likes, shares, saves, community_id, squad_id, created_at, updated_at, is_pinned, is_featured'
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get feed error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Feed fetch failed',
        'Failed to fetch feed. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      logger.info('❤️ Liking post', { postId, userId });
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();
      if (fetchErr) throw fetchErr;
      const likes: string[] = Array.isArray(post?.likes) ? [...post.likes] : [];
      if (!likes.includes(userId)) likes.push(userId);
      const { error } = await supabase.from('posts').update({ likes }).eq('id', postId);
      if (error) throw error;
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

      if (error) {
        throw error;
      }

      // Decrement likes count
      await supabase.rpc('increment_post_likes', {
        post_id: postId,
        increment_by: -1,
      });

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

  async getPostLikes(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('❤️ Fetching post likes', { postId });

      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get post likes error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Likes fetch failed',
        'Failed to fetch post likes. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getPostComments(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('💬 Fetching post comments', { postId });

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
                    author:users (
            id,
            gamer_tag,
            username,
            avatar_url
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
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get post comments error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comments fetch failed',
        'Failed to fetch post comments. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async addComment(
    postId: string,
    userId: string,
    content: string
  ): Promise<any> {
    try {
      logger.info('💬 Adding comment', { postId, userId });

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author: userId,
          content: content.trim(),
        })
        .select(`
          id,
          content,
          created_at,
                    author:users (
            id,
            gamer_tag,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Increment comments count
      await supabase.rpc('increment_post_comments', {
        post_id: postId,
        increment_by: 1,
      });

      logger.info('✅ Comment added', { commentId: data.id });
      return data;
    } catch (error) {
      logger.error('❌ Add comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Comment failed',
        'Failed to add comment. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      logger.info('💬 Deleting comment', { commentId, userId });

      // Check if user owns the comment
      const { data: comment } = await supabase
        .from('comments')
        .select('author, post_id')
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

      if (comment.author !== userId) {
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
        .update({ status: 'removed' })
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      // Decrement comments count
      await supabase.rpc('increment_post_comments', {
        post_id: comment.post_id,
        increment_by: -1,
      });

      logger.info('✅ Comment deleted', { commentId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Delete comment error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Delete failed',
        'Failed to delete comment. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async savePost(postId: string, userId: string): Promise<void> {
    try {
      logger.info('📌 Saving post', { postId, userId });

      const { error } = await supabase
        .from('saved_posts')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (error) {
        throw error;
      }

      // Increment saves count
      await supabase.rpc('increment_post_saves', {
        post_id: postId,
        increment_by: 1,
      });

      logger.info('✅ Post saved', { postId, userId });
    } catch (error) {
      logger.error('❌ Save post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Save failed',
        'Failed to save post. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unsavePost(postId: string, userId: string): Promise<void> {
    try {
      logger.info('📌 Unsaving post', { postId, userId });

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Decrement saves count
      await supabase.rpc('increment_post_saves', {
        post_id: postId,
        increment_by: -1,
      });

      logger.info('✅ Post unsaved', { postId, userId });
    } catch (error) {
      logger.error('❌ Unsave post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unsave failed',
        'Failed to unsave post. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async reportPost(
    postId: string,
    userId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    try {
      logger.info('🚩 Reporting post', { postId, userId, reason });

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: userId,
          reported_post_id: postId,
          reason,
          details: details || null,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      // Increment reports count
      await supabase.rpc('increment_post_reports', {
        post_id: postId,
        increment_by: 1,
      });

      logger.info('✅ Post reported', { postId, userId });
    } catch (error) {
      logger.error('❌ Report post error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report failed',
        'Failed to report post. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const postService = new PostService();
export default postService;