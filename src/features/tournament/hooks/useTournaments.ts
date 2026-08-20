// @ts-nocheck
/**
 * KONEX useTournaments Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides list and filtering of tournaments
 * 
 * Usage:
 * const { tournaments, loadMore, createTournament } = useTournaments();
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

export interface TournamentFilters {
  communityId?: string;
  status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  gameId?: string;
  format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  region?: string;
  search?: string;
}

export interface UseTournamentsOptions {
  /** Community ID to filter by */
  communityId?: string;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Initial limit per page */
  limit?: number;
  /** Filters to apply */
  initialFilters?: TournamentFilters;
}

export interface UseTournamentsReturn {
  // Data
  tournaments: any[];
  myTournaments: any[];
  hasMore: boolean;
  totalCount: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  
  // Error states
  error: Error | null;
  
  // Filters
  filters: TournamentFilters;
  setFilters: (filters: Partial<TournamentFilters>) => void;
  resetFilters: () => void;
  
  // Actions
  fetchTournaments: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createTournament: (data: any) => Promise<any>;
  updateTournament: (id: string, data: any) => Promise<any>;
  deleteTournament: (id: string) => Promise<void>;
  searchTournaments: (query: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useTournaments = (options: UseTournamentsOptions = {}): UseTournamentsReturn => {
  const {
    communityId: initialCommunityId,
    autoFetch = true,
    limit = 20,
    initialFilters = {},
  } = options;

  const { user } = useAuth();
  const { showToast } = useToast();
  const { trackEvent } = useAnalytics();

  const {
    tournaments,
    myTournaments,
    isLoading,
    isRefreshing,
    isCreating,
    error,
    setTournaments,
    setMyTournaments,
    addTournament,
    removeTournament,
    updateTournament: updateStoreTournament,
    setLoading,
    setRefreshing,
    setCreating,
    setError,
    clearError,
    reset: resetStore,
  } = useTournamentStore();

  const [filters, setFiltersState] = useState<TournamentFilters>({
    communityId: initialCommunityId,
    ...initialFilters,
  });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  // ============================================
  // FETCH TOURNAMENTS
  // ============================================

  const fetchTournaments = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setOffset(0);
        setHasMore(true);
        setLoading(true);
      } else {
        if (isLoading || !hasMore) return;
        setLoading(true);
      }

      setFetchError(null);

      const currentOffset = reset ? 0 : offset;
      const response = await tournamentService.getTournaments(
        filters.communityId || '',
        limit,
        currentOffset,
        filters.status,
        filters.gameId,
        filters.format
      );

      // Handle response (assuming it returns { data, count })
      const data = response || [];
      const count = data.length || 0;

      if (reset) {
        setTournaments(data);
      } else {
        setTournaments([...tournaments, ...data]);
      }

      setTotalCount(count);
      setHasMore(data.length === limit);
      setOffset(currentOffset + data.length);

      trackEvent('tournaments_list_view', {
        count: data.length,
        filters: filters,
      });
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Fetch tournaments error', { error, filters });
      
      showToast(
        error.message || 'Failed to load tournaments',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [filters, offset, limit, isLoading, hasMore, tournaments, setTournaments, setLoading, setError, trackEvent, showToast]);

  // ============================================
  // LOAD MORE (Infinite Scroll)
  // ============================================

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    await fetchTournaments(false);
  }, [hasMore, isLoading, isRefreshing, fetchTournaments]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchTournaments(true);
      trackEvent('tournaments_refresh');
    } catch (err) {
      logger.error('❌ Refresh tournaments error', { error: err });
    } finally {
      setRefreshing(false);
    }
  }, [fetchTournaments, setRefreshing, trackEvent]);

  // ============================================
  // CREATE TOURNAMENT
  // ============================================

  const createTournament = useCallback(async (data: any) => {
    if (!user?.id) {
      showToast('Please sign in to create a tournament', 'error');
      throw new Error('User not authenticated');
    }

    try {
      setCreating(true);
      setFetchError(null);

      const tournament = await tournamentService.createTournament({
        ...data,
        createdBy: user.id,
      });

      addTournament(tournament);

      trackEvent('tournament_create', {
        tournamentId: tournament.id,
        name: tournament.name,
      });

      showToast('Tournament created! 🏆', 'success');
      return tournament;
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Create tournament error', { error });
      
      showToast(
        error.message || 'Failed to create tournament',
        'error'
      );
      throw error;
    } finally {
      setCreating(false);
    }
  }, [user?.id, addTournament, setCreating, setError, trackEvent, showToast]);

  // ============================================
  // UPDATE TOURNAMENT
  // ============================================

  const updateTournament = useCallback(async (id: string, data: any) => {
    try {
      setFetchError(null);

      const updated = await tournamentService.updateTournament(id, data);
      updateStoreTournament(id, updated);

      trackEvent('tournament_update', { tournamentId: id });
      
      showToast('Tournament updated! ✅', 'success');
      return updated;
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Update tournament error', { error, tournamentId: id });
      
      showToast(
        error.message || 'Failed to update tournament',
        'error'
      );
      throw error;
    }
  }, [updateStoreTournament, setError, trackEvent, showToast]);

  // ============================================
  // DELETE TOURNAMENT
  // ============================================

  const deleteTournament = useCallback(async (id: string) => {
    if (!user?.id) {
      showToast('Please sign in to delete a tournament', 'error');
      throw new Error('User not authenticated');
    }

    try {
      setFetchError(null);

      await tournamentService.deleteTournament(id, user.id);
      removeTournament(id);

      trackEvent('tournament_delete', { tournamentId: id });
      
      showToast('Tournament deleted', 'info');
    } catch (err) {
      const error = err as Error;
      setFetchError(error);
      setError(error.message);
      logger.error('❌ Delete tournament error', { error, tournamentId: id });
      
      showToast(
        error.message || 'Failed to delete tournament',
        'error'
      );
      throw error;
    }
  }, [user?.id, removeTournament, setError, trackEvent, showToast]);

  // ============================================
  // SEARCH TOURNAMENTS
  // ============================================

  const searchTournaments = useCallback(async (query: string) => {
    setFiltersState((prev) => ({ ...prev, search: query }));
  }, []);

  // ============================================
  // FILTER MANAGEMENT
  // ============================================

  const setFilters = useCallback((newFilters: Partial<TournamentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      communityId: initialCommunityId,
      ...initialFilters,
    });
  }, [initialCommunityId, initialFilters]);

  // ============================================
  // EFFECTS
  // ============================================

  // Auto-fetch on mount or filter change
  useEffect(() => {
    if (autoFetch) {
      fetchTournaments(true);
    }
  }, [filters, autoFetch]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    tournaments,
    myTournaments,
    hasMore,
    totalCount,
    
    // Loading states
    isLoading,
    isRefreshing,
    isCreating,
    
    // Error states
    error: fetchError || error,
    
    // Filters
    filters,
    setFilters,
    resetFilters,
    
    // Actions
    fetchTournaments,
    loadMore,
    refresh,
    createTournament,
    updateTournament,
    deleteTournament,
    searchTournaments,
    
    // Utility
    clearError,
    reset: resetStore,
  };
};

export default useTournaments;