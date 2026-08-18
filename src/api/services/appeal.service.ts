// src/api/services/appeal.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IAppealService {
  createAppeal(data: any): Promise<any>;
  getAppeal(appealId: string): Promise<any>;
  getAppealsByUser(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getPendingAppeals(limit?: number, offset?: number): Promise<any[]>;
  reviewAppeal(appealId: string, moderatorId: string, decision: string, notes?: string): Promise<void>;
  getAppealStats(): Promise<any>;
}

class AppealService implements IAppealService {
  async createAppeal(data: any): Promise<any> {
    try {
      logger.info('📧 Creating appeal', { userId: data.user_id });

      const { data: appeal, error } = await supabase
        .from('appeals')
        .insert({
          ...data,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Appeal created', { appealId: appeal.id });
      return appeal;
    } catch (error) {
      logger.error('❌ Create appeal error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Appeal creation failed',
        'Failed to create appeal. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getAppeal(appealId: string): Promise<any> {
    try {
      logger.info('📧 Fetching appeal', { appealId });

      const { data, error } = await supabase
        .from('appeals')
        .select(`
          *,
          user:users!user_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            email
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          ),
          moderation_action:moderation_actions!moderation_action_id (
            id,
            action_type,
            reason,
            created_at
          )
        `)
        .eq('id', appealId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get appeal error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Appeal fetch failed',
        'Failed to fetch appeal. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getAppealsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('📧 Fetching appeals by user', { userId });

      const { data, error } = await supabase
        .from('appeals')
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
      logger.error('❌ Get appeals by user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Appeals fetch failed',
        'Failed to fetch appeals. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getPendingAppeals(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('📧 Fetching pending appeals');

      const { data, error } = await supabase
        .from('appeals')
        .select(`
          *,
          user:users!user_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            email
          ),
          moderation_action:moderation_actions!moderation_action_id (
            id,
            action_type,
            reason,
            created_at
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
      logger.error('❌ Get pending appeals error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Pending appeals fetch failed',
        'Failed to fetch pending appeals. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async reviewAppeal(
    appealId: string,
    moderatorId: string,
    decision: string,
    notes?: string
  ): Promise<void> {
    try {
      logger.info('📧 Reviewing appeal', { appealId, moderatorId, decision });

      const { data: appeal } = await supabase
        .from('appeals')
        .select('user_id, moderation_action_id')
        .eq('id', appealId)
        .single();

      if (!appeal) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Appeal not found',
          'No appeal found with this ID.',
          ErrorSeverity.WARNING,
          { appealId }
        );
      }

      await supabase
        .from('appeals')
        .update({
          status: decision === 'approved' ? 'approved' : 'denied',
          moderator_id: moderatorId,
          notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appealId);

      // If appeal is approved, reverse the moderation action
      if (decision === 'approved' && appeal.moderation_action_id) {
        // Reverse the action
        // This would depend on the type of action
        // For suspension: lift suspension
        // For ban: unban
        // For warning: remove warning count
      }

      logger.info('✅ Appeal reviewed', { appealId, decision });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Review appeal error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Review failed',
        'Failed to review appeal. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getAppealStats(): Promise<any> {
    try {
      logger.info('📧 Fetching appeal stats');

      const [
        { count: pending },
        { count: approved },
        { count: denied },
      ] = await Promise.all([
        supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'denied'),
      ]);

      return {
        pending: pending || 0,
        approved: approved || 0,
        denied: denied || 0,
      };
    } catch (error) {
      logger.error('❌ Get appeal stats error', { error });
      return {
        pending: 0,
        approved: 0,
        denied: 0,
      };
    }
  }
}

export const appealService = new AppealService();
export default appealService;