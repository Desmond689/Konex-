// src/api/services/lfg.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface ILFGService {
  createLFG(data: any): Promise<any>;
  getLFG(lfgId: string): Promise<any>;
  getActiveLFG(communityId: string, limit?: number, offset?: number): Promise<any[]>;
  getLFGByUser(userId: string, limit?: number, offset?: number): Promise<any[]>;
  joinLFG(lfgId: string, userId: string): Promise<void>;
  leaveLFG(lfgId: string, userId: string): Promise<void>;
  cancelLFG(lfgId: string, userId: string): Promise<void>;
  markFilled(lfgId: string, userId: string): Promise<void>;
  getLFGRequests(lfgId: string, limit?: number, offset?: number): Promise<any[]>;
  approveLFGRequest(lfgId: string, userId: string): Promise<void>;
  denyLFGRequest(lfgId: string, userId: string): Promise<void>;
}

class LFGService implements ILFGService {
  async createLFG(data: any): Promise<any> {
    try {
      logger.info('🎮 Creating LFG', { authorId: data.author_id });

      const { data: lfg, error } = await supabase
        .from('lfg_posts')
        .insert({
          ...data,
          status: 'active',
        })
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
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ LFG created', { lfgId: lfg.id });
      return lfg;
    } catch (error) {
      logger.error('❌ Create LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'LFG creation failed',
        'Failed to create LFG. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getLFG(lfgId: string): Promise<any> {
    try {
      logger.info('🎮 Fetching LFG', { lfgId });

      const { data, error } = await supabase
        .from('lfg_posts')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          squad:squads (
            id,
            name,
            icon_url
          ),
          requests:lfg_requests (
            id,
            status,
            user:users (
              id,
              gamer_tag,
              username,
              avatar_url
            )
          )
        `)
        .eq('id', lfgId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'LFG fetch failed',
        'Failed to fetch LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getActiveLFG(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🎮 Fetching active LFG', { communityId });

      const { data, error } = await supabase
        .from('lfg_posts')
        .select(`
          *,
          author:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            online_status
          ),
          squad:squads (
            id,
            name,
            icon_url
          ),
          requests:lfg_requests (count)
        `)
        .eq('community_id', communityId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get active LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'LFG fetch failed',
        'Failed to fetch LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getLFGByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🎮 Fetching LFG by user', { userId });

      const { data, error } = await supabase
        .from('lfg_posts')
        .select(`
          *,
          squad:squads (
            id,
            name,
            icon_url
          ),
          requests:lfg_requests (count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get LFG by user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'LFG fetch failed',
        'Failed to fetch LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async joinLFG(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('🎮 Joining LFG', { lfgId, userId });

      // Check if already requested
      const { data: existing } = await supabase
        .from('lfg_requests')
        .select('id')
        .eq('lfg_id', lfgId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        throw new KonexError(
          ErrorCode.DB_DUPLICATE_RECORD,
          'Already requested',
          'You have already requested to join this LFG.',
          ErrorSeverity.WARNING,
          { lfgId, userId }
        );
      }

      const { error } = await supabase
        .from('lfg_requests')
        .insert({
          lfg_id: lfgId,
          user_id: userId,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Joined LFG', { lfgId, userId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Join LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Join failed',
        'Failed to join LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async leaveLFG(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('🎮 Leaving LFG', { lfgId, userId });

      const { error } = await supabase
        .from('lfg_requests')
        .delete()
        .eq('lfg_id', lfgId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ Left LFG', { lfgId, userId });
    } catch (error) {
      logger.error('❌ Leave LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Leave failed',
        'Failed to leave LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async cancelLFG(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('🎮 Cancelling LFG', { lfgId, userId });

      const { data: lfg } = await supabase
        .from('lfg_posts')
        .select('author_id')
        .eq('id', lfgId)
        .single();

      if (!lfg) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'LFG not found',
          'No LFG found with this ID.',
          ErrorSeverity.WARNING,
          { lfgId }
        );
      }

      if (lfg.author_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only cancel your own LFG.',
          ErrorSeverity.WARNING,
          { lfgId, userId }
        );
      }

      const { error } = await supabase
        .from('lfg_posts')
        .update({ status: 'cancelled' })
        .eq('id', lfgId);

      if (error) {
        throw error;
      }

      logger.info('✅ LFG cancelled', { lfgId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Cancel LFG error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Cancel failed',
        'Failed to cancel LFG. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async markFilled(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('🎮 Marking LFG as filled', { lfgId, userId });

      const { data: lfg } = await supabase
        .from('lfg_posts')
        .select('author_id')
        .eq('id', lfgId)
        .single();

      if (!lfg) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'LFG not found',
          'No LFG found with this ID.',
          ErrorSeverity.WARNING,
          { lfgId }
        );
      }

      if (lfg.author_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'Only the LFG creator can mark it as filled.',
          ErrorSeverity.WARNING,
          { lfgId, userId }
        );
      }

      const { error } = await supabase
        .from('lfg_posts')
        .update({ status: 'filled' })
        .eq('id', lfgId);

      if (error) {
        throw error;
      }

      logger.info('✅ LFG marked as filled', { lfgId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Mark filled error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Mark filled failed',
        'Failed to mark LFG as filled. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getLFGRequests(
    lfgId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🎮 Fetching LFG requests', { lfgId });

      const { data, error } = await supabase
        .from('lfg_requests')
        .select(`
          id,
          status,
          created_at,
          user:users (
            id,
            gamer_tag,
            username,
            avatar_url,
            skill_level,
            role
          )
        `)
        .eq('lfg_id', lfgId)
        .eq('status', 'pending')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get LFG requests error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Requests fetch failed',
        'Failed to fetch LFG requests. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async approveLFGRequest(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('✅ Approving LFG request', { lfgId, userId });

      await supabase
        .from('lfg_requests')
        .update({ status: 'approved' })
        .eq('lfg_id', lfgId)
        .eq('user_id', userId);

      logger.info('✅ LFG request approved', { lfgId, userId });
    } catch (error) {
      logger.error('❌ Approve LFG request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Approval failed',
        'Failed to approve LFG request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async denyLFGRequest(lfgId: string, userId: string): Promise<void> {
    try {
      logger.info('❌ Denying LFG request', { lfgId, userId });

      await supabase
        .from('lfg_requests')
        .update({ status: 'denied' })
        .eq('lfg_id', lfgId)
        .eq('user_id', userId);

      logger.info('✅ LFG request denied', { lfgId, userId });
    } catch (error) {
      logger.error('❌ Deny LFG request error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Denial failed',
        'Failed to deny LFG request. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const lfgService = new LFGService();
export default lfgService;