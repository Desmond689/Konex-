/**
 * KONEX useModeration Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides moderation management
 * 
 * Usage:
 * const { reports, queue, resolveReport } = useModeration();
 */

import { useCallback, useEffect, useState } from 'react';
import { moderationService } from '../api/services/moderation.service';
import { logger } from '../core/logger/logger.service';
import { useModerationStore } from '../store/moderationStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseModerationOptions {
  autoFetch?: boolean;
  initialLimit?: number;
}

export interface UseModerationReturn {
  reports: any[];
  pendingReports: any[];
  actions: any[];
  currentReport: any | null;
  isLoading: boolean;
  error: Error | null;
  fetchReports: () => Promise<void>;
  fetchPendingReports: () => Promise<void>;
  fetchActions: () => Promise<void>;
  resolveReport: (reportId: string, decision: string, notes?: string) => Promise<void>;
  dismissReport: (reportId: string, reason: string) => Promise<void>;
  warnUser: (userId: string, reason: string) => Promise<void>;
  suspendUser: (userId: string, duration: number, reason: string) => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<void>;
  unbanUser: (userId: string, reason: string) => Promise<void>;
  getReport: (reportId: string) => Promise<any>;
  getStats: () => Promise<any>;
  refresh: () => Promise<void>;
}

export const useModeration = (options: UseModerationOptions = {}): UseModerationReturn => {
  const {
    autoFetch = true,
    initialLimit = 20,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    reports,
    pendingReports,
    actions,
    currentReport,
    setReports,
    setPendingReports,
    setActions,
    setCurrentReport,
    addReport,
    updateReport,
    addAction,
  } = useModerationStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getReports(initialLimit);
      setReports(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch reports error', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, setReports]);

  const fetchPendingReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getModerationQueue(initialLimit);
      setPendingReports(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch pending reports error', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, setPendingReports]);

  const fetchActions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getModerationActions(initialLimit);
      setActions(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch actions error', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, setActions]);

  // ============================================
  // REPORT OPERATIONS
  // ============================================

  const resolveReport = useCallback(async (reportId: string, decision: string, notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.resolveReport(reportId, user?.id || '', decision, notes);
      updateReport(reportId, { status: 'resolved', resolution: decision, moderatorId: user?.id });

      trackEvent('moderation_resolve_report', { reportId, decision });
      showToast('Report resolved', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Resolve report error', error);
      showToast('Failed to resolve report', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateReport, trackEvent, showToast]);

  const dismissReport = useCallback(async (reportId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.dismissReport(reportId, user?.id || '', reason);
      updateReport(reportId, { status: 'dismissed', resolution: `Dismissed: ${reason}`, moderatorId: user?.id });

      trackEvent('moderation_dismiss_report', { reportId, reason });
      showToast('Report dismissed', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Dismiss report error', error);
      showToast('Failed to dismiss report', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateReport, trackEvent, showToast]);

  const getReport = useCallback(async (reportId: string) => {
    try {
      const result = await moderationService.getReport(reportId);
      setCurrentReport(result);
      return result;
    } catch (err) {
      logger.error('❌ Get report error', err);
      throw err;
    }
  }, [setCurrentReport]);

  // ============================================
  // USER MODERATION
  // ============================================

  const warnUser = useCallback(async (targetUserId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.warnUser(targetUserId, user?.id || '', reason);
      
      addAction({
        userId: targetUserId,
        moderatorId: user?.id,
        actionType: 'warning',
        reason,
        createdAt: new Date().toISOString(),
      });

      trackEvent('moderation_warn_user', { userId: targetUserId });
      showToast('User warned', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Warn user error', error);
      showToast('Failed to warn user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, addAction, trackEvent, showToast]);

  const suspendUser = useCallback(async (targetUserId: string, duration: number, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.suspendUser(targetUserId, user?.id || '', duration, reason);
      
      addAction({
        userId: targetUserId,
        moderatorId: user?.id,
        actionType: 'suspension',
        reason,
        duration,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      });

      trackEvent('moderation_suspend_user', { userId: targetUserId, duration });
      showToast(`User suspended for ${duration} days`, 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Suspend user error', error);
      showToast('Failed to suspend user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, addAction, trackEvent, showToast]);

  const banUser = useCallback(async (targetUserId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.banUser(targetUserId, user?.id || '', reason);
      
      addAction({
        userId: targetUserId,
        moderatorId: user?.id,
        actionType: 'ban',
        reason,
        createdAt: new Date().toISOString(),
      });

      trackEvent('moderation_ban_user', { userId: targetUserId });
      showToast('User banned', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Ban user error', error);
      showToast('Failed to ban user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, addAction, trackEvent, showToast]);

  const unbanUser = useCallback(async (targetUserId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.unbanUser(targetUserId, user?.id || '', reason);
      
      addAction({
        userId: targetUserId,
        moderatorId: user?.id,
        actionType: 'unban',
        reason,
        createdAt: new Date().toISOString(),
      });

      trackEvent('moderation_unban_user', { userId: targetUserId });
      showToast('User unbanned', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Unban user error', error);
      showToast('Failed to unban user', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, addAction, trackEvent, showToast]);

  // ============================================
  // STATS
  // ============================================

  const getStats = useCallback(async () => {
    try {
      return await moderationService.getModerationStats();
    } catch (err) {
      logger.error('❌ Get moderation stats error', err);
      return null;
    }
  }, []);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchReports(),
      fetchPendingReports(),
      fetchActions(),
    ]);
  }, [fetchReports, fetchPendingReports, fetchActions]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]);

  return {
    reports,
    pendingReports,
    actions,
    currentReport,
    isLoading,
    error,
    fetchReports,
    fetchPendingReports,
    fetchActions,
    resolveReport,
    dismissReport,
    warnUser,
    suspendUser,
    banUser,
    unbanUser,
    getReport,
    getStats,
    refresh,
  };
};

export default useModeration;