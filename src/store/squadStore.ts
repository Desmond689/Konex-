/**
 * KONEX Squad Store
 */

import { create } from 'zustand';

export interface Squad {
  id: string;
  name: string;
  tag?: string;
  description?: string;
  gameId?: string;
  ownerId: string;
  memberCount: number;
  avatarUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

interface SquadState {
  mySquads: Squad[];
  activeSquad: Squad | null;
  isLoading: boolean;
  setMySquads: (squads: Squad[]) => void;
  setActiveSquad: (squad: Squad | null) => void;
  addSquad: (squad: Squad) => void;
  updateSquad: (id: string, patch: Partial<Squad>) => void;
  removeSquad: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useSquadStore = create<SquadState>((set) => ({
  mySquads: [],
  activeSquad: null,
  isLoading: false,
  setMySquads: (mySquads) => set({ mySquads }),
  setActiveSquad: (activeSquad) => set({ activeSquad }),
  addSquad: (squad) => set((s) => ({ mySquads: [squad, ...s.mySquads] })),
  updateSquad: (id, patch) =>
    set((s) => ({
      mySquads: s.mySquads.map((sq) => (sq.id === id ? { ...sq, ...patch } : sq)),
      activeSquad:
        s.activeSquad?.id === id ? { ...s.activeSquad, ...patch } : s.activeSquad,
    })),
  removeSquad: (id) =>
    set((s) => ({
      mySquads: s.mySquads.filter((sq) => sq.id !== id),
      activeSquad: s.activeSquad?.id === id ? null : s.activeSquad,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ mySquads: [], activeSquad: null, isLoading: false }),
}));

export default useSquadStore;
