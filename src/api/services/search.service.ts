// src/api/services/search.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface ISearchService {
  search(query: string, communityId?: string, limit?: number): Promise<any>;
  searchUsers(query: string, communityId?: string, limit?: number): Promise<any[]>;
  searchSquads(query: string, communityId?: string, limit?: number): Promise<any[]>;
  searchPosts(query: string, communityId?: string, limit?: number): Promise<any[]>;
  searchCommunities(query: string, limit?: number): Promise<any[]>;
  searchHashtags(query: string, limit?: number): Promise<any[]>;
  getRecentSearches(userId: string): Promise<any[]>;
  saveSearch(userId: string, query: string): Promise<void>;
  clearRecentSearches(userId: string): Promise<void>;
}

class SearchService implements ISearchService {
  async search(
    query: string,
    communityId?: string,
    limit: number = 20
  ): Promise<any> {
    try {
      logger.info('🔍 Performing search', { query, communityId });

      if (!query || query.trim().length === 0) {
        return {
          users: [],
          squads: [],
          posts: [],
          communities: [],
          hashtags: [],
        };
      }

      const searchQuery = query.trim();

      const [users, squads, posts, communities, hashtags] = await Promise.all([
        this.searchUsers(searchQuery, communityId, limit),
        this.searchSquads(searchQuery, communityId, limit),
        this.searchPosts(searchQuery, communityId, limit),
        this.searchCommunities(searchQuery, limit),
        this.searchHashtags(searchQuery, limit),
      ]);

      return {
        users,
        squads,
        posts,
        communities,
        hashtags,
      };
    } catch (error) {
      logger.error('❌ Search error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Search failed',
        'Failed to perform search. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async searchUsers(
    query: string,
    communityId?: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('users')
        .select(`
          id,
          gamer_tag,
          username,
          avatar_url,
          online_status,
          skill_level,
          role,
          squad_id,
          squad:squads (
            id,
            name,
            icon_url
          )
        `)
        .or(`gamer_tag.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (communityId) {
        queryBuilder = queryBuilder.eq('community_id', communityId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search users error', { error });
      return [];
    }
  }

  async searchSquads(
    query: string,
    communityId?: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('squads')
        .select(`
          id,
          name,
          tag,
          description,
          icon_url,
          member_count,
          online_count,
          squad_type,
          average_rating,
          rating_count,
          community:communities (
            id,
            name,
            game_name
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tag.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(limit);

      if (communityId) {
        queryBuilder = queryBuilder.eq('community_id', communityId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search squads error', { error });
      return [];
    }
  }

  async searchPosts(
    query: string,
    communityId?: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('posts')
        .select(`
          id,
          content,
          post_type,
          media_urls,
          created_at,
          likes_count,
          comments_count,
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
        .eq('is_deleted', false)
        .limit(limit);

      if (query.trim()) {
        queryBuilder = queryBuilder.textSearch('content', query.trim());
      }

      if (communityId) {
        queryBuilder = queryBuilder.eq('community_id', communityId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search posts error', { error });
      return [];
    }
  }

  async searchCommunities(query: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          game_name,
          game_logo_url,
          cover_image_url,
          description,
          member_count,
          online_count,
          is_verified,
          is_official
        `)
        .or(`name.ilike.%${query}%,game_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search communities error', { error });
      return [];
    }
  }

  async searchHashtags(query: string, limit: number = 20): Promise<any[]> {
    try {
      // Get posts with hashtags
      const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('is_deleted', false)
        .limit(100);

      if (error) {
        throw error;
      }

      // Extract hashtags from content
      const hashtags = new Map<string, number>();
      const regex = /#([a-zA-Z0-9_]+)/g;

      (data || []).forEach((post: any) => {
        const matches = post.content?.match(regex) || [];
        matches.forEach((tag: string) => {
          const key = tag.toLowerCase();
          hashtags.set(key, (hashtags.get(key) || 0) + 1);
        });
      });

      // Filter and sort by query
      const results = Array.from(hashtags.entries())
        .filter(([tag]) => tag.includes(query.toLowerCase()))
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({
          tag,
          count,
        }));

      return results;
    } catch (error) {
      logger.error('❌ Search hashtags error', { error });
      return [];
    }
  }

  async getRecentSearches(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get recent searches error', { error });
      return [];
    }
  }

  async saveSearch(userId: string, query: string): Promise<void> {
    try {
      if (!query || query.trim().length === 0) {
        return;
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('recent_searches')
        .select('id')
        .eq('user_id', userId)
        .eq('query', query.trim())
        .maybeSingle();

      if (existing) {
        // Update timestamp
        await supabase
          .from('recent_searches')
          .update({ created_at: new Date().toISOString() })
          .eq('id', existing.id);
        return;
      }

      // Insert new search
      await supabase
        .from('recent_searches')
        .insert({
          user_id: userId,
          query: query.trim(),
        });

      // Keep only last 10
      const { data: searches } = await supabase
        .from('recent_searches')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .offset(10);

      if (searches && searches.length > 0) {
        const ids = searches.map((s: any) => s.id);
        await supabase
          .from('recent_searches')
          .delete()
          .in('id', ids);
      }

      logger.info('✅ Search saved', { userId, query });
    } catch (error) {
      logger.error('❌ Save search error', { error });
    }
  }

  async clearRecentSearches(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ Recent searches cleared', { userId });
    } catch (error) {
      logger.error('❌ Clear recent searches error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Clear failed',
        'Failed to clear recent searches. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const searchService = new SearchService();
export default searchService;