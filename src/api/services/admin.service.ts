// src/api/services/admin.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IAdminService {
  getDashboardStats(): Promise<any>;
  getUsers(limit?: number, offset?: number): Promise<any[]>;
  getUserDetails(userId: string): Promise<any>;
  updateUserRole(userId: string, role: string): Promise<void>;
  getSquads(limit?: number, offset?: number): Promise<any[]>;
  getSquadDetails(squadId: string): Promise<any>;
  deleteSquad(squadId: string): Promise<void>;
  getReports(limit?: number, offset?: number): Promise<any[]>;
  getAppeals(limit?: number, offset?: number): Promise<any[]>;
  createAnnouncement(data: any): Promise<any>;
  getAnnouncements(limit?: number, offset?: number): Promise<any[]>;
  deleteAnnouncement(announcementId: string): Promise<void>;
  getModerationLogs(limit?: number, offset?: number): Promise<any[]>;
}

class AdminService implements IAdminService {
  async getDashboardStats(): Promise<any> {
    try {
      logger.info('👑 Fetching dashboard stats');

      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalSquads },
        { count: totalPosts },
        { count: pendingReports },
        { count: activeSuspensions },
        { count: totalBans },
        { count: pendingAppeals },
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('online_status', 'online'),
        supabase.from('squads').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      // Get today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: todayPosts } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersToday: todayUsers || 0,
        totalSquads: totalSquads || 0,
        totalPosts: totalPosts || 0,
        newPostsToday: todayPosts || 0,
        pendingReports: pendingReports || 0,
        activeSuspensions: activeSuspensions || 0,
        totalBans: totalBans || 0,
        pendingAppeals: pendingAppeals || 0,
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

  async getUsers(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('👑 Fetching users', { limit, offset });

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) {
        throw error;
      }

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

  async getSquads(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('👑 Fetching squads', { limit, offset });

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

      // Permanently delete squad
      const { error } = await supabase
        .from('squads')
        .delete()
        .eq('id', squadId);

      if (error) {
        throw error;
      }

      // Remove squad_id from all members
      await supabase
        .from('users')
        .update({
          squad_id: null,
          squad_role: null,
        })
        .eq('squad_id', squadId);

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

  async getReports(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('👑 Fetching reports', { limit, offset });

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

  async getAppeals(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('👑 Fetching appeals', { limit, offset });

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

  async createAnnouncement(data: any): Promise<any> {
    try {
      logger.info('📢 Creating announcement', { title: data.title });

      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert({
          ...data,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
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

  async getAnnouncements(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('📢 Fetching announcements', { limit, offset });

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

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

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) {
        throw error;
      }

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

  async getModerationLogs(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('📜 Fetching moderation logs', { limit, offset });

      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

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

export const adminService = new AdminService();
export default adminService;