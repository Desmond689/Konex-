// src/api/services/tournament.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface ITournamentService {
  createTournament(data: any): Promise<any>;
  getTournament(tournamentId: string): Promise<any>;
  getTournaments(communityId: string, limit?: number, offset?: number): Promise<any[]>;
  updateTournament(tournamentId: string, data: any): Promise<any>;
  deleteTournament(tournamentId: string, userId: string): Promise<void>;
  registerSquad(tournamentId: string, squadId: string): Promise<void>;
  unregisterSquad(tournamentId: string, squadId: string): Promise<void>;
  getRegisteredSquads(tournamentId: string, limit?: number, offset?: number): Promise<any[]>;
  getTournamentBracket(tournamentId: string): Promise<any>;
  submitMatchResult(tournamentId: string, matchId: string, data: any): Promise<any>;
  getTournamentStandings(tournamentId: string): Promise<any[]>;
}

class TournamentService implements ITournamentService {
  async createTournament(data: any): Promise<any> {
    try {
      logger.info('🏆 Creating tournament', { name: data.name });

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          ...data,
          status: 'draft',
        })
        .select(`
          *,
          creator:users (
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

      logger.info('✅ Tournament created', { tournamentId: tournament.id });
      return tournament;
    } catch (error) {
      logger.error('❌ Create tournament error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Tournament creation failed',
        'Failed to create tournament. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getTournament(tournamentId: string): Promise<any> {
    try {
      logger.info('🏆 Fetching tournament', { tournamentId });

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          creator:users (
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
          registrations:tournament_registrations (
            id,
            status,
            squad:squads (
              id,
              name,
              icon_url,
              member_count
            )
          ),
          matches:tournament_matches (
            id,
            round,
            status,
            squad_a_id,
            squad_b_id,
            winner_id,
            score
          )
        `)
        .eq('id', tournamentId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get tournament error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Tournament fetch failed',
        'Failed to fetch tournament. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getTournaments(
    communityId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🏆 Fetching tournaments', { communityId });

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          creator:users (
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
          registrations:tournament_registrations (count)
        `)
        .eq('community_id', communityId)
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get tournaments error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Tournaments fetch failed',
        'Failed to fetch tournaments. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async updateTournament(tournamentId: string, data: any): Promise<any> {
    try {
      logger.info('🏆 Updating tournament', { tournamentId });

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .update(data)
        .eq('id', tournamentId)
        .select(`
          *,
          creator:users (
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

      logger.info('✅ Tournament updated', { tournamentId });
      return tournament;
    } catch (error) {
      logger.error('❌ Update tournament error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Tournament update failed',
        'Failed to update tournament. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteTournament(tournamentId: string, userId: string): Promise<void> {
    try {
      logger.info('🏆 Deleting tournament', { tournamentId, userId });

      const { data: tournament } = await supabase
        .from('tournaments')
        .select('creator_id')
        .eq('id', tournamentId)
        .single();

      if (!tournament) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Tournament not found',
          'No tournament found with this ID.',
          ErrorSeverity.WARNING,
          { tournamentId }
        );
      }

      if (tournament.creator_id !== userId) {
        throw new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          'Not authorized',
          'You can only delete your own tournaments.',
          ErrorSeverity.WARNING,
          { tournamentId, userId }
        );
      }

      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) {
        throw error;
      }

      logger.info('✅ Tournament deleted', { tournamentId });
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Delete tournament error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Tournament deletion failed',
        'Failed to delete tournament. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async registerSquad(tournamentId: string, squadId: string): Promise<void> {
    try {
      logger.info('🏆 Registering squad for tournament', { tournamentId, squadId });

      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          squad_id: squadId,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      logger.info('✅ Squad registered', { tournamentId, squadId });
    } catch (error) {
      logger.error('❌ Register squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Registration failed',
        'Failed to register squad for tournament. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async unregisterSquad(tournamentId: string, squadId: string): Promise<void> {
    try {
      logger.info('🏆 Unregistering squad from tournament', { tournamentId, squadId });

      const { error } = await supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('squad_id', squadId);

      if (error) {
        throw error;
      }

      logger.info('✅ Squad unregistered', { tournamentId, squadId });
    } catch (error) {
      logger.error('❌ Unregister squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Unregistration failed',
        'Failed to unregister squad from tournament. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getRegisteredSquads(
    tournamentId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🏆 Fetching registered squads', { tournamentId });

      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          id,
          status,
          registered_at,
          squad:squads (
            id,
            name,
            icon_url,
            member_count,
            leader:users (
              id,
              gamer_tag,
              username,
              avatar_url
            )
          )
        `)
        .eq('tournament_id', tournamentId)
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get registered squads error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Registered squads fetch failed',
        'Failed to fetch registered squads. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getTournamentBracket(tournamentId: string): Promise<any> {
    try {
      logger.info('🏆 Fetching tournament bracket', { tournamentId });

      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          squad_a:squads!squad_a_id (
            id,
            name,
            icon_url
          ),
          squad_b:squads!squad_b_id (
            id,
            name,
            icon_url
          ),
          winner:squads!winner_id (
            id,
            name,
            icon_url
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get tournament bracket error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Bracket fetch failed',
        'Failed to fetch tournament bracket. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async submitMatchResult(
    tournamentId: string,
    matchId: string,
    data: any
  ): Promise<any> {
    try {
      logger.info('🏆 Submitting match result', { tournamentId, matchId });

      const { data: result, error } = await supabase
        .from('tournament_matches')
        .update({
          winner_id: data.winner_id,
          score: data.score,
          status: 'completed',
          result_submitted_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .eq('tournament_id', tournamentId)
        .select(`
          *,
          squad_a:squads!squad_a_id (
            id,
            name,
            icon_url
          ),
          squad_b:squads!squad_b_id (
            id,
            name,
            icon_url
          ),
          winner:squads!winner_id (
            id,
            name,
            icon_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Match result submitted', { matchId });
      return result;
    } catch (error) {
      logger.error('❌ Submit match result error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Result submission failed',
        'Failed to submit match result. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getTournamentStandings(tournamentId: string): Promise<any[]> {
    try {
      logger.info('🏆 Fetching tournament standings', { tournamentId });

      const { data, error } = await supabase
        .from('tournament_standings')
        .select(`
          *,
          squad:squads (
            id,
            name,
            icon_url
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('points', { ascending: false })
        .order('wins', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get tournament standings error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Standings fetch failed',
        'Failed to fetch tournament standings. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const tournamentService = new TournamentService();
export default tournamentService;