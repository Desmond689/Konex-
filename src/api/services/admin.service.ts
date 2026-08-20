/**
 * KONEX Admin Service
 * Billion Dollar Code - Production Ready
 * 
 * Admin service for managing users, squads, reports, and moderation
 * 
 * Usage:
 * import { adminService } from '@api/services/admin.service';
 */

import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

// ============================================
// 1. TYPES
// ============================================

export interface DashboardStats {
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
  gamer_tag: string;
  username: string;
  email: string;
  avatar_url: string | null;
  online_status: string;
  created_at: string;
  squad_id: string | null;
  squad_role: string | null;
  is_suspended: boolean;
  is_banned: boolean;
  reports_count: number;
  warnings_count: number;
}

export interface AdminSquad {
  id: string;
  name: string;
  tag: string;
  icon_url: string | null;
  member_count: number;
  online_count: number;
  status: string;
  created_at: string;
  leader: {
    id: string;
    gamer_tag: string;
    username: string;
  };
  community: {
    id: string;
    name: string;
    game_name: string;
  };
}

export interface AdminReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: {
    id: string;
    gamer_tag: string;
    username: string;
  };
  reported_user: {
    id: string;
    gamer_tag: string;
    username: string;
  };
  moderator: {
    id: string;
    gamer_tag: string;
    username: string;
  } | null;
}

export interface AdminAppeal {
  id: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    gamer_tag: string;
    username: string;
    email: string;
  };
  moderator: {
    id: string;
    gamer_tag: string;
    username: string;
  } | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModerationLog {
  id: string;
  action_type: string;
  reason: string;
  created_at: string;
  user: {
    id: string;
    gamer_tag: string;
    username: string;
  };
  moderator: {
    id: string;
    gamer_tag: string;
    username: string;
  };
}

// ============================================
// 2. INTERFACE
// ============================================

export interface IAdminService {
  getDashboardStats(): Promise<DashboardStats>;
  getUsers(limit?: number, offset?: number): Promise<AdminUser[]>;
  getUserDetails(userId: string): Promise<any>;
  updateUserRole(userId: string, role: string): Promise<void>;
  toggleUserSuspension(userId: string, suspend: boolean): Promise<void>;
  toggleUserBan(userId: string, ban: boolean): Promise<void>;
  getSquads(limit?: number, offset?: number): Promise<AdminSquad[]>;
  getSquadDetails(squadId: string): Promise<any>;
  deleteSquad(squadId: string): Promise<void>;
  getReports(limit?: number, offset?: number): Promise<AdminReport[]>;
  updateReportStatus(reportId: string, status: string): Promise<void>;
  getAppeals(limit?: number, offset?: number): Promise<AdminAppeal[]>;
  updateAppealStatus(appealId: string, status: string): Promise<void>;
  createAnnouncement(data: Partial<Announcement>): Promise<Announcement>;
  getAnnouncements(limit?: number, offset?: number): Promise<Announcement[]>;
  deleteAnnouncement(announcementId: string): Promise<void>;
  getModerationLogs(limit?: number, offset?: number): Promise<ModerationLog[]>;
}

// ============================================
// 3. SERVICE IMPLEMENTATION
// ============================================

class AdminService implements IAdminService {
  // ============================================
  // DASHBOARD STATS
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      logger.info('👑 Fetching dashboard stats');

      const db = supabase as any;

      const [
        totalUsersResult,
        activeUsersResult,
        totalSquadsResult,
        totalPostsResult,
        pendingReportsResult,
        activeSuspensionsResult,
        totalBansResult,
        pendingAppealsResult,
      ] = await Promise.all([
        db.from('users').select('id', { count: 'exact', head: true }),
        db.from('users').select('id', { count: 'exact', head: true }).eq('online_status', 'online'),
        db.from('squads').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        db.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        db.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('users').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
        db.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
        db.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayUsers } = await db
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: todayPosts } = await db
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return {
        totalUsers: totalUsersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        newUsersToday: todayUsers || 0,
        totalSquads: totalSquadsResult.count || 0,
        totalPosts: totalPostsResult.count || 0,
        newPostsToday: todayPosts || 0,
        pendingReports: pendingReportsResult.count || 0,
        activeSuspensions: activeSuspensionsResult.count || 0,
        totalBans: totalBansResult.count || 0,
        pendingAppeals: pendingAppealsResult.count || 0,
      };
    } catch (error) {
      logger.error('❌ Get dashboard stats error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Stats fetch failed',
        'Failed to fetch dashboard statistics. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getUsers(limit: number = 20, offset: number = 0): Promise<AdminUser[]> {
    try {
      logger.info('👑 Fetching users', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('users')
        .select(`
          id,
          gamer_tag,
          username,
          email,
          avatar_url,
          online_status,
          created_at,
          squad_id,
          squad_role,
          is_suspended,
          is_banned,
          reports_count,
          warnings_count
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get users error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Users fetch failed',
        'Failed to fetch users. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    try {
      logger.info('👑 Fetching user details', { userId });

      const db = supabase as any;

      const { data, error } = await db
        .from('users')
        .select(`
          *,
          squad:squads (
            id,
            name,
            icon_url
          ),
          moderation_history:moderation_actions (
            id,
            action_type,
            reason,
            created_at,
            moderator:users!moderator_id (
              id,
              gamer_tag,
              username
            )
          ),
          reports_received:reports (
            id,
            reason,
            status,
            created_at,
            reporter:users!reporter_id (
              id,
              gamer_tag,
              username
            )
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('❌ Get user details error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'User details fetch failed',
        'Failed to fetch user details. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      logger.info('👑 Updating user role', { userId, role });

      const db = supabase as any;

      const { error } = await db
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      logger.info('✅ User role updated', { userId, role });
    } catch (error) {
      logger.error('❌ Update user role error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Role update failed',
        'Failed to update user role. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async toggleUserSuspension(userId: string, suspend: boolean): Promise<void> {
    try {
      logger.info('👑 Toggling user suspension', { userId, suspend });

      const db = supabase as any;

      const { error } = await db
        .from('users')
        .update({ is_suspended: suspend })
        .eq('id', userId);

      if (error) throw error;
      logger.info('✅ User suspension toggled', { userId, suspend });
    } catch (error) {
      logger.error('❌ Toggle suspension error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Suspension toggle failed',
        'Failed to toggle user suspension. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async toggleUserBan(userId: string, ban: boolean): Promise<void> {
    try {
      logger.info('👑 Toggling user ban', { userId, ban });

      const db = supabase as any;

      const { error } = await db
        .from('users')
        .update({ is_banned: ban })
        .eq('id', userId);

      if (error) throw error;
      logger.info('✅ User ban toggled', { userId, ban });
    } catch (error) {
      logger.error('❌ Toggle ban error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Ban toggle failed',
        'Failed to toggle user ban. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  // ============================================
  // SQUAD MANAGEMENT
  // ============================================

  async getSquads(limit: number = 20, offset: number = 0): Promise<AdminSquad[]> {
    try {
      logger.info('👑 Fetching squads', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('squads')
        .select(`
          id,
          name,
          tag,
          icon_url,
          member_count,
          online_count,
          status,
          created_at,
          leader:users!leader_id (
            id,
            gamer_tag,
            username
          ),
          community:communities (
            id,
            name,
            game_name
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get squads error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squads fetch failed',
        'Failed to fetch squads. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getSquadDetails(squadId: string): Promise<any> {
    try {
      logger.info('👑 Fetching squad details', { squadId });

      const db = supabase as any;

      const { data, error } = await db
        .from('squads')
        .select(`
          *,
          leader:users!leader_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          community:communities (
            id,
            name,
            game_name
          ),
          members:squad_memberships (
            id,
            role,
            joined_at,
            user:users (
              id,
              gamer_tag,
              username,
              avatar_url,
              online_status
            )
          ),
          reports:reports (
            id,
            reason,
            status,
            created_at
          )
        `)
        .eq('id', squadId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('❌ Get squad details error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad details fetch failed',
        'Failed to fetch squad details. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteSquad(squadId: string): Promise<void> {
    try {
      logger.info('👑 Deleting squad', { squadId });

      const db = supabase as any;

      // Clear member squad references BEFORE deleting the squad
      const { error: memberError } = await db
        .from('users')
        .update({
          squad_id: null,
          squad_role: null,
        })
        .eq('squad_id', squadId);

      if (memberError) throw memberError;

      const { error } = await db
        .from('squads')
        .delete()
        .eq('id', squadId);

      if (error) throw error;
      logger.info('✅ Squad deleted', { squadId });
    } catch (error) {
      logger.error('❌ Delete squad error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad deletion failed',
        'Failed to delete squad. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  // ============================================
  // REPORT MANAGEMENT
  // ============================================

  async getReports(limit: number = 20, offset: number = 0): Promise<AdminReport[]> {
    try {
      logger.info('👑 Fetching reports', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id (
            id,
            gamer_tag,
            username
          ),
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get reports error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Reports fetch failed',
        'Failed to fetch reports. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    try {
      logger.info('👑 Updating report status', { reportId, status });

      const db = supabase as any;

      const { error } = await db
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;
      logger.info('✅ Report status updated', { reportId, status });
    } catch (error) {
      logger.error('❌ Update report status error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report status update failed',
        'Failed to update report status. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  // ============================================
  // APPEAL MANAGEMENT
  // ============================================

  async getAppeals(limit: number = 20, offset: number = 0): Promise<AdminAppeal[]> {
    try {
      logger.info('👑 Fetching appeals', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('appeals')
        .select(`
          *,
          user:users!user_id (
            id,
            gamer_tag,
            username,
            email
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get appeals error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Appeals fetch failed',
        'Failed to fetch appeals. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateAppealStatus(appealId: string, status: string): Promise<void> {
    try {
      logger.info('👑 Updating appeal status', { appealId, status });

      const db = supabase as any;

      const { error } = await db
        .from('appeals')
        .update({ status })
        .eq('id', appealId);

      if (error) throw error;
      logger.info('✅ Appeal status updated', { appealId, status });
    } catch (error) {
      logger.error('❌ Update appeal status error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Appeal status update failed',
        'Failed to update appeal status. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  // ============================================
  // ANNOUNCEMENT MANAGEMENT
  // ============================================

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    try {
      logger.info('📢 Creating announcement', { title: data?.title });

      const db = supabase as any;

      const { data: announcement, error } = await db
        .from('announcements')
        .insert({
          ...data,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!announcement) {
        throw new Error('Announcement was not returned after creation');
      }

      logger.info('✅ Announcement created', { announcementId: announcement.id });
      return announcement;
    } catch (error) {
      logger.error('❌ Create announcement error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Announcement creation failed',
        'Failed to create announcement. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getAnnouncements(limit: number = 20, offset: number = 0): Promise<Announcement[]> {
    try {
      logger.info('📢 Fetching announcements', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get announcements error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Announcements fetch failed',
        'Failed to fetch announcements. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    try {
      logger.info('📢 Deleting announcement', { announcementId });

      const db = supabase as any;

      const { error } = await db
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;
      logger.info('✅ Announcement deleted', { announcementId });
    } catch (error) {
      logger.error('❌ Delete announcement error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Announcement deletion failed',
        'Failed to delete announcement. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  // ============================================
  // MODERATION LOGS
  // ============================================

  async getModerationLogs(limit: number = 20, offset: number = 0): Promise<ModerationLog[]> {
    try {
      logger.info('📜 Fetching moderation logs', { limit, offset });

      const db = supabase as any;

      const { data, error } = await db
        .from('moderation_actions')
        .select(`
          *,
          user:users!user_id (
            id,
            gamer_tag,
            username
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get moderation logs error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Logs fetch failed',
        'Failed to fetch moderation logs. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }
}

// ============================================
// 4. EXPORT
// ============================================

export const adminService = new AdminService();
export default adminService;