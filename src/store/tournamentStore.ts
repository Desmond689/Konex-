/**
 * KONEX Tournament Store
 */

import { create } from 'zustand';

export interface Tournament {
  id: string;
  name: string;
  gameId?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startAt: string;
  maxTeams: number;
  teamCount: number;
  prizePool?: string;
  createdAt: string;
}

interface TournamentState {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  isLoading: boolean;
  setTournaments: (t: Tournament[]) => void;
  setActiveTournament: (t: Tournament | null) => void;
  updateTournament: (id: string, patch: Partial<Tournament>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournaments: [],
  activeTournament: null,
  isLoading: false,
  setTournaments: (tournaments) => set({ tournaments }),
  setActiveTournament: (activeTournament) => set({ activeTournament }),
  updateTournament: (id, patch) =>
    set((s) => ({
      tournaments: s.tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      activeTournament:
        s.activeTournament?.id === id
          ? { ...s.activeTournament, ...patch }
          : s.activeTournament,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ tournaments: [], activeTournament: null, isLoading: false }),
}));

export default useTournamentStore;
