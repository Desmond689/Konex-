/**
 * KONEX Admin Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for admin state management
 * 
 * Usage:
 * const { stats, users, squads, setStats, setUsers, setSquads } = useAdminStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

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
  onlineStatus: 'online' | 'away' | 'offline';
  createdAt: string;
  squadId: string | null;
  squadName: string | null;
  squadRole: string | null;
  isSuspended: boolean;
  isBanned: boolean;
  reportsCount: number;
  warningsCount: number;
}

export interface AdminSquad {
  id: string;
  name: string;
  tag: string | null;
  iconUrl: string | null;
  memberCount: number;
  onlineCount: number;
  status: 'active' | 'pending_deletion' | 'deleted' | 'suspended';
  createdAt: string;
  leaderId: string;
  leaderName: string;
  communityId: string;
  communityName: string;
  reportsCount: number;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string | null;
  reportedUserName: string | null;
  reportedPostId: string | null;
  reportedCommentId: string | null;
  reportedSquadId: string | null;
  reason: string;
  details: string | null;
  evidenceUrls: string[];
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface AdminAppeal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  moderationActionId: string;
  actionType: 'warning' | 'suspension' | 'ban';
  reason: string;
  details: string;
  evidence: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'community' | 'event' | 'maintenance' | 'general';
  target: 'all' | 'specific_squad' | 'specific_game';
  targetId?: string;
  publishedAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface AdminState {
  // State
  stats: AdminStats | null;
  users: AdminUser[];
  squads: AdminSquad[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Stats Actions
  setStats: (stats: AdminStats) => void;
  clearStats: () => void;
  
  // User Actions
  setUsers: (users: AdminUser[]) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  removeUser: (userId: string) => void;
  clearUsers: () => void;
  
  // Squad Actions
  setSquads: (squads: AdminSquad[]) => void;
  addSquad: (squad: AdminSquad) => void;
  updateSquad: (squadId: string, updates: Partial<AdminSquad>) => void;
  removeSquad: (squadId: string) => void;
  clearSquads: () => void;
  
  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: () => void;
  
  // Reset
  reset: () => void;
  clearAll: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<AdminState, 
  'setStats' | 'clearStats' | 'setUsers' | 'addUser' | 'updateUser' | 'removeUser' | 'clearUsers' |
  'setSquads' | 'addSquad' | 'updateSquad' | 'removeSquad' | 'clearSquads' |
  'setLoading' | 'setError' | 'setLastUpdated' | 'reset' | 'clearAll'
> = {
  stats: null,
  users: [],
  squads: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// ============================================
// 3. STORE
// ============================================

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // STATS ACTIONS
      // ============================================

      setStats: (stats: AdminStats) => {
        set({ stats, lastUpdated: new Date().toISOString() });
        if (__DEV__) {
          console.log('📊 Admin stats updated');
        }
      },

      clearStats: () => {
        set({ stats: null });
        if (__DEV__) {
          console.log('📊 Admin stats cleared');
        }
      },

      // ============================================
      // USER ACTIONS
      // ============================================

      setUsers: (users: AdminUser[]) => {
        set({ users });
        if (__DEV__) {
          console.log(`👤 Admin users updated: ${users.length} users`);
        }
      },

      addUser: (user: AdminUser) => {
        set((state) => ({
          users: [...state.users, user],
        }));
        if (__DEV__) {
          console.log(`👤 Admin user added: ${user.gamerTag}`);
        }
      },

      updateUser: (userId: string, updates: Partial<AdminUser>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...updates } : u
          ),
        }));
        if (__DEV__) {
          console.log(`👤 Admin user updated: ${userId}`);
        }
      },

      removeUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));
        if (__DEV__) {
          console.log(`👤 Admin user removed: ${userId}`);
        }
      },

      clearUsers: () => {
        set({ users: [] });
        if (__DEV__) {
          console.log('👤 Admin users cleared');
        }
      },

      // ============================================
      // SQUAD ACTIONS
      // ============================================

      setSquads: (squads: AdminSquad[]) => {
        set({ squads });
        if (__DEV__) {
          console.log(`🛡️ Admin squads updated: ${squads.length} squads`);
        }
      },

      addSquad: (squad: AdminSquad) => {
        set((state) => ({
          squads: [...state.squads, squad],
        }));
        if (__DEV__) {
          console.log(`🛡️ Admin squad added: ${squad.name}`);
        }
      },

      updateSquad: (squadId: string, updates: Partial<AdminSquad>) => {
        set((state) => ({
          squads: state.squads.map((s) =>
            s.id === squadId ? { ...s, ...updates } : s
          ),
        }));
        if (__DEV__) {
          console.log(`🛡️ Admin squad updated: ${squadId}`);
        }
      },

      removeSquad: (squadId: string) => {
        set((state) => ({
          squads: state.squads.filter((s) => s.id !== squadId),
        }));
        if (__DEV__) {
          console.log(`🛡️ Admin squad removed: ${squadId}`);
        }
      },

      clearSquads: () => {
        set({ squads: [] });
        if (__DEV__) {
          console.log('🛡️ Admin squads cleared');
        }
      },

      // ============================================
      // LOADING & ERROR
      // ============================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Admin store error:', error);
        }
      },

      setLastUpdated: () => {
        set({ lastUpdated: new Date().toISOString() });
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Admin store reset');
        }
      },

      clearAll: () => {
        set({
          stats: null,
          users: [],
          squads: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
        });
        if (__DEV__) {
          console.log('🧹 Admin store cleared');
        }
      },
    }),
    {
      name: '@konex/admin',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stats: state.stats,
        users: state.users,
        squads: state.squads,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectAdminStats = (state: AdminState) => state.stats;
export const selectAdminUsers = (state: AdminState) => state.users;
export const selectAdminSquads = (state: AdminState) => state.squads;
export const selectAdminLoading = (state: AdminState) => state.isLoading;
export const selectAdminError = (state: AdminState) => state.error;
export const selectAdminLastUpdated = (state: AdminState) => state.lastUpdated;

export const selectPendingReportsCount = (state: AdminState) => {
  // This would need to be calculated from reports
  return 0;
};

export const selectPendingAppealsCount = (state: AdminState) => {
  // This would need to be calculated from appeals
  return 0;
};

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useAdminStore;