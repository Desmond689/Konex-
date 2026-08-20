// @ts-nocheck
/**
 * KONEX useTournaments Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides tournaments management
 * 
 * Usage:
 * const { tournaments, createTournament, register } = useTournaments();
 */

import { useCallback, useEffect, useState } from 'react';
import { tournamentService } from '../api/services/tournament.service';
import { logger } from '../core/logger/logger.service';
import { useTournamentStore } from '../store/tournamentStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';
import { useInfiniteScroll } from './useInfiniteScroll';

export interface UseTournamentsOptions {
  communityId?: string;
  autoFetch?: boolean;
  initialLimit?: number;
  status?: string;
}

export interface UseTournamentsReturn {
  tournaments: any[];
  myTournaments: any[];
  currentTournament: any | null;
  registrations: any[];
  matches: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createTournament: (data: any) => Promise<any>;
  updateTournament: (tournamentId: string, data: any) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  registerSquad: (tournamentId: string, squadId: string) => Promise<void>;
  unregisterSquad: (tournamentId: string, squadId: string) => Promise<void>;
  getTournament: (tournamentId: string) => Promise<any>;
  getBracket: (tournamentId: string) => Promise<any>;
  submitMatchResult: (tournamentId: string, matchId: string, data: any) => Promise<void>;
  getStandings: (tournamentId: string) => Promise<any[]>;
  checkIn: (tournamentId: string) => Promise<void>;
}

export const useTournaments = (options: UseTournamentsOptions = {}): UseTournamentsReturn => {
  const {
    communityId,
    autoFetch = true,
    initialLimit = 20,
    status,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    tournaments,
    myTournaments,
    currentTournament,
    registrations,
    matches,
    setTournaments,
    setMyTournaments,
    setCurrentTournament,
    setRegistrations,
    setMatches,
    addTournament,
    updateTournament: updateTournamentStore,
    removeTournament,
  } = useTournamentStore();

  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH TOURNAMENTS
  // ============================================

  const fetchTournaments = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;
      if (communityId) {
        result = await tournamentService.getTournaments(communityId, pageSize, page * pageSize);
      } else {
        result = [];
      }

      // Filter by status if provided
      if (status && result) {
        result = result.filter((t: any) => t.status === status);
      }

      return {
        data: result || [],
        hasMore: result.length >= pageSize,
        total: result.length,
      };
    } catch (err) {
      logger.error('❌ Fetch tournaments error', err);
      throw err;
    }
  }, [communityId, status]);

  // ============================================
  // INFINITE SCROLL
  // ============================================

  const {
    data,
    isLoading,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    reset,
  } = useInfiniteScroll(fetchTournaments, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => setError(err),
  });

  // ============================================
  // CREATE / UPDATE / DELETE
  // ============================================

  const createTournament = useCallback(async (data: any) => {
    try {
      const newTournament = await tournamentService.createTournament({
        ...data,
        creator_id: user?.id,
        community_id: communityId,
      });

      addTournament(newTournament);
      
      trackEvent('tournament_create', {
        tournamentId: newTournament.id,
        name: data.name,
        maxSquads: data.maxSquads,
      });

      showToast('Tournament created successfully!', 'success');
      return newTournament;
    } catch (err) {
      logger.error('❌ Create tournament error', err);
      showToast('Failed to create tournament', 'error');
      throw err;
    }
  }, [user, communityId, addTournament, trackEvent, showToast]);

  const updateTournament = useCallback(async (tournamentId: string, data: any) => {
    try {
      const updated = await tournamentService.updateTournament(tournamentId, data);
      updateTournamentStore(tournamentId, updated);
      
      trackEvent('tournament_update', { tournamentId });
      showToast('Tournament updated successfully!', 'success');
    } catch (err) {
      logger.error('❌ Update tournament error', err);
      showToast('Failed to update tournament', 'error');
      throw err;
    }
  }, [updateTournamentStore, trackEvent, showToast]);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    try {
      await tournamentService.deleteTournament(tournamentId, user?.id || '');
      removeTournament(tournamentId);
      
      trackEvent('tournament_delete', { tournamentId });
      showToast('Tournament deleted', 'info');
    } catch (err) {
      logger.error('❌ Delete tournament error', err);
      showToast('Failed to delete tournament', 'error');
      throw err;
    }
  }, [user, removeTournament, trackEvent, showToast]);

  // ============================================
  // REGISTRATION
  // ============================================

  const registerSquad = useCallback(async (tournamentId: string, squadId: string) => {
    try {
      await tournamentService.registerSquad(tournamentId, squadId);
      
      // Refresh tournament data
      await refresh();
      
      trackEvent('tournament_register', { tournamentId, squadId });
      showToast('Registered for tournament!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Register squad error', error);
      showToast(error.message || 'Failed to register', 'error');
      throw err;
    }
  }, [refresh, trackEvent, showToast]);

  const unregisterSquad = useCallback(async (tournamentId: string, squadId: string) => {
    try {
      await tournamentService.unregisterSquad(tournamentId, squadId);
      
      // Refresh tournament data
      await refresh();
      
      trackEvent('tournament_unregister', { tournamentId, squadId });
      showToast('Unregistered from tournament', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Unregister squad error', error);
      showToast(error.message || 'Failed to unregister', 'error');
      throw err;
    }
  }, [refresh, trackEvent, showToast]);

  // ============================================
  // TOURNAMENT OPERATIONS
  // ============================================

  const getTournament = useCallback(async (tournamentId: string) => {
    try {
      const result = await tournamentService.getTournament(tournamentId);
      setCurrentTournament(result);
      return result;
    } catch (err) {
      logger.error('❌ Get tournament error', err);
      throw err;
    }
  }, [setCurrentTournament]);

  const getBracket = useCallback(async (tournamentId: string) => {
    try {
      return await tournamentService.getTournamentBracket(tournamentId);
    } catch (err) {
      logger.error('❌ Get bracket error', err);
      return [];
    }
  }, []);

  const submitMatchResult = useCallback(async (tournamentId: string, matchId: string, data: any) => {
    try {
      await tournamentService.submitMatchResult(tournamentId, matchId, data);
      
      trackEvent('tournament_match_result', { tournamentId, matchId });
      showToast('Match result submitted!', 'success');
    } catch (err) {
      logger.error('❌ Submit match result error', err);
      showToast('Failed to submit match result', 'error');
      throw err;
    }
  }, [trackEvent, showToast]);

  const getStandings = useCallback(async (tournamentId: string) => {
    try {
      return await tournamentService.getTournamentStandings(tournamentId);
    } catch (err) {
      logger.error('❌ Get standings error', err);
      return [];
    }
  }, []);

  const checkIn = useCallback(async (tournamentId: string) => {
    try {
      await tournamentService.checkIn(tournamentId, user?.id || '');
      
      trackEvent('tournament_check_in', { tournamentId });
      showToast('Checked in successfully!', 'success');
    } catch (err) {
      logger.error('❌ Check-in error', err);
      showToast('Failed to check in', 'error');
      throw err;
    }
  }, [user, trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && communityId) {
      reset();
      loadMore();
    }
  }, [communityId, status, autoFetch]);

  // Fetch user's tournaments
  useEffect(() => {
    if (user?.id) {
      tournamentService.getTournamentsByUser(user.id).then((result) => {
        setMyTournaments(result || []);
      }).catch((err) => {
        logger.error('❌ Fetch user tournaments error', err);
      });
    }
  }, [user?.id, setMyTournaments]);

  return {
    tournaments: data,
    myTournaments,
    currentTournament,
    registrations,
    matches,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    createTournament,
    updateTournament,
    deleteTournament,
    registerSquad,
    unregisterSquad,
    getTournament,
    getBracket,
    submitMatchResult,
    getStandings,
    checkIn,
  };
};

export default useTournaments;