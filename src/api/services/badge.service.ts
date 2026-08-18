// src/api/services/badge.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IBadgeService {
  getBadges(): Promise<any[]>;
  getBadge(badgeId: string): Promise<any>;
  getUserBadges(userId: string): Promise<any[]>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
  removeBadge(userId: string, badgeId: string): Promise<void>;
  getFeaturedBadges(userId: string): Promise<any[]>;
  setFeaturedBadges(userId: string, badgeIds: string[]): Promise<void>;
  checkBadgeEligibility(userId: string): Promise<string[]>;
}

class BadgeService implements IBadgeService {
  private badgeDefinitions = {
    // Identity Badges
    sniper: { id: 'sniper', name: 'Sniper', category: 'identity', icon: '🎯' },
    rusher: { id: 'rusher', name: 'Rusher', category: 'identity', icon: '🏃' },
    support: { id: 'support', name: 'Support', category: 'identity', icon: '🛡️' },
    flex: { id: 'flex', name: 'Flex', category: 'identity', icon: '🔄' },

    // Activity Badges
    first_post: { id: 'first_post', name: 'First Post', category: 'activity', icon: '📝' },
    content_creator: { id: 'content_creator', name: 'Content Creator', category: 'activity', icon: '🎥' },
    engager: { id: 'engager', name: 'Engager', category: 'activity', icon: '❤️' },
    commentator: { id: 'commentator', name: 'Commentator', category: 'activity', icon: '💬' },

    // Community Badges
    team_player: { id: 'team_player', name: 'Team Player', category: 'community', icon: '🤝' },
    helpful: { id: 'helpful', name: 'Helpful', category: 'community', icon: '🌟' },
    mentor: { id: 'mentor', name: 'Mentor', category: 'community', icon: '📚' },

    // Competition Badges
    clutch_king: { id: 'clutch_king', name: 'Clutch King', category: 'competition', icon: '🏆' },
    tournament_winner: { id: 'tournament_winner', name: 'Tournament Winner', category: 'competition', icon: '🥇' },

    // Milestone Badges
    newbie: { id: 'newbie', name: 'Newbie', category: 'milestone', icon: '🌱' },
    loyal: { id: 'loyal', name: 'Loyal', category: 'milestone', icon: '🎂' },
    veteran: { id: 'veteran', name: 'Veteran', category: 'milestone', icon: '👑' },
  };

  async getBadges(): Promise<any[]> {
    try {
      logger.info('🏅 Fetching badges');

      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get badges error', { error });
      return Object.values(this.badgeDefinitions);
    }
  }

  async getBadge(badgeId: string): Promise<any> {
    try {
      logger.info('🏅 Fetching badge', { badgeId });

      // Try to get from database first
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (error) {
        // Fallback to local definition
        const badge = this.badgeDefinitions[badgeId as keyof typeof this.badgeDefinitions];
        if (!badge) {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Badge not found',
            'No badge found with this ID.',
            ErrorSeverity.WARNING,
            { badgeId }
          );
        }
        return badge;
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get badge error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Badge fetch failed',
        'Failed to fetch badge. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getUserBadges(userId: string): Promise<any[]> {
    try {
      logger.info('🏅 Fetching user badges', { userId });

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          awarded_at,
          badge:badges (*)
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get user badges error', { error });
      return [];
    }
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      logger.info('🏅 Awarding badge', { userId, badgeId });

      // Check if already awarded
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      if (existing) {
        logger.debug('Badge already awarded', { userId, badgeId });
        return;
      }

      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Badge awarded', { userId, badgeId });
    } catch (error) {
      logger.error('❌ Award badge error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Badge award failed',
        'Failed to award badge. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async removeBadge(userId: string, badgeId: string): Promise<void> {
    try {
      logger.info('🏅 Removing badge', { userId, badgeId });

      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) {
        throw error;
      }

      // Remove from featured badges if present
      const { data: user } = await supabase
        .from('users')
        .select('featured_badges')
        .eq('id', userId)
        .single();

      if (user && user.featured_badges && user.featured_badges.includes(badgeId)) {
        const updated = user.featured_badges.filter((id: string) => id !== badgeId);
        await supabase
          .from('users')
          .update({ featured_badges: updated })
          .eq('id', userId);
      }

      logger.info('✅ Badge removed', { userId, badgeId });
    } catch (error) {
      logger.error('❌ Remove badge error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Badge removal failed',
        'Failed to remove badge. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getFeaturedBadges(userId: string): Promise<any[]> {
    try {
      logger.info('🏅 Fetching featured badges', { userId });

      const { data: user } = await supabase
        .from('users')
        .select('featured_badges')
        .eq('id', userId)
        .single();

      if (!user || !user.featured_badges || user.featured_badges.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .in('id', user.featured_badges);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get featured badges error', { error });
      return [];
    }
  }

  async setFeaturedBadges(userId: string, badgeIds: string[]): Promise<void> {
    try {
      logger.info('🏅 Setting featured badges', { userId, badgeIds });

      // Validate badges belong to user
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      const validBadgeIds = (userBadges || []).map((ub: any) => ub.badge_id);

      const filteredBadgeIds = badgeIds.filter((id) => validBadgeIds.includes(id));

      const { error } = await supabase
        .from('users')
        .update({
          featured_badges: filteredBadgeIds.slice(0, 6), // Max 6 featured badges
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ Featured badges updated', { userId });
    } catch (error) {
      logger.error('❌ Set featured badges error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Featured badges update failed',
        'Failed to update featured badges. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async checkBadgeEligibility(userId: string): Promise<string[]> {
    try {
      logger.info('🏅 Checking badge eligibility', { userId });

      const eligibleBadges: string[] = [];

      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) {
        return [];
      }

      // Get user's posts count
      const { count: postCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get user's likes count
      const { count: likeCount } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get user's comments count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get user's squad count
      const { count: squadCount } = await supabase
        .from('squad_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Check each badge
      // Activity Badges
      if (postCount && postCount > 0) {
        eligibleBadges.push('first_post');
      }
      if (postCount && postCount >= 10) {
        eligibleBadges.push('content_creator');
      }
      if (likeCount && likeCount >= 100) {
        eligibleBadges.push('engager');
      }
      if (commentCount && commentCount >= 50) {
        eligibleBadges.push('commentator');
      }

      // Community Badges
      if (squadCount && squadCount >= 3) {
        eligibleBadges.push('team_player');
      }

      // Milestone Badges
      const daysActive = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysActive >= 1) {
        eligibleBadges.push('newbie');
      }
      if (daysActive >= 30) {
        eligibleBadges.push('loyal');
      }
      if (daysActive >= 365) {
        eligibleBadges.push('veteran');
      }

      return eligibleBadges;
    } catch (error) {
      logger.error('❌ Check badge eligibility error', { error });
      return [];
    }
  }
}

export const badgeService = new BadgeService();
export default badgeService;