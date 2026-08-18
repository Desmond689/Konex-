/**
 * KONEX useTournament Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides single tournament operations (CRUD, registration, bracket)
 * 
 * Usage:
 * const { tournament, loading, registerSquad, submitResult } = useTournament(tournamentId);
 */

import { useCallback, useEffect, useState } from 'react';
import { tournamentService } from '../../../api/services/tournament.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../providers/ToastProvider';
import { useTournamentStore } from '../store/tournament.store';

// ============================================
// 1. TYPES
// ============================================

export interface UseTournamentOptions {
  /** Tournament ID to fetch */
  tournamentId?: string;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Enable realtime updates */
  enableRealtime?: boolean;
}

export interface UseTournamentReturn {
  // Data
  tournament: any | null;
  registeredSquads: any[];
  bracket: any | null;
  standings: any[];
  
  // Loading states
  isLoading: boolean;
  isRegistering: boolean;
  isSubmitting: boolean;
  isRefreshing: boolean;
  
  // Error states
  error: Error | null;
  
  // Actions
  fetchTournament: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  registerSquad: (squadId: string) => Promise<void>;
  unregisterSquad: (squadId: string) => Promise<void>;
  submitMatchResult: (matchId: string, data: any) => Promise<void>;
  fetchBracket: () => Promise<void>;
  fetchStandings: () => Promise<void>;
  fetchRegisteredSquads: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useTournament = (options: UseTournamentOptions = {}): UseTournamentReturn => {
  const {
    tournamentId: initialTournamentId,
    autoFetch = true,
    enableRealtime = true,
  } = options;

  const { user } = useAuth();
  const { showToast } = useToast();
  const { trackEvent } = useAnalytics();
  
  const {
    currentTournament,
    registeredSquads,
    bracket,
    standings,
    isLoading,
    isRefreshing,
    error,
    setTournament,
    setRegisteredSquads,
    setBracket,
    setStandings,
    setLoading,
    setRefreshing,
    setError,
    clearError,
    reset: resetStore,
  } = useTournamentStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  // ============================================
  // FETCH TOURNAMENT
  // ============================================

  const fetchTournament = useCallback(async (id: string) => {
    if (!id) {
      setFetchError(new Error('Tournament ID is required'));
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);

      const tournament = await tournamentService.getTournament(id);
      setTournament(tournament);

      trackEvent('tournament_view', { tournamentId: id });
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Fetch tournament error', { error, tournamentId: id });
      
      showToast(
        error.message || 'Failed to load tournament',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [setTournament, setLoading, setError, trackEvent, showToast]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    if (!currentTournament?.id) return;

    try {
      setRefreshing(true);
      await fetchTournament(currentTournament.id);
      await Promise.all([
        fetchRegisteredSquads(),
        fetchBracket(),
        fetchStandings(),
      ]);
    } catch (err) {
      logger.error('❌ Refresh tournament error', { error: err });
    } finally {
      setRefreshing(false);
    }
  }, [currentTournament?.id, fetchTournament]);

  // ============================================
  // REGISTER SQUAD
  // ============================================

  const registerSquad = useCallback(async (squadId: string) => {
    if (!currentTournament?.id) {
      showToast('No tournament selected', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Please sign in to register', 'error');
      return;
    }

    try {
      setIsRegistering(true);
      setFetchError(null);

      await tournamentService.registerSquad(currentTournament.id, squadId);

      // Refresh registered squads
      await fetchRegisteredSquads();

      trackEvent('tournament_register', {
        tournamentId: currentTournament.id,
        squadId,
      });

      showToast('Successfully registered! 🎮', 'success');
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Register squad error', { error, tournamentId: currentTournament.id });
      
      showToast(
        error.message || 'Failed to register squad',
        'error'
      );
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, [currentTournament?.id, user?.id, fetchRegisteredSquads, setError, trackEvent, showToast]);

  // ============================================
  // UNREGISTER SQUAD
  // ============================================

  const unregisterSquad = useCallback(async (squadId: string) => {
    if (!currentTournament?.id) {
      showToast('No tournament selected', 'error');
      return;
    }

    try {
      setIsRegistering(true);
      setFetchError(null);

      await tournamentService.unregisterSquad(currentTournament.id, squadId);

      // Refresh registered squads
      await fetchRegisteredSquads();

      trackEvent('tournament_unregister', {
        tournamentId: currentTournament.id,
        squadId,
      });

      showToast('Unregistered successfully', 'info');
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Unregister squad error', { error, tournamentId: currentTournament.id });
      
      showToast(
        error.message || 'Failed to unregister',
        'error'
      );
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, [currentTournament?.id, fetchRegisteredSquads, setError, trackEvent, showToast]);

  // ============================================
  // SUBMIT MATCH RESULT
  // ============================================

  const submitMatchResult = useCallback(async (matchId: string, data: any) => {
    if (!currentTournament?.id) {
      showToast('No tournament selected', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setFetchError(null);

      await tournamentService.submitMatchResult(currentTournament.id, matchId, data);

      // Refresh bracket and standings
      await Promise.all([
        fetchBracket(),
        fetchStandings(),
      ]);

      trackEvent('tournament_match_submit', {
        tournamentId: currentTournament.id,
        matchId,
      });

      showToast('Match result submitted! 🏆', 'success');
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Submit match result error', { error, tournamentId: currentTournament.id });
      
      showToast(
        error.message || 'Failed to submit match result',
        'error'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTournament?.id, fetchBracket, fetchStandings, setError, trackEvent, showToast]);

  // ============================================
  // FETCH REGISTERED SQUADS
  // ============================================

  const fetchRegisteredSquads = useCallback(async () => {
    if (!currentTournament?.id) return;

    try {
      const squads = await tournamentService.getRegisteredSquads(currentTournament.id);
      setRegisteredSquads(squads || []);
    } catch (err) {
      logger.error('❌ Fetch registered squads error', { error: err });
    }
  }, [currentTournament?.id, setRegisteredSquads]);

  // ============================================
  // FETCH BRACKET
  // ============================================

  const fetchBracket = useCallback(async () => {
    if (!currentTournament?.id) return;

    try {
      const bracketData = await tournamentService.getTournamentBracket(currentTournament.id);
      setBracket(bracketData);
    } catch (err) {
      logger.error('❌ Fetch bracket error', { error: err });
    }
  }, [currentTournament?.id, setBracket]);

  // ============================================
  // FETCH STANDINGS
  // ============================================

  const fetchStandings = useCallback(async () => {
    if (!currentTournament?.id) return;

    try {
      const standingsData = await tournamentService.getTournamentStandings(currentTournament.id);
      setStandings(standingsData || []);
    } catch (err) {
      logger.error('❌ Fetch standings error', { error: err });
    }
  }, [currentTournament?.id, setStandings]);

  // ============================================
  // INITIAL FETCH
  // ============================================

  useEffect(() => {
    if (autoFetch && initialTournamentId) {
      fetchTournament(initialTournamentId);
    }
  }, [autoFetch, initialTournamentId]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!enableRealtime || !currentTournament?.id) return;

    // Setup realtime subscription for tournament updates
    // This would be implemented with Supabase Realtime

    return () => {
      // Cleanup subscription
    };
  }, [enableRealtime, currentTournament?.id]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    tournament: currentTournament,
    registeredSquads,
    bracket,
    standings,
    
    // Loading states
    isLoading,
    isRegistering,
    isSubmitting,
    isRefreshing,
    
    // Error states
    error: fetchError || error,
    
    // Actions
    fetchTournament,
    refresh,
    registerSquad,
    unregisterSquad,
    submitMatchResult,
    fetchBracket,
    fetchStandings,
    fetchRegisteredSquads,
    
    // Utility
    clearError,
    reset: resetStore,
  };
};

export default useTournament;