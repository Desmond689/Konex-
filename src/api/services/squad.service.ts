// src/api/services/squad.service.ts
import { supabase } from '../client/supabase.client';
import { logger } from '../../core/logger/logger.service';
import { KonexError, ErrorCode, ErrorSeverity } from '../../core/errors/app.error';
import { Squad, SquadInsert, SquadUpdate } from '../types/database.types';

export interface ISquadService {
  getSquad(squadId: string): Promise<Squad>;
  getMySquads(userId: string): Promise<Squad[]>;
  createSquad(data: SquadInsert): Promise<Squad>;
  updateSquad(squadId: string, data: SquadUpdate): Promise<Squad>;
  deleteSquad(squadId: string): Promise<void>;
  getSquadsByCommunity(communityId: string, limit?: number, offset?: number): Promise<Squad[]>;
  searchSquads(query: string, limit?: number): Promise<Squad[]>;
  joinSquad(userId: string, squadId: string): Promise<void>;
  leaveSquad(userId: string, squadId: string): Promise<void>;
  kickMember(squadId: string, userId: string, kickedBy: string): Promise<void>;
  transferLeadership(squadId: string, newLeaderId: string, currentLeaderId: string): Promise<void>;
  getSquadMembers(squadId: string, limit?: number, offset?: number): Promise<any[]>;
  getSquadJoinRequests(squadId: string, limit?: number, offset?: number): Promise<any[]>;
  approveJoinRequest(squadId: string, userId: string): Promise<void>;
  denyJoinRequest(squadId: string, userId: string): Promise<void>;
}

class SquadService implements ISquadService {
  async getSquad(squadId: string): Promise<Squad> {
    try {
      logger.info('🛡️ Fetching squad', { squadId });

      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .eq('id', squadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Squad not found',
            'No squad found with this ID.',
            ErrorSeverity.WARNING,
            { squadId }
          );
        }
        throw error;
      }

      if (!data) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Squad not found',
          'No squad found with this ID.',
          ErrorSeverity.WARNING,
          { squadId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get squad error', { error, squadId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad fetch failed',
        'Failed to fetch squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async createSquad(data: SquadInsert): Promise<Squad> {
    try {
      logger.info('🛡️ Creating squad', { name: data.name });

      const leaderId = (data as any).leader || (data as any).created_by || (data as any).leader_id;
      if (!leaderId) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Leader required',
          'You must be signed in to create a squad.',
          ErrorSeverity.WARNING,
          {}
        );
      }

      // Align with database.types.ts squads.Insert
      const payload: Record<string, unknown> = {
        name: data.name,
        slug: (data as any).slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: (data as any).description ?? null,
        type: (data as any).type || 'public',
        game: (data as any).game || 'general',
        game_mode: (data as any).game_mode || 'any',
        skill_level: (data as any).skill_level || 'any',
        status: 'active',
        max_members: (data as any).max_members || 10,
        leader: leaderId,
        created_by: leaderId,
        co_leaders: [],
        moderators: [],
        members: [leaderId],
        pending_requests: [],
        banned_members: [],
        posts: [],
        tournaments: [],
        tags: (data as any).tags || [],
        requirements: (data as any).requirements || {},
        stats: {},
        settings: {},
        is_verified: false,
        is_active: true,
        is_featured: false,
      };

      const { data: squad, error } = await supabase
        .from('squads')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Best-effort membership row (table name may vary by migration)
      try {
        await supabase.from('squad_memberships').insert({
          user_id: leaderId,
          squad_id: squad.id,
          role: 'leader',
        });
      } catch (memErr) {
        logger.warn('🛡️ squad_memberships insert skipped', { memErr });
      }

      logger.info('✅ Squad created', { squadId: squad.id });
      return squad;
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ Create squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad creation failed',
        'Failed to create squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateSquad(squadId: string, data: SquadUpdate): Promise<Squad> {
    try {
      logger.info('🛡️ Updating squad', { squadId });

      const { data: squad, error } = await supabase
        .from('squads')
        .update(data)
        .eq('id', squadId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Squad updated', { squadId });
      return squad;
    } catch (error) {
      logger.error('❌ Update squad error', { error, squadId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad update failed',
        'Failed to update squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteSquad(squadId: string): Promise<void> {
    try {
      logger.info('🛡️ Deleting squad', { squadId });

      // Mark squad as pending deletion instead of hard delete
      const { error } = await supabase
        .from('squads')
        .update({
          status: 'pending_deletion',
        })
        .eq('id', squadId);

      if (error) {
        throw error;
      }

      // Remove squad_id from all members
      await supabase
        .from('users')
        .update({
          squad_id: null,
          squad_role: null,
        })
        .eq('squad_id', squadId);

      // Deactivate squad memberships
      await supabase
        .from('squad_memberships')
        .update({
          is_active: false,
        })
        .eq('squad_id', squadId);

      logger.info('✅ Squad marked for deletion', { squadId });
    } catch (error) {
      logger.error('❌ Delete squad error', { error, squadId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad deletion failed',
        'Failed to delete squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getSquadsByCommunity(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Squad[]> {
    try {
      logger.info('🛡️ Fetching squads by community', { communityId });

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
      logger.error('❌ Get squads by community error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squads fetch failed',
        'Failed to fetch squads. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async searchSquads(query: string, limit: number = 20): Promise<Squad[]> {
    try {
      logger.info('🔍 Searching squads', { query });

      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tag.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search squads error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Search failed',
        'Failed to search squads. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }


  async getMySquads(userId: string): Promise<Squad[]> {
    try {
      logger.info('🛡️ Fetching my squads', { userId });

      // Try membership table first
      const { data: memberships, error: memErr } = await supabase
        .from('squad_memberships')
        .select('squad_id')
        .eq('user_id', userId);

      if (!memErr && memberships && memberships.length > 0) {
        const ids = memberships.map((m: any) => m.squad_id);
        const { data, error } = await supabase.from('squads').select('*').in('id', ids);
        if (error) throw error;
        return data || [];
      }

      // Fallback: squads where user is leader / created_by / in member_ids
      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .or(`leader.eq.${userId},created_by.eq.${userId}`);

      if (error) {
        // Last resort: member_ids contains (json) — may fail on some schemas
        logger.warn('🛡️ getMySquads primary query failed, returning empty', { error });
        return [];
      }
      return data || [];
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ getMySquads error', { error, userId });
      return [];
    }
  }

  async joinSquad(userId: string, squadId: string): Promise<void> {
    try {
      logger.info('🛡️ Joining squad', { userId, squadId });

      const squad = await this.getSquad(squadId);

      if ((squad as any).member_count >= squad.max_members) {
        throw new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          'Squad full',
          'This squad has reached the maximum number of members.',
          ErrorSeverity.WARNING,
          { squadId }
        );
      }

      if ((squad as any).join_type === 'inviteOnly') {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Invite only',
          'This squad is invite-only. You must be invited to join.',
          ErrorSeverity.WARNING,
          { squadId }
        );
      }

      const { error } = await supabase.from('squad_members').insert({
        squad_id: squadId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      });

      if (error) throw error;

      await supabase
        .from('squads')
        .update({ member_count: (squad.member_count || 0) + 1 })
        .eq('id', squadId);

      logger.info('✅ Joined squad', { userId, squadId });
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ Join squad error', { error, userId, squadId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Join failed',
        'Failed to join squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async leaveSquad(userId: string, squadId: string): Promise<void> {
    try {
      logger.info('🛡️ Leaving squad', { userId, squadId });
      const { error } = await supabase
        .from('squad_members')
        .delete()
        .eq('squad_id', squadId)
        .eq('user_id', userId);
      if (error) throw error;
      const squad = await this.getSquad(squadId);
      await supabase
        .from('squads')
        .update({ member_count: Math.max(0, (squad.member_count || 1) - 1) })
        .eq('id', squadId);
      logger.info('✅ Left squad', { userId, squadId });
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ Leave squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Leave failed',
        'Failed to leave squad.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async kickMember(squadId: string, userId: string, kickedBy: string): Promise<void> {
    try {
      logger.info('🛡️ Kicking member', { squadId, userId, kickedBy });
      const { error } = await supabase
        .from('squad_members')
        .delete()
        .eq('squad_id', squadId)
        .eq('user_id', userId);
      if (error) throw error;
      const squad = await this.getSquad(squadId);
      await supabase
        .from('squads')
        .update({ member_count: Math.max(0, (squad.member_count || 1) - 1) })
        .eq('id', squadId);
    } catch (error) {
      if (error instanceof KonexError) throw error;
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Kick failed',
        'Failed to kick member.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async transferLeadership(squadId: string, newLeaderId: string, currentLeaderId: string): Promise<void> {
    try {
      logger.info('🛡️ Transfer leadership', { squadId, newLeaderId, currentLeaderId });
      await supabase
        .from('squad_members')
        .update({ role: 'member' })
        .eq('squad_id', squadId)
        .eq('user_id', currentLeaderId);
      await supabase
        .from('squad_members')
        .update({ role: 'owner' })
        .eq('squad_id', squadId)
        .eq('user_id', newLeaderId);
      await supabase.from('squads').update({ owner_id: newLeaderId }).eq('id', squadId);
    } catch (error) {
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Transfer failed',
        'Failed to transfer leadership.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getSquadMembers(squadId: string, limit = 50, offset = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('squad_members')
      .select('*, user:users(*)')
      .eq('squad_id', squadId)
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data || [];
  }

  async getSquadJoinRequests(squadId: string, limit = 50, offset = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('squad_join_requests')
      .select('*')
      .eq('squad_id', squadId)
      .eq('status', 'pending')
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data || [];
  }

  async approveJoinRequest(squadId: string, userId: string): Promise<void> {
    await this.joinSquad(userId, squadId);
    await supabase
      .from('squad_join_requests')
      .update({ status: 'approved' })
      .eq('squad_id', squadId)
      .eq('user_id', userId);
  }

  async denyJoinRequest(squadId: string, userId: string): Promise<void> {
    await supabase
      .from('squad_join_requests')
      .update({ status: 'denied' })
      .eq('squad_id', squadId)
      .eq('user_id', userId);
  }
}

export const squadService = new SquadService();
export default squadService;
