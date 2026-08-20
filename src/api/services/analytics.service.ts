/**
 * KONEX Analytics Service
 * Billion Dollar Code - Production Ready
 * 
 * Analytics service for tracking events, views, and interactions
 * 
 * Usage:
 * import { analyticsService } from '@api/services/analytics.service';
 */

import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

// ============================================
// 1. TYPES
// ============================================

export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  totalFriends: number;
  totalBadges: number;
}

export interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  totalSquads: number;
  totalTournaments: number;
  activeUsers: number;
}

export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reports: number;
  views: number;
}

export interface SquadStats {
  members: number;
  online: number;
  activeMembers: number;
  messages: number;
  rating: number;
  ratingCount: number;
}

export interface AnalyticsEvent {
  id?: string;
  user_id: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

// ============================================
// 2. INTERFACE
// ============================================

export interface IAnalyticsService {
  trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void>;

  trackScreenView(
    userId: string,
    screenName: string
  ): Promise<void>;

  trackPostView(
    userId: string,
    postId: string
  ): Promise<void>;

  trackPostInteraction(
    userId: string,
    postId: string,
    interactionType: string
  ): Promise<void>;

  trackSquadView(
    userId: string,
    squadId: string
  ): Promise<void>;

  trackSearch(
    userId: string,
    query: string
  ): Promise<void>;

  getUserStats(
    userId: string
  ): Promise<UserStats>;

  getCommunityStats(
    communityId: string
  ): Promise<CommunityStats>;

  getPostStats(
    postId: string
  ): Promise<PostStats>;

  getSquadStats(
    squadId: string
  ): Promise<SquadStats>;
}

// ============================================
// 3. SERVICE IMPLEMENTATION
// ============================================

class AnalyticsService implements IAnalyticsService {
  // ============================================
  // TRACK EVENT
  // ============================================

  async trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      logger.debug('📊 Tracking event', {
        userId,
        event,
        properties,
      });

      const db = supabase as any;

      const { error } = await db
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
      // Analytics should never break the main app flow.
      logger.error('❌ Track event error', { error });
    }
  }

  // ============================================
  // TRACK SCREEN VIEW
  // ============================================

  async trackScreenView(
    userId: string,
    screenName: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'screen_view',
      {
        screen_name: screenName,
      }
    );
  }

  // ============================================
  // TRACK POST VIEW
  // ============================================

  async trackPostView(
    userId: string,
    postId: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'post_view',
      {
        post_id: postId,
      }
    );

    try {
      const db = supabase as any;

      // Get current view count
      const { data: post, error: fetchError } = await db
        .from('posts')
        .select('views_count')
        .eq('id', postId)
        .single();

      if (fetchError) {
        logger.error('❌ Failed to fetch post view count', {
          error: fetchError,
          postId,
        });
        return;
      }

      const currentViews = typeof post?.views_count === 'number' ? post.views_count : 0;

      // Update view count
      const { error: updateError } = await db
        .from('posts')
        .update({
          views_count: currentViews + 1,
        })
        .eq('id', postId);

      if (updateError) {
        logger.error('❌ Failed to increment post views', {
          error: updateError,
          postId,
        });
      }
    } catch (error) {
      logger.error('❌ Track post view error', {
        error,
        postId,
      });
    }
  }

  // ============================================
  // TRACK POST INTERACTION
  // ============================================

  async trackPostInteraction(
    userId: string,
    postId: string,
    interactionType: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'post_interaction',
      {
        post_id: postId,
        interaction_type: interactionType,
      }
    );
  }

  // ============================================
  // TRACK SQUAD VIEW
  // ============================================

  async trackSquadView(
    userId: string,
    squadId: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'squad_view',
      {
        squad_id: squadId,
      }
    );
  }

  // ============================================
  // TRACK SEARCH
  // ============================================

  async trackSearch(
    userId: string,
    query: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'search',
      {
        query,
      }
    );
  }

  // ============================================
  // USER STATS
  // ============================================

  async getUserStats(userId: string): Promise<UserStats> {
    const emptyStats: UserStats = {
      totalPosts: 0,
      totalComments: 0,
      totalLikes: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      totalFriends: 0,
      totalBadges: 0,
    };

    try {
      logger.info('📊 Fetching user stats', { userId });

      const db = supabase as any;

      const [
        postsResult,
        commentsResult,
        likesResult,
        followersResult,
        followingResult,
        friendsResult,
        badgesResult,
      ] = await Promise.all([
        db
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId),

        db
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId),

        db
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),

        db
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),

        db
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),

        db
          .from('friends')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),

        db
          .from('user_badges')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      return {
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalLikes: likesResult.count || 0,
        totalFollowers: followersResult.count || 0,
        totalFollowing: followingResult.count || 0,
        totalFriends: friendsResult.count || 0,
        totalBadges: badgesResult.count || 0,
      };
    } catch (error) {
      logger.error('❌ Get user stats error', { error, userId });
      return emptyStats;
    }
  }

  // ============================================
  // COMMUNITY STATS
  // ============================================

  async getCommunityStats(communityId: string): Promise<CommunityStats> {
    const emptyStats: CommunityStats = {
      totalMembers: 0,
      totalPosts: 0,
      totalSquads: 0,
      totalTournaments: 0,
      activeUsers: 0,
    };

    try {
      logger.info('📊 Fetching community stats', { communityId });

      const db = supabase as any;

      const [
        membersResult,
        postsResult,
        squadsResult,
        tournamentsResult,
        usersResult,
      ] = await Promise.all([
        db
          .from('community_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', communityId),

        db
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', communityId),

        db
          .from('squads')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .eq('status', 'active'),

        db
          .from('tournaments')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', communityId),

        db
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .eq('online_status', 'online'),
      ]);

      return {
        totalMembers: membersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalSquads: squadsResult.count || 0,
        totalTournaments: tournamentsResult.count || 0,
        activeUsers: usersResult.count || 0,
      };
    } catch (error) {
      logger.error('❌ Get community stats error', { error, communityId });
      return emptyStats;
    }
  }

  // ============================================
  // POST STATS
  // ============================================

  async getPostStats(postId: string): Promise<PostStats> {
    const emptyStats: PostStats = {
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reports: 0,
      views: 0,
    };

    try {
      logger.info('📊 Fetching post stats', { postId });

      const db = supabase as any;

      const { data: post, error } = await db
        .from('posts')
        .select('likes_count, comments_count, shares_count, saves_count, reports_count, views_count')
        .eq('id', postId)
        .single();

      if (error) {
        throw error;
      }

      if (!post) {
        return emptyStats;
      }

      return {
        likes: typeof post.likes_count === 'number' ? post.likes_count : 0,
        comments: typeof post.comments_count === 'number' ? post.comments_count : 0,
        shares: typeof post.shares_count === 'number' ? post.shares_count : 0,
        saves: typeof post.saves_count === 'number' ? post.saves_count : 0,
        reports: typeof post.reports_count === 'number' ? post.reports_count : 0,
        views: typeof post.views_count === 'number' ? post.views_count : 0,
      };
    } catch (error) {
      logger.error('❌ Get post stats error', { error, postId });
      return emptyStats;
    }
  }

  // ============================================
  // SQUAD STATS
  // ============================================

  async getSquadStats(squadId: string): Promise<SquadStats> {
    const emptyStats: SquadStats = {
      members: 0,
      online: 0,
      activeMembers: 0,
      messages: 0,
      rating: 0,
      ratingCount: 0,
    };

    try {
      logger.info('📊 Fetching squad stats', { squadId });

      const db = supabase as any;

      const { data: squad, error: squadError } = await db
        .from('squads')
        .select('member_count, online_count, average_rating, rating_count')
        .eq('id', squadId)
        .single();

      if (squadError) {
        throw squadError;
      }

      if (!squad) {
        return emptyStats;
      }

      // Get active members count
      const { count: activeMembers } = await db
        .from('squad_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('squad_id', squadId)
        .eq('is_active', true);

      // Get messages count
      const { count: messages } = await db
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('squad_id', squadId);

      return {
        members: typeof squad.member_count === 'number' ? squad.member_count : 0,
        online: typeof squad.online_count === 'number' ? squad.online_count : 0,
        activeMembers: activeMembers || 0,
        messages: messages || 0,
        rating: typeof squad.average_rating === 'number' ? squad.average_rating : 0,
        ratingCount: typeof squad.rating_count === 'number' ? squad.rating_count : 0,
      };
    } catch (error) {
      logger.error('❌ Get squad stats error', { error, squadId });
      return emptyStats;
    }
  }
}

// ============================================
// 4. EXPORT
// ============================================

export const analyticsService = new AnalyticsService();
export default analyticsService;