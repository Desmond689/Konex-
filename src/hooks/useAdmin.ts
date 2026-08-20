/**
 * KONEX useAdmin Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides admin functionality
 * 
 * Usage:
 * const { stats, users, squads, getStats } = useAdmin();
 */

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../api/services/admin.service';
import { logger } from '../core/logger/logger.service';
import { useAdminStore } from '../store/adminStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';

export interface UseAdminOptions {
  autoFetch?: boolean;
}

export interface UseAdminReturn {
  stats: any | null;
  users: any[];
  squads: any[];
  isLoading: boolean;
  error: Error | null;
  getStats: () => Promise<void>;
  getUsers: (limit?: number, offset?: number) => Promise<void>;
  getSquads: (limit?: number, offset?: number) => Promise<void>;
  getUserDetails: (userId: string) => Promise<any>;
  getSquadDetails: (squadId: string) => Promise<any>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  deleteSquad: (squadId: string) => Promise<void>;
  getReports: (limit?: number, offset?: number) => Promise<any[]>;
  getAppeals: (limit?: number, offset?: number) => Promise<any[]>;
  createAnnouncement: (data: any) => Promise<any>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAdmin = (options: UseAdminOptions = {}): UseAdminReturn => {
  const { autoFetch = true } = options;
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH DATA
  // ============================================

  const getStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getDashboardStats();
      setStats(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Get admin stats error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setStats]);

  const getUsers = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getUsers(limit, offset);
      setUsers(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Get admin users error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUsers]);

  const getSquads = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.getSquads(limit, offset);
      setSquads(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Get admin squads error', error);
    } finally {
      setIsLoading(false);
    }
  }, [setSquads]);

  // ============================================
  // DETAILS
  // ============================================

  const getUserDetails = useCallback(async (userId: string) => {
    try {
      return await adminService.getUserDetails(userId);
    } catch (err) {
      logger.error('❌ Get user details error', err);
      throw err;
    }
  }, []);

  const getSquadDetails = useCallback(async (squadId: string) => {
    try {
      return await adminService.getSquadDetails(squadId);
    } catch (err) {
      logger.error('❌ Get squad details error', err);
      throw err;
    }
  }, []);

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.updateUserRole(userId, role);
      
      trackEvent('admin_update_user_role', { userId, role });
      showToast('User role updated', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Update user role error', error);
      showToast('Failed to update user role', 'error');
      throw err;
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
      showToast('Squad deleted', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete squad error', error);
      showToast('Failed to delete squad', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  // ============================================
  // REPORTS & APPEALS
  // ============================================

  const getReports = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      return await adminService.getReports(limit, offset);
    } catch (err) {
      logger.error('❌ Get admin reports error', err);
      return [];
    }
  }, []);

  const getAppeals = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      return await adminService.getAppeals(limit, offset);
    } catch (err) {
      logger.error('❌ Get admin appeals error', err);
      return [];
    }
  }, []);

  // ============================================
  // ANNOUNCEMENTS
  // ============================================

  const createAnnouncement = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await adminService.createAnnouncement(data);
      
      trackEvent('admin_create_announcement', { title: data.title });
      showToast('Announcement created', 'success');
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Create announcement error', error);
      showToast('Failed to create announcement', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await adminService.deleteAnnouncement(announcementId);
      
      trackEvent('admin_delete_announcement', { announcementId });
      showToast('Announcement deleted', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete announcement error', error);
      showToast('Failed to delete announcement', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent, showToast]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    await Promise.all([
      getStats(),
      getUsers(),
      getSquads(),
    ]);
  }, [getStats, getUsers, getSquads]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]);

  return {
    stats,
    users,
    squads,
    isLoading,
    error,
    getStats,
    getUsers,
    getSquads,
    getUserDetails,
    getSquadDetails,
    updateUserRole,
    deleteSquad,
    getReports,
    getAppeals,
    createAnnouncement,
    deleteAnnouncement,
    refresh,
  };
};

export default useAdmin;