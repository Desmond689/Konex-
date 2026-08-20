/**
 * KONEX Tournament Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for tournament state management with persistence
 * 
 * Usage:
 * const { tournaments, setTournaments, addTournament } = useTournamentStore();
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  communityId: string;
  community?: {
    id: string;
    name: string;
    gameId: string;
  };
  gameId: string;
  game?: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: string;
  creator?: {
    id: string;
    gamerTag: string;
    avatarUrl: string | null;
  };
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  maxTeams: number;
  registeredTeams: number;
  registrationStart: string | null;
  registrationEnd: string | null;
  startDate: string | null;
  endDate: string | null;
  prizeDescription: string | null;
  rules: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentStoreState {
  // Data
  tournaments: Tournament[];
  myTournaments: Tournament[];
  currentTournament: Tournament | null;
  registeredSquads: any[];
  bracket: any | null;
  standings: any[];
  
  // Pagination
  hasMore: boolean;
  offset: number;
  totalCount: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // UI State
  selectedTournamentId: string | null;
  filterCommunityId: string | null;
  filterStatus: string | null;
  filterGameId: string | null;
  filterFormat: string | null;
  searchQuery: string;
  
  // Actions
  setTournaments: (tournaments: Tournament[]) => void;
  setMyTournaments: (tournaments: Tournament[]) => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  removeTournament: (id: string) => void;
  setRegisteredSquads: (squads: any[]) => void;
  setBracket: (bracket: any | null) => void;
  setStandings: (standings: any[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setOffset: (offset: number) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTournamentId: (id: string | null) => void;
  setFilterCommunityId: (id: string | null) => void;
  setFilterStatus: (status: string | null) => void;
  setFilterGameId: (id: string | null) => void;
  setFilterFormat: (format: string | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  reset: () => void;
  clearError: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState = {
  tournaments: [],
  myTournaments: [],
  currentTournament: null,
  registeredSquads: [],
  bracket: null,
  standings: [],
  hasMore: true,
  offset: 0,
  totalCount: 0,
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  selectedTournamentId: null,
  filterCommunityId: null,
  filterStatus: null,
  filterGameId: null,
  filterFormat: null,
  searchQuery: '',
};

// ============================================
// 3. STORE IMPLEMENTATION
// ============================================

export const useTournamentStore = create<TournamentStoreState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // ============================================
        // DATA SETTERS
        // ============================================

        setTournaments: (tournaments) => {
          set((state) => {
            state.tournaments = tournaments;
          });
          logger.info('📋 Tournaments updated', { count: tournaments.length });
        },

        setMyTournaments: (tournaments) => {
          set((state) => {
            state.myTournaments = tournaments;
          });
          logger.info('📋 My tournaments updated', { count: tournaments.length });
        },

        setCurrentTournament: (tournament) => {
          set((state) => {
            state.currentTournament = tournament;
            if (tournament) {
              state.selectedTournamentId = tournament.id;
            }
          });
          logger.info('🏆 Current tournament set', { 
            id: tournament?.id, 
            name: tournament?.name 
          });
        },

        addTournament: (tournament) => {
          set((state) => {
            const exists = state.tournaments.some((t) => t.id === tournament.id);
            if (!exists) {
              state.tournaments.unshift(tournament);
              state.totalCount += 1;
            }
            // Also add to my tournaments if user is creator
            // This would be determined by the actual data structure
          });
          logger.info('➕ Tournament added', { id: tournament.id, name: tournament.name });
        },

        updateTournament: (id, updates) => {
          set((state) => {
            const index = state.tournaments.findIndex((t) => t.id === id);
            if (index !== -1) {
              state.tournaments[index] = { ...state.tournaments[index], ...updates };
            }
            
            const myIndex = state.myTournaments.findIndex((t) => t.id === id);
            if (myIndex !== -1) {
              state.myTournaments[myIndex] = { ...state.myTournaments[myIndex], ...updates };
            }
            
            if (state.currentTournament?.id === id) {
              state.currentTournament = { ...state.currentTournament, ...updates };
            }
          });
          logger.info('✏️ Tournament updated', { id });
        },

        removeTournament: (id) => {
          set((state) => {
            state.tournaments = state.tournaments.filter((t) => t.id !== id);
            state.myTournaments = state.myTournaments.filter((t) => t.id !== id);
            if (state.currentTournament?.id === id) {
              state.currentTournament = null;
              state.selectedTournamentId = null;
            }
            state.totalCount = Math.max(0, state.totalCount - 1);
          });
          logger.info('🗑️ Tournament removed', { id });
        },

        // ============================================
        // REGISTERED SQUADS
        // ============================================

        setRegisteredSquads: (squads) => {
          set((state) => {
            state.registeredSquads = squads;
          });
          logger.info('👥 Registered squads updated', { count: squads.length });
        },

        // ============================================
        // BRACKET & STANDINGS
        // ============================================

        setBracket: (bracket) => {
          set((state) => {
            state.bracket = bracket;
          });
          logger.info('📊 Bracket updated');
        },

        setStandings: (standings) => {
          set((state) => {
            state.standings = standings;
          });
          logger.info('📈 Standings updated', { count: standings.length });
        },

        // ============================================
        // PAGINATION
        // ============================================

        setHasMore: (hasMore) => {
          set((state) => {
            state.hasMore = hasMore;
          });
        },

        setOffset: (offset) => {
          set((state) => {
            state.offset = offset;
          });
        },

        setTotalCount: (count) => {
          set((state) => {
            state.totalCount = count;
          });
        },

        // ============================================
        // LOADING STATES
        // ============================================

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setRefreshing: (refreshing) => {
          set((state) => {
            state.isRefreshing = refreshing;
          });
        },

        setCreating: (creating) => {
          set((state) => {
            state.isCreating = creating;
          });
        },

        setUpdating: (updating) => {
          set((state) => {
            state.isUpdating = updating;
          });
        },

        setDeleting: (deleting) => {
          set((state) => {
            state.isDeleting = deleting;
          });
        },

        // ============================================
        // ERROR HANDLING
        // ============================================

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
          if (error) {
            logger.error('❌ Tournament store error', { error });
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // ============================================
        // SELECTION
        // ============================================

        setSelectedTournamentId: (id) => {
          set((state) => {
            state.selectedTournamentId = id;
          });
        },

        // ============================================
        // FILTERS
        // ============================================

        setFilterCommunityId: (id) => {
          set((state) => {
            state.filterCommunityId = id;
          });
          // Reset pagination when filter changes
          set((state) => {
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔍 Filter by community', { communityId: id });
        },

        setFilterStatus: (status) => {
          set((state) => {
            state.filterStatus = status;
          });
          set((state) => {
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔍 Filter by status', { status });
        },

        setFilterGameId: (id) => {
          set((state) => {
            state.filterGameId = id;
          });
          set((state) => {
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔍 Filter by game', { gameId: id });
        },

        setFilterFormat: (format) => {
          set((state) => {
            state.filterFormat = format;
          });
          set((state) => {
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔍 Filter by format', { format });
        },

        setSearchQuery: (query) => {
          set((state) => {
            state.searchQuery = query;
          });
          set((state) => {
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔍 Search tournaments', { query });
        },

        resetFilters: () => {
          set((state) => {
            state.filterCommunityId = null;
            state.filterStatus = null;
            state.filterGameId = null;
            state.filterFormat = null;
            state.searchQuery = '';
            state.offset = 0;
            state.hasMore = true;
          });
          logger.info('🔄 Filters reset');
        },

        // ============================================
        // RESET
        // ============================================

        reset: () => {
          set(initialState);
          logger.info('🔄 Tournament store reset');
        },
      })),
      {
        name: 'tournament-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          // Only persist these fields
          tournaments: state.tournaments.slice(0, 50), // Limit stored tournaments
          myTournaments: state.myTournaments.slice(0, 20),
          selectedTournamentId: state.selectedTournamentId,
          filterCommunityId: state.filterCommunityId,
          filterStatus: state.filterStatus,
          filterGameId: state.filterGameId,
          filterFormat: state.filterFormat,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    {
      name: 'TournamentStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

/**
 * Selector for getting filtered tournaments
 */
export const selectFilteredTournaments = (state: TournamentStoreState) => {
  let filtered = state.tournaments;

  if (state.filterCommunityId) {
    filtered = filtered.filter((t) => t.communityId === state.filterCommunityId);
  }

  if (state.filterStatus) {
    filtered = filtered.filter((t) => t.status === state.filterStatus);
  }

  if (state.filterGameId) {
    filtered = filtered.filter((t) => t.gameId === state.filterGameId);
  }

  if (state.filterFormat) {
    filtered = filtered.filter((t) => t.format === state.filterFormat);
  }

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  }

  return filtered;
};

/**
 * Selector for getting open tournaments
 */
export const selectOpenTournaments = (state: TournamentStoreState) => {
  return state.tournaments.filter((t) => t.status === 'open');
};

/**
 * Selector for getting featured tournaments
 */
export const selectFeaturedTournaments = (state: TournamentStoreState) => {
  return state.tournaments.filter((t) => t.isFeatured);
};

/**
 * Selector for getting tournaments by community
 */
export const selectTournamentsByCommunity = (communityId: string) => {
  return (state: TournamentStoreState) => {
    return state.tournaments.filter((t) => t.communityId === communityId);
  };
};

/**
 * Selector for getting tournament status counts
 */
export const selectTournamentStats = (state: TournamentStoreState) => {
  const total = state.tournaments.length;
  const open = state.tournaments.filter((t) => t.status === 'open').length;
  const inProgress = state.tournaments.filter((t) => t.status === 'in_progress').length;
  const completed = state.tournaments.filter((t) => t.status === 'completed').length;
  const draft = state.tournaments.filter((t) => t.status === 'draft').length;
  const cancelled = state.tournaments.filter((t) => t.status === 'cancelled').length;

  return {
    total,
    open,
    inProgress,
    completed,
    draft,
    cancelled,
  };
};

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useTournamentStore;