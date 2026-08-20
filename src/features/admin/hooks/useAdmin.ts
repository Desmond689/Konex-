// @ts-nocheck
/**
 * KONEX useAdmin Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides admin functionality including stats, user management,
 * squad management, reports, appeals, and announcements.
 * 
 * Usage:
 * const { stats, users, getStats, banUser, createAnnouncement } = useAdmin();
 */

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../../api/services/admin.service';
import { appealService } from '../../../api/services/appeal.service';
import { moderationService } from '../../../api/services/moderation.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminStore } from '../../../store/adminStore';
import { useUIStore } from '../../../store/uiStore';

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

export interface UseAdminReturn {
  // State
  stats: AdminStats | null;
  users: AdminUser[];
  squads: AdminSquad[];
  reports: AdminReport[];
  appeals: AdminAppeal[];
  announcements: AdminAnnouncement[];
  isLoading: boolean;
  error: string | null;
  
  // Stats
  getStats: () => Promise<void>;
  
  // User Management
  getUsers: (limit?: number, offset?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  getUserDetails: (userId: string) => Promise<any>;
  warnUser: (userId: string, reason: string) => Promise<void>;
  suspendUser: (userId: string, duration: number, reason: string) => Promise<void>;
  banUser: (userId: string, reason: string) => Promise<void>;
  unbanUser: (userId: string, reason: string) => Promise<void>;
  
  // Squad Management
  getSquads: (limit?: number, offset?: number) => Promise<void>;
  searchSquads: (query: string) => Promise<void>;
  getSquadDetails: (squadId: string) => Promise<any>;
  suspendSquad: (squadId: string, reason: string) => Promise<void>;
  restoreSquad: (squadId: string) => Promise<void>;
  deleteSquad: (squadId: string) => Promise<void>;
  
  // Reports
  getReports: (limit?: number, offset?: number) => Promise<void>;
  getPendingReports: () => Promise<void>;
  resolveReport: (reportId: string, decision: string, notes?: string) => Promise<void>;
  dismissReport: (reportId: string, reason: string) => Promise<void>;
  
  // Appeals
  getAppeals: (limit?: number, offset?: number) => Promise<void>;
  getPendingAppeals: () => Promise<void>;
  reviewAppeal: (appealId: string, decision: 'approved' | 'denied', notes?: string) => Promise<void>;
  
  // Announcements
  getAnnouncements: (limit?: number, offset?: number) => Promise<void>;
  createAnnouncement: (data: Omit<AdminAnnouncement, 'id' | 'publishedAt' | 'createdBy'>) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  toggleAnnouncementStatus: (announcementId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  refresh: () => Promise<void>;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useAdmin = (): UseAdminReturn => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    stats,
    users,
    squads,
    setStats,
    setUsers,
    setSquads,
  } = useAdminStore();

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 3. STATS
  // ============================================

  const getStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getDashboardStats();
      setStats(result);

      trackEvent('admin_stats_view');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin stats error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setStats, trackEvent]);

  // ============================================
  // 4. USER MANAGEMENT
  // ============================================

  const getUsers = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getUsers(limit, offset);
      setUsers(result || []);

      trackEvent('admin_users_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin users error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUsers, trackEvent]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!query || query.trim().length === 0) {
        await getUsers();
        return;
      }

      const result = await adminService.searchUsers(query);
      setUsers(result || []);

      trackEvent('admin_users_search', { query, count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Search admin users error', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUsers, setUsers, trackEvent]);

  const getUserDetails = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getUserDetails(userId);
      
      trackEvent('admin_user_details_view', { userId });
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get user details error', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const warnUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.warnUser(userId, user?.id || '', reason);
      
      trackEvent('admin_warn_user', { userId, moderatorId: user?.id });
      showToast('User warned successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Warn user error', error);
      showToast('Failed to warn user', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const suspendUser = useCallback(async (userId: string, duration: number, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.suspendUser(userId, user?.id || '', duration, reason);
      
      trackEvent('admin_suspend_user', { userId, duration, moderatorId: user?.id });
      showToast(`User suspended for ${duration} days`, 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Suspend user error', error);
      showToast('Failed to suspend user', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const banUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.banUser(userId, user?.id || '', reason);
      
      trackEvent('admin_ban_user', { userId, moderatorId: user?.id });
      showToast('User banned successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Ban user error', error);
      showToast('Failed to ban user', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const unbanUser = useCallback(async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.unbanUser(userId, user?.id || '', reason);
      
      trackEvent('admin_unban_user', { userId, moderatorId: user?.id });
      showToast('User unbanned successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Unban user error', error);
      showToast('Failed to unban user', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  // ============================================
  // 5. SQUAD MANAGEMENT
  // ============================================

  const getSquads = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getSquads(limit, offset);
      setSquads(result || []);

      trackEvent('admin_squads_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin squads error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setSquads, trackEvent]);

  const searchSquads = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!query || query.trim().length === 0) {
        await getSquads();
        return;
      }

      const result = await adminService.searchSquads(query);
      setSquads(result || []);

      trackEvent('admin_squads_search', { query, count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Search admin squads error', error);
    } finally {
      setIsLoading(false);
    }
  }, [getSquads, setSquads, trackEvent]);

  const getSquadDetails = useCallback(async (squadId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getSquadDetails(squadId);
      
      trackEvent('admin_squad_details_view', { squadId });
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get squad details error', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const suspendSquad = useCallback(async (squadId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.suspendSquad(squadId, reason);
      
      trackEvent('admin_suspend_squad', { squadId });
      showToast('Squad suspended successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Suspend squad error', error);
      showToast('Failed to suspend squad', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  const restoreSquad = useCallback(async (squadId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.restoreSquad(squadId);
      
      trackEvent('admin_restore_squad', { squadId });
      showToast('Squad restored successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Restore squad error', error);
      showToast('Failed to restore squad', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  const deleteSquad = useCallback(async (squadId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.deleteSquad(squadId);
      
      trackEvent('admin_delete_squad', { squadId });
      showToast('Squad deleted successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Delete squad error', error);
      showToast('Failed to delete squad', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  // ============================================
  // 6. REPORTS
  // ============================================

  const getReports = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getReports(limit, offset);
      setReports(result || []);

      trackEvent('admin_reports_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin reports error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const getPendingReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getModerationQueue();
      setReports(result || []);

      trackEvent('admin_pending_reports_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get pending reports error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const resolveReport = useCallback(async (reportId: string, decision: string, notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.resolveReport(reportId, user?.id || '', decision, notes);
      
      // Refresh reports
      await getPendingReports();
      
      trackEvent('admin_resolve_report', { reportId, decision });
      showToast('Report resolved successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Resolve report error', error);
      showToast('Failed to resolve report', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, getPendingReports, trackEvent, showToast]);

  const dismissReport = useCallback(async (reportId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderationService.dismissReport(reportId, user?.id || '', reason);
      
      // Refresh reports
      await getPendingReports();
      
      trackEvent('admin_dismiss_report', { reportId });
      showToast('Report dismissed successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Dismiss report error', error);
      showToast('Failed to dismiss report', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, getPendingReports, trackEvent, showToast]);

  // ============================================
  // 7. APPEALS
  // ============================================

  const getAppeals = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getAppeals(limit, offset);
      setAppeals(result || []);

      trackEvent('admin_appeals_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin appeals error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const getPendingAppeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await appealService.getPendingAppeals();
      setAppeals(result || []);

      trackEvent('admin_pending_appeals_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get pending appeals error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const reviewAppeal = useCallback(async (appealId: string, decision: 'approved' | 'denied', notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await appealService.reviewAppeal(appealId, user?.id || '', decision, notes);
      
      // Refresh appeals
      await getPendingAppeals();
      
      trackEvent('admin_review_appeal', { appealId, decision });
      showToast(`Appeal ${decision} successfully`, 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Review appeal error', error);
      showToast('Failed to review appeal', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, getPendingAppeals, trackEvent, showToast]);

  // ============================================
  // 8. ANNOUNCEMENTS
  // ============================================

  const getAnnouncements = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getAnnouncements(limit, offset);
      setAnnouncements(result || []);

      trackEvent('admin_announcements_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Get admin announcements error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const createAnnouncement = useCallback(async (data: Omit<AdminAnnouncement, 'id' | 'publishedAt' | 'createdBy'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.createAnnouncement({
        ...data,
        created_by: user?.id || '',
      });
      
      setAnnouncements(prev => [result, ...prev]);
      
      trackEvent('admin_create_announcement', { title: data.title });
      showToast('Announcement created successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Create announcement error', error);
      showToast('Failed to create announcement', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, showToast]);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.deleteAnnouncement(announcementId);
      
      setAnnouncements(prev => prev.filter((a) => a.id !== announcementId));
      
      trackEvent('admin_delete_announcement', { announcementId });
      showToast('Announcement deleted successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Delete announcement error', error);
      showToast('Failed to delete announcement', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  const toggleAnnouncementStatus = useCallback(async (announcementId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const announcement = announcements.find((a) => a.id === announcementId);
      if (!announcement) throw new Error('Announcement not found');

      await adminService.toggleAnnouncementStatus(announcementId);
      
      setAnnouncements(prev =>
        prev.map((a) =>
          a.id === announcementId ? { ...a, isActive: !a.isActive } : a
        )
      );
      
      trackEvent('admin_toggle_announcement', {
        announcementId,
        isActive: !announcement.isActive,
      });
      showToast('Announcement status updated', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      logger.error('❌ Toggle announcement error', error);
      showToast('Failed to update announcement status', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [announcements, trackEvent, showToast]);

  // ============================================
  // 9. UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      getStats(),
      getUsers(),
      getSquads(),
      getPendingReports(),
      getPendingAppeals(),
      getAnnouncements(),
    ]);
  }, [getStats, getUsers, getSquads, getPendingReports, getPendingAppeals, getAnnouncements]);

  // ============================================
  // 10. EFFECTS
  // ============================================

  useEffect(() => {
    // Initial load
    refresh();
  }, []);

  // ============================================
  // 11. RETURN
  // ============================================

  return {
    // State
    stats,
    users,
    squads,
    reports,
    appeals,
    announcements,
    isLoading,
    error,

    // Stats
    getStats,

    // User Management
    getUsers,
    searchUsers,
    getUserDetails,
    warnUser,
    suspendUser,
    banUser,
    unbanUser,

    // Squad Management
    getSquads,
    searchSquads,
    getSquadDetails,
    suspendSquad,
    restoreSquad,
    deleteSquad,

    // Reports
    getReports,
    getPendingReports,
    resolveReport,
    dismissReport,

    // Appeals
    getAppeals,
    getPendingAppeals,
    reviewAppeal,

    // Announcements
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus,

    // Utility
    clearError,
    refresh,
  };
};

export default useAdmin;