// src/api/services/story.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IStoryService {
  createStory(userId: string, mediaUrl: string, type: 'image' | 'video', text?: string): Promise<any>;
  getStories(userId: string): Promise<any[]>;
  getStory(storyId: string): Promise<any>;
  deleteStory(storyId: string, userId: string): Promise<void>;
  viewStory(storyId: string, userId: string): Promise<void>;
  getStoryViewers(storyId: string, limit?: number, offset?: number): Promise<any[]>;
  hasViewedStory(storyId: string, userId: string): Promise<boolean>;
  getActiveStories(): Promise<any[]>;
}

class StoryService implements IStoryService {
  async createStory(
    userId: string,
    mediaUrl: string,
    type: 'image' | 'video',
    text?: string
  ): Promise<any> {
    try {
      logger.info('📸 Creating story', { userId });

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          media_url: mediaUrl,
          type,
          text: text || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select(`
          *,
          user:users (
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

      logger.info('✅ Story created', { storyId: data.id });
      return data;
    } catch (error) {
      logger.error('❌ Create story error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Story creation failed',
        'Failed to create story. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getStories(userId: string): Promise<any[]> {
    try {
      logger.info('📸 Fetching stories for user', { userId });

      // Get friends and following
      const { data: friends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const friendIds = friends?.map((f: any) => f.friend_id) || [];
      const followingIds = following?.map((f: any) => f.following_id) || [];

      // Combine and deduplicate
      const userIds = [...new Set([...friendIds, ...followingIds, userId])];

      if (userIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          views:story_views (count)
        `)
        .in('user_id', userIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Check if user has viewed each story
      const storiesWithViewStatus = await Promise.all(
        (data || []).map(async (story: any) => {
          const { data: viewData } = await supabase
            .from('story_views')
            .select('id')
            .eq('story_id', story.id)
            .eq('user_id', userId)
            .maybeSingle();

          return {
            ...story,
            hasViewed: !!viewData,
          };
        })
      );

      // Sort: unseen first, then by time
      return storiesWithViewStatus.sort((a, b) => {
        if (a.hasViewed !== b.hasViewed) {
          return a.hasViewed ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } catch (error) {
      logger.error('❌ Get stories error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Stories fetch failed',
        'Failed to fetch stories. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getStory(storyId: string): Promise<any> {
    try {
      logger.info('📸 Fetching story', { storyId });

      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          views:story_views (
            id,
            viewed_at,
            user:users (
              id,
              gamer_tag,
              username,
              avatar_url
            )
          )
        `)
        .eq('id', storyId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get story error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Story fetch failed',
        'Failed to fetch story. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      logger.info('📸 Deleting story', { storyId, userId });

      const { data: story } = await supabase
        .from('stories')
        .select('user_id')
        .eq('id', storyId)
        .single();

      if (!story) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Story not found',
          'No story found with this ID.',
          ErrorSeverity.WARNING,
          { storyId }
        );
      }

      if (story.user_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only delete your own stories.',
          ErrorSeverity.WARNING,
          { storyId, userId }
        );
      }

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) {
        throw error;
      }

      logger.info('✅ Story deleted', { storyId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Delete story error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Story deletion failed',
        'Failed to delete story. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async viewStory(storyId: string, userId: string): Promise<void> {
    try {
      logger.info('👀 Viewing story', { storyId, userId });

      // Check if already viewed
      const { data: existing } = await supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        logger.debug('Story already viewed', { storyId, userId });
        return;
      }

      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: userId,
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Story viewed', { storyId, userId });
    } catch (error) {
      logger.error('❌ View story error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'View failed',
        'Failed to view story. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getStoryViewers(
    storyId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('👀 Fetching story viewers', { storyId });

      const { data, error } = await supabase
        .from('story_views')
        .select(`
          id,
          viewed_at,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get story viewers error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Viewers fetch failed',
        'Failed to fetch story viewers. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async hasViewedStory(storyId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('❌ Check viewed error', { error });
      return false;
    }
  }

  async getActiveStories(): Promise<any[]> {
    try {
      logger.info('📸 Fetching active stories');

      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get active stories error', { error });
      return [];
    }
  }
}

export const storyService = new StoryService();
export default storyService;