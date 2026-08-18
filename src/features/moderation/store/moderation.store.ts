/**
 * KONEX Moderation Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for moderation state management
 * 
 * Usage:
 * const { reports, pendingReports, actions, setReports } = useModerationStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface ModerationReport {
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
  moderatorId: string | null;
  resolution: string | null;
}

export interface ModerationAction {
  id: string;
  userId: string;
  moderatorId: string;
  actionType: 'warning' | 'suspension' | 'ban' | 'unban';
  reason: string;
  details: string | null;
  duration: number | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface ModerationState {
  // State
  reports: ModerationReport[];
  pendingReports: ModerationReport[];
  actions: ModerationAction[];
  currentReport: ModerationReport | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  setReports: (reports: ModerationReport[]) => void;
  setPendingReports: (reports: ModerationReport[]) => void;
  setActions: (actions: ModerationAction[]) => void;
  setCurrentReport: (report: ModerationReport | null) => void;
  addReport: (report: ModerationReport) => void;
  updateReport: (reportId: string, updates: Partial<ModerationReport>) => void;
  addAction: (action: ModerationAction) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  clearReports: () => void;
  reset: () => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<ModerationState, 
  'setReports' | 'setPendingReports' | 'setActions' | 'setCurrentReport' | 
  'addReport' | 'updateReport' | 'addAction' | 'setLoading' | 'setRefreshing' | 
  'setSubmitting' | 'setError' | 'clearReports' | 'reset'
> = {
  reports: [],
  pendingReports: [],
  actions: [],
  currentReport: null,
  isLoading: false,
  isRefreshing: false,
  isSubmitting: false,
  error: null,
};

// ============================================
// 3. STORE
// ============================================

export const useModerationStore = create<ModerationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // REPORTS ACTIONS
      // ============================================

      setReports: (reports: ModerationReport[]) => {
        set({ reports });
        if (__DEV__) {
          console.log(`🛡️ Moderation reports updated: ${reports.length}`);
        }
      },

      setPendingReports: (pendingReports: ModerationReport[]) => {
        set({ pendingReports });
        if (__DEV__) {
          console.log(`🛡️ Pending reports updated: ${pendingReports.length}`);
        }
      },

      setActions: (actions: ModerationAction[]) => {
        set({ actions });
        if (__DEV__) {
          console.log(`🛡️ Moderation actions updated: ${actions.length}`);
        }
      },

      setCurrentReport: (currentReport: ModerationReport | null) => {
        set({ currentReport });
        if (__DEV__ && currentReport) {
          console.log(`🛡️ Current report set: ${currentReport.id}`);
        }
      },

      addReport: (report: ModerationReport) => {
        set((state) => ({
          reports: [report, ...state.reports],
          pendingReports: report.status === 'pending' || report.status === 'under_review'
            ? [report, ...state.pendingReports]
            : state.pendingReports,
        }));
        if (__DEV__) {
          console.log(`🛡️ Report added: ${report.id}`);
        }
      },

      updateReport: (reportId: string, updates: Partial<ModerationReport>) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, ...updates } : r
          ),
          pendingReports: state.pendingReports.map((r) =>
            r.id === reportId ? { ...r, ...updates } : r
          ),
          currentReport: state.currentReport?.id === reportId
            ? { ...state.currentReport, ...updates }
            : state.currentReport,
        }));
        if (__DEV__) {
          console.log(`🛡️ Report updated: ${reportId}`);
        }
      },

      addAction: (action: ModerationAction) => {
        set((state) => ({
          actions: [action, ...state.actions],
        }));
        if (__DEV__) {
          console.log(`🛡️ Moderation action added: ${action.id}`);
        }
      },

      // ============================================
      // LOADING STATES
      // ============================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setRefreshing: (isRefreshing: boolean) => {
        set({ isRefreshing });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setError: (error: string | null) => {
        set({ error });
        if (error && __DEV__) {
          console.error('❌ Moderation store error:', error);
        }
      },

      // ============================================
      // RESET / CLEAR
      // ============================================

      clearReports: () => {
        set({ reports: [], pendingReports: [], currentReport: null });
        if (__DEV__) {
          console.log('🧹 Moderation reports cleared');
        }
      },

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Moderation store reset');
        }
      },
    }),
    {
      name: '@konex/moderation',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reports: state.reports,
        pendingReports: state.pendingReports,
        actions: state.actions,
      }),
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectReports = (state: ModerationState) => state.reports;
export const selectPendingReports = (state: ModerationState) => state.pendingReports;
export const selectActions = (state: ModerationState) => state.actions;
export const selectCurrentReport = (state: ModerationState) => state.currentReport;
export const selectIsLoading = (state: ModerationState) => state.isLoading;
export const selectIsRefreshing = (state: ModerationState) => state.isRefreshing;
export const selectIsSubmitting = (state: ModerationState) => state.isSubmitting;
export const selectError = (state: ModerationState) => state.error;

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useModerationStore;