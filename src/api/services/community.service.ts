// src/api/services/community.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';
import { Community, CommunityInsert, CommunityUpdate } from '../types/database.types';

export interface ICommunityService {
  getCommunity(communityId: string): Promise<Community>;
  getCommunityBySlug(slug: string): Promise<Community>;
  createCommunity(data: CommunityInsert): Promise<Community>;
  updateCommunity(communityId: string, data: CommunityUpdate): Promise<Community>;
  deleteCommunity(communityId: string): Promise<void>;
  getCommunities(limit?: number, offset?: number): Promise<Community[]>;
  searchCommunities(query: string, limit?: number): Promise<Community[]>;
  joinCommunity(userId: string, communityId: string): Promise<void>;
  leaveCommunity(userId: string, communityId: string): Promise<void>;
  getCommunityMembers(communityId: string, limit?: number, offset?: number): Promise<any[]>;
  getCommunitySquads(communityId: string, limit?: number, offset?: number): Promise<any[]>;
  getCommunityPosts(communityId: string, limit?: number, offset?: number): Promise<any[]>;
}

class CommunityService implements ICommunityService {
  async getCommunity(communityId: string): Promise<Community> {
    try {
      logger.info('🌐 Fetching community', { communityId });

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Community not found',
            'No community found with this ID.',
            ErrorSeverity.WARNING,
            { communityId }
          );
        }
        throw error;
      }

      if (!data) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Community not found',
          'No community found with this ID.',
          ErrorSeverity.WARNING,
          { communityId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get community error', { error, communityId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Community fetch failed',
        'Failed to fetch community. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getCommunityBySlug(slug: string): Promise<Community> {
    try {
      logger.info('🌐 Fetching community by slug', { slug });

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Community not found',
            'No community found with this slug.',
            ErrorSeverity.WARNING,
            { slug }
          );
        }
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get community by slug error', { error, slug });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Community fetch failed',
        'Failed to fetch community. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async createCommunity(data: CommunityInsert): Promise<Community> {
    try {
      logger.info('🌐 Creating community', { name: data.name });

      const { data: community, error } = await supabase
        .from('communities')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Community created', { communityId: community.id });
      return community;
    } catch (error) {
      logger.error('❌ Create community error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Community creation failed',
        'Failed to create community. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateCommunity(communityId: string, data: CommunityUpdate): Promise<Community> {
    try {
      logger.info('🌐 Updating community', { communityId });

      const { data: community, error } = await supabase
        .from('communities')
        .update(data)
        .eq('id', communityId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Community updated', { communityId });
      return community;
    } catch (error) {
      logger.error('❌ Update community error', { error, communityId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Community update failed',
        'Failed to update community. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteCommunity(communityId: string): Promise<void> {
    try {
      logger.info('🌐 Deleting community', { communityId });

      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) {
        throw error;
      }

      logger.info('✅ Community deleted', { communityId });
    } catch (error) {
      logger.error('❌ Delete community error', { error, communityId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Community deletion failed',
        'Failed to delete community. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getCommunities(limit: number = 20, offset: number = 0): Promise<Community[]> {
    try {
      logger.info('🌐 Fetching communities', { limit, offset });

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get communities error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Communities fetch failed',
        'Failed to fetch communities. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async searchCommunities(query: string, limit: number = 20): Promise<Community[]> {
    try {
      logger.info('🔍 Searching communities', { query });

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .or(`name.ilike.%${query}%,game_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search communities error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Search failed',
        'Failed to search communities. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async joinCommunity(userId: string, communityId: string): Promise<void> {
    try {
      logger.info('🌐 Joining community', { userId, communityId });

      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: userId,
          community_id: communityId,
        });

      if (error) {
        throw error;
      }

      // Increment member count
      await supabase.rpc('increment_community_member_count', {
        community_id: communityId,
        increment_by: 1,
      });

      logger.info('✅ Joined community', { userId, communityId });
    } catch (error) {
      logger.error('❌ Join community error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Join failed',
        'Failed to join community. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    try {
      logger.info('🌐 Leaving community', { userId, communityId });

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('user_id', userId)
        .eq('community_id', communityId);

      if (error) {
        throw error;
      }

      // Decrement member count
      await supabase.rpc('increment_community_member_count', {
        community_id: communityId,
        increment_by: -1,
      });

      logger.info('✅ Left community', { userId, communityId });
    } catch (error) {
      logger.error('❌ Leave community error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Leave failed',
        'Failed to leave community. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getCommunityMembers(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🌐 Fetching community members', { communityId });

      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          id,
          role,
          joined_at,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          )
        `)
        .eq('community_id', communityId)
        .eq('is_active', true)
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get community members error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Members fetch failed',
        'Failed to fetch community members. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getCommunitySquads(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🌐 Fetching community squads', { communityId });

      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .eq('community_id', communityId)
        .eq('status', 'active')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get community squads error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squads fetch failed',
        'Failed to fetch community squads. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getCommunityPosts(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🌐 Fetching community posts', { communityId });

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
          ),
          likes_count,
          comments_count
        `)
        .eq('community_id', communityId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get community posts error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Posts fetch failed',
        'Failed to fetch community posts. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const communityService = new CommunityService();
export default communityService;