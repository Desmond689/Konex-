// src/api/services/analytics.service.ts
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IAnalyticsService {
  trackEvent(userId: string, event: string, properties?: Record<string, any>): Promise<void>;
  trackScreenView(userId: string, screenName: string): Promise<void>;
  trackPostView(userId: string, postId: string): Promise<void>;
  trackPostInteraction(userId: string, postId: string, interactionType: string): Promise<void>;
  trackSquadView(userId: string, squadId: string): Promise<void>;
  trackSearch(userId: string, query: string): Promise<void>;
  getUserStats(userId: string): Promise<any>;
  getCommunityStats(communityId: string): Promise<any>;
  getPostStats(postId: string): Promise<any>;
  getSquadStats(squadId: string): Promise<any>;
}

class AnalyticsService implements IAnalyticsService {
  async trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      logger.debug('📊 Tracking event', { userId, event, properties });

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event,
          properties: properties || {},
          timestamp: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('❌ Track event error', { error });
    }
  }

  async trackScreenView(userId: string, screenName: string): Promise<void> {
    await this.trackEvent(userId, 'screen_view', { screen_name: screenName });
  }

  async trackPostView(userId: string, postId: string): Promise<void> {
    await this.trackEvent(userId, 'post_view', { post_id: postId });

    // Increment post views
    await supabase
      .from('posts')
      .update({ views_count: supabase.sql`views_count + 1` })
      .eq('id', postId);
  }

  async trackPostInteraction(
    userId: string,
    postId: string,
    interactionType: string
  ): Promise<void> {
    await this.trackEvent(userId, 'post_interaction', {
      post_id: postId,
      interaction_type: interactionType,
    });
  }

  async trackSquadView(userId: string, squadId: string): Promise<void> {
    await this.trackEvent(userId, 'squad_view', { squad_id: squadId });
  }

  async trackSearch(userId: string, query: string): Promise<void> {
    await this.trackEvent(userId, 'search', { query });
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      logger.info('📊 Fetching user stats', { userId });

      const [
        { count: totalPosts },
        { count: totalComments },
        { count: totalLikes },
        { count: totalFollowers },
        { count: totalFollowing },
        { count: totalFriends },
        { count: totalBadges },
      ] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', userId),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
        supabase.from('friends').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      return {
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalLikes: totalLikes || 0,
        totalFollowers: totalFollowers || 0,
        totalFollowing: totalFollowing || 0,
        totalFriends: totalFriends || 0,
        totalBadges: totalBadges || 0,
      };
    } catch (error) {
      logger.error('❌ Get user stats error', { error });
      return {
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        totalFriends: 0,
        totalBadges: 0,
      };
    }
  }

  async getCommunityStats(communityId: string): Promise<any> {
    try {
      logger.info('📊 Fetching community stats', { communityId });

      const [
        { count: totalMembers },
        { count: totalPosts },
        { count: totalSquads },
        { count: totalTournaments },
        { count: activeUsers },
      ] = await Promise.all([
        supabase.from('community_memberships').select('id', { count: 'exact', head: true }).eq('community_id', communityId),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('community_id', communityId),
        supabase.from('squads').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('status', 'active'),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }).eq('community_id', communityId),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('online_status', 'online'),
      ]);

      return {
        totalMembers: totalMembers || 0,
        totalPosts: totalPosts || 0,
        totalSquads: totalSquads || 0,
        totalTournaments: totalTournaments || 0,
        activeUsers: activeUsers || 0,
      };
    } catch (error) {
      logger.error('❌ Get community stats error', { error });
      return {
        totalMembers: 0,
        totalPosts: 0,
        totalSquads: 0,
        totalTournaments: 0,
        activeUsers: 0,
      };
    }
  }

  async getPostStats(postId: string): Promise<any> {
    try {
      logger.info('📊 Fetching post stats', { postId });

      const { data: post } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count, saves_count, reports_count, views_count')
        .eq('id', postId)
        .single();

      if (!post) {
        return {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reports: 0,
          views: 0,
        };
      }

      return {
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
        saves: post.saves_count || 0,
        reports: post.reports_count || 0,
        views: post.views_count || 0,
      };
    } catch (error) {
      logger.error('❌ Get post stats error', { error });
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reports: 0,
        views: 0,
      };
    }
  }

  async getSquadStats(squadId: string): Promise<any> {
    try {
      logger.info('📊 Fetching squad stats', { squadId });

      const { data: squad } = await supabase
        .from('squads')
        .select('member_count, online_count, average_rating, rating_count')
        .eq('id', squadId)
        .single();

      if (!squad) {
        return {
          members: 0,
          online: 0,
          rating: 0,
          ratingCount: 0,
        };
      }

      // Get active members count
      const { count: activeMembers } = await supabase
        .from('squad_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('squad_id', squadId)
        .eq('is_active', true);

      // Get message count
      const { count: messages } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('squad_id', squadId);

      return {
        members: squad.member_count || 0,
        online: squad.online_count || 0,
        activeMembers: activeMembers || 0,
        messages: messages || 0,
        rating: squad.average_rating || 0,
        ratingCount: squad.rating_count || 0,
      };
    } catch (error) {
      logger.error('❌ Get squad stats error', { error });
      return {
        members: 0,
        online: 0,
        activeMembers: 0,
        messages: 0,
        rating: 0,
        ratingCount: 0,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;