/**
 * KONEX Moderation Store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ModerationReport {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  reportedPostId: string | null;
  reportedCommentId: string | null;
  reportedSquadId: string | null;
  reportedMessageId: string | null;
  reason: string;
  details: string | null;
  evidenceUrls: string[];
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  resolution: string | null;
  moderatorId: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    gamerTag: string;
    username: string;
  };
  reportedUser?: {
    id: string;
    gamerTag: string;
    username: string;
  };
  moderator?: {
    id: string;
    gamerTag: string;
    username: string;
  };
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
  moderator?: {
    id: string;
    gamerTag: string;
    username: string;
  };
}

export interface ModerationState {
  reports: ModerationReport[];
  actions: ModerationAction[];
  currentReport: ModerationReport | null;
  pendingReports: ModerationReport[];
  isLoading: boolean;
  error: string | null;
  setReports: (reports: ModerationReport[]) => void;
  setActions: (actions: ModerationAction[]) => void;
  setCurrentReport: (report: ModerationReport | null) => void;
  setPendingReports: (reports: ModerationReport[]) => void;
  addReport: (report: ModerationReport) => void;
  updateReport: (reportId: string, updates: Partial<ModerationReport>) => void;
  addAction: (action: ModerationAction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ModerationState = {
  reports: [],
  actions: [],
  currentReport: null,
  pendingReports: [],
  isLoading: false,
  error: null,
  setReports: () => {},
  setActions: () => {},
  setCurrentReport: () => {},
  setPendingReports: () => {},
  addReport: () => {},
  updateReport: () => {},
  addAction: () => {},
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
};

export const useModerationStore = create<ModerationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setReports: (reports: ModerationReport[]) => set({ reports }),
      setActions: (actions: ModerationAction[]) => set({ actions }),
      setCurrentReport: (report: ModerationReport | null) => set({ currentReport: report }),
      setPendingReports: (pendingReports: ModerationReport[]) => set({ pendingReports }),
      addReport: (report: ModerationReport) => {
        set((state) => ({
          reports: [report, ...state.reports],
          pendingReports: report.status === 'pending' ? [report, ...state.pendingReports] : state.pendingReports,
        }));
      },
      updateReport: (reportId: string, updates: Partial<ModerationReport>) => {
        set((state) => ({
          reports: state.reports.map((r) => (r.id === reportId ? { ...r, ...updates } : r)),
          pendingReports: state.pendingReports.map((r) =>
            r.id === reportId ? { ...r, ...updates } : r
          ),
          currentReport: state.currentReport?.id === reportId ? { ...state.currentReport, ...updates } : state.currentReport,
        }));
      },
      addAction: (action: ModerationAction) => {
        set((state) => ({
          actions: [action, ...state.actions],
        }));
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: '@konex/moderation',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reports: state.reports,
        actions: state.actions,
        pendingReports: state.pendingReports,
      }),
    }
  )
);

export default useModerationStore;