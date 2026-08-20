// src/api/services/moderation.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IModerationService {
  getModerationQueue(limit?: number, offset?: number): Promise<any[]>;
  getReport(reportId: string): Promise<any>;
  resolveReport(reportId: string, moderatorId: string, decision: string, notes?: string): Promise<void>;
  dismissReport(reportId: string, moderatorId: string, reason: string): Promise<void>;
  getUserModerationHistory(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getSquadModerationHistory(squadId: string, limit?: number, offset?: number): Promise<any[]>;
  warnUser(userId: string, moderatorId: string, reason: string): Promise<void>;
  suspendUser(userId: string, moderatorId: string, duration: number, reason: string): Promise<void>;
  banUser(userId: string, moderatorId: string, reason: string): Promise<void>;
  unbanUser(userId: string, moderatorId: string, reason: string): Promise<void>;
  getModerationStats(): Promise<any>;
}

class ModerationService implements IModerationService {
  async getModerationQueue(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('🛡️ Fetching moderation queue');

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          reported_post:posts!reported_post_id (
            id,
            content,
            post_type
          ),
          reported_comment:comments!reported_comment_id (
            id,
            content
          ),
          reported_squad:squads!reported_squad_id (
            id,
            name,
            icon_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get moderation queue error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Queue fetch failed',
        'Failed to fetch moderation queue. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getReport(reportId: string): Promise<any> {
    try {
      logger.info('🛡️ Fetching report', { reportId });

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            bio,
            created_at
          ),
          reported_post:posts!reported_post_id (
            id,
            content,
            post_type,
            media_urls,
            created_at
          ),
          reported_comment:comments!reported_comment_id (
            id,
            content,
            created_at
          ),
          reported_squad:squads!reported_squad_id (
            id,
            name,
            icon_url,
            description
          )
        `)
        .eq('id', reportId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get report error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report fetch failed',
        'Failed to fetch report. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async resolveReport(
    reportId: string,
    moderatorId: string,
    decision: string,
    notes?: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Resolving report', { reportId, moderatorId, decision });

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolution: decision,
          moderator_id: moderatorId,
          notes: notes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) {
        throw error;
      }

      logger.info('✅ Report resolved', { reportId });
    } catch (error) {
      logger.error('❌ Resolve report error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Resolve failed',
        'Failed to resolve report. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async dismissReport(
    reportId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Dismissing report', { reportId, moderatorId, reason });

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          resolution: `Dismissed: ${reason}`,
          moderator_id: moderatorId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) {
        throw error;
      }

      logger.info('✅ Report dismissed', { reportId });
    } catch (error) {
      logger.error('❌ Dismiss report error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Dismiss failed',
        'Failed to dismiss report. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getUserModerationHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🛡️ Fetching user moderation history', { userId });

      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
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
      logger.error('❌ Get user moderation history error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'History fetch failed',
        'Failed to fetch moderation history. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getSquadModerationHistory(
    squadId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🛡️ Fetching squad moderation history', { squadId });

      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .eq('squad_id', squadId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get squad moderation history error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'History fetch failed',
        'Failed to fetch moderation history. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async warnUser(
    userId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Warning user', { userId, moderatorId, reason });

      // Get current warnings
      const { data: user } = await supabase
        .from('users')
        .select('warnings_count')
        .eq('id', userId)
        .single();

      const newWarnings = (user?.warnings_count || 0) + 1;

      await supabase
        .from('users')
        .update({ warnings_count: newWarnings })
        .eq('id', userId);

      await supabase
        .from('moderation_actions')
        .insert({
          user_id: userId,
          moderator_id: moderatorId,
          action_type: 'warning',
          reason,
          details: `Warning ${newWarnings}`,
        });

      logger.info('✅ User warned', { userId, warnings: newWarnings });
    } catch (error) {
      logger.error('❌ Warn user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Warning failed',
        'Failed to warn user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async suspendUser(
    userId: string,
    moderatorId: string,
    duration: number,
    reason: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Suspending user', { userId, moderatorId, duration, reason });

      const suspensionEnd = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspension_end: suspensionEnd,
        })
        .eq('id', userId);

      await supabase
        .from('moderation_actions')
        .insert({
          user_id: userId,
          moderator_id: moderatorId,
          action_type: 'suspension',
          reason,
          details: `${duration} days`,
        });

      logger.info('✅ User suspended', { userId, duration });
    } catch (error) {
      logger.error('❌ Suspend user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Suspension failed',
        'Failed to suspend user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async banUser(
    userId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Banning user', { userId, moderatorId, reason });

      await supabase
        .from('users')
        .update({
          is_banned: true,
          ban_reason: reason,
        })
        .eq('id', userId);

      await supabase
        .from('moderation_actions')
        .insert({
          user_id: userId,
          moderator_id: moderatorId,
          action_type: 'ban',
          reason,
        });

      logger.info('✅ User banned', { userId });
    } catch (error) {
      logger.error('❌ Ban user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Ban failed',
        'Failed to ban user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unbanUser(
    userId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      logger.info('🛡️ Unbanning user', { userId, moderatorId, reason });

      await supabase
        .from('users')
        .update({
          is_banned: false,
          ban_reason: null,
        })
        .eq('id', userId);

      await supabase
        .from('moderation_actions')
        .insert({
          user_id: userId,
          moderator_id: moderatorId,
          action_type: 'unban',
          reason,
        });

      logger.info('✅ User unbanned', { userId });
    } catch (error) {
      logger.error('❌ Unban user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unban failed',
        'Failed to unban user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getModerationStats(): Promise<any> {
    try {
      logger.info('🛡️ Fetching moderation stats');

      const [
        { count: pendingReports },
        { count: resolvedReports },
        { count: dismissedReports },
        { count: activeSuspensions },
        { count: totalBans },
      ] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'dismissed'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
      ]);

      return {
        pendingReports: pendingReports || 0,
        resolvedReports: resolvedReports || 0,
        dismissedReports: dismissedReports || 0,
        activeSuspensions: activeSuspensions || 0,
        totalBans: totalBans || 0,
      };
    } catch (error) {
      logger.error('❌ Get moderation stats error', { error });
      return {
        pendingReports: 0,
        resolvedReports: 0,
        dismissedReports: 0,
        activeSuspensions: 0,
        totalBans: 0,
      };
    }
  }
}

export const moderationService = new ModerationService();
export default moderationService;