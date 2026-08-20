/**
 * KONEX Admin Store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalSquads: number;
  totalPosts: number;
  newPostsToday: number;
  pendingReports: number;
  activeSuspensions: number;
  totalBans: number;
  pendingAppeals: number;
}

export interface AdminUser {
  id: string;
  gamerTag: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  onlineStatus: string;
  createdAt: string;
  squadId: string | null;
  squadRole: string | null;
  isSuspended: boolean;
  isBanned: boolean;
  reportsCount: number;
  warningsCount: number;
  squad?: {
    id: string;
    name: string;
  };
}

export interface AdminSquad {
  id: string;
  name: string;
  tag: string | null;
  iconUrl: string | null;
  memberCount: number;
  onlineCount: number;
  status: string;
  createdAt: string;
  leader?: {
    id: string;
    gamerTag: string;
    username: string;
  };
  community?: {
    id: string;
    name: string;
    gameName: string;
  };
  reportsCount: number;
}

export interface AdminState {
  stats: AdminStats | null;
  users: AdminUser[];
  squads: AdminSquad[];
  isLoading: boolean;
  error: string | null;
  setStats: (stats: AdminStats) => void;
  setUsers: (users: AdminUser[]) => void;
  setSquads: (squads: AdminSquad[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  squads: [],
  isLoading: false,
  error: null,
  setStats: () => {},
  setUsers: () => {},
  setSquads: () => {},
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStats: (stats: AdminStats) => set({ stats }),
      setUsers: (users: AdminUser[]) => set({ users }),
      setSquads: (squads: AdminSquad[]) => set({ squads }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: '@konex/admin',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stats: state.stats,
        users: state.users,
        squads: state.squads,
      }),
    }
  )
);

export default useAdminStore;