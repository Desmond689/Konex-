// src/api/services/user.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';
import { User, UserInsert, UserUpdate } from '../types/database.types';

export interface IUserService {
  getProfile(userId: string): Promise<User>;
  createProfile(userId: string, data: UserInsert): Promise<User>;
  updateProfile(userId: string, data: UserUpdate): Promise<User>;
  deleteProfile(userId: string): Promise<void>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  updateOnlineStatus(userId: string, status: User['online_status']): Promise<void>;
  getUsersOnline(): Promise<User[]>;
}

class UserService implements IUserService {
  async getProfile(userId: string): Promise<User> {
    try {
      logger.info('👤 Fetching user profile', { userId });

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new KonexError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'User not found',
            'No user found with this ID.',
            ErrorSeverity.WARNING,
            { userId }
          );
        }
        throw error;
      }

      if (!data) {
        throw new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'User not found',
          'No user found with this ID.',
          ErrorSeverity.WARNING,
          { userId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Get profile error', { error, userId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Profile fetch failed',
        'Failed to fetch user profile. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async createProfile(userId: string, data: UserInsert): Promise<User> {
    try {
      logger.info('👤 Creating user profile', { userId });

      const { data: profile, error } = await supabase
        .from('users')
        .insert({
          ...data,
          id: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ User profile created', { userId });
      return profile;
    } catch (error) {
      logger.error('❌ Create profile error', { error, userId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Profile creation failed',
        'Failed to create user profile. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateProfile(userId: string, data: UserUpdate): Promise<User> {
    try {
      logger.info('👤 Updating user profile', { userId });

      const { data: profile, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ User profile updated', { userId });
      return profile;
    } catch (error) {
      logger.error('❌ Update profile error', { error, userId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Profile update failed',
        'Failed to update user profile. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      logger.info('👤 Deleting user profile', { userId });

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      logger.info('✅ User profile deleted', { userId });
    } catch (error) {
      logger.error('❌ Delete profile error', { error, userId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Profile deletion failed',
        'Failed to delete user profile. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getUsers(limit: number = 20, offset: number = 0): Promise<User[]> {
    try {
      logger.info('👤 Fetching users', { limit, offset });

      const { data, error } = await supabase
        .from('users')
        .select('*')
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

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
      logger.info('🔍 Searching users', { query });

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`gamer_tag.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Search users error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Search failed',
        'Failed to search users. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateOnlineStatus(
    userId: string,
    status: User['online_status']
  ): Promise<void> {
    try {
      logger.info('🟢 Updating online status', { userId, status });

      const { error } = await supabase
        .from('users')
        .update({
          online_status: status,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      logger.debug('✅ Online status updated', { userId, status });
    } catch (error) {
      logger.error('❌ Update online status error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Status update failed',
        'Failed to update online status. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getUsersOnline(): Promise<User[]> {
    try {
      logger.info('🟢 Fetching online users');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('online_status', 'online');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get online users error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Online users fetch failed',
        'Failed to fetch online users. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const userService = new UserService();
export default userService;