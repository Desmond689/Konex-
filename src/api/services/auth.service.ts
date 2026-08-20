// src/api/services/auth.service.ts
import { Session, User } from '@supabase/supabase-js';
import { KonexError } from '../../core/errors/app.error';
import { ErrorCode, ErrorSeverity } from '../../core/errors/error.codes';
import { logger } from '../../core/logger/logger.service';
import { validateEmail, validateGamerTag, validatePassword, validateUsername } from '../../core/utils/validators/validation.utils';
import { supabase, getSupabaseClient } from '../client/supabase.client';
import { UserInsert } from '../types/database.types';
import { userService } from './user.service';

export interface IAuthService {
  signUp(
    email: string,
    password: string,
    userData: Omit<UserInsert, 'id' | 'email'>
  ): Promise<{ user: User; session: Session | null }>;
  signIn(email: string, password: string): Promise<{ user: User; session: Session }>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  updateEmail(newEmail: string): Promise<void>;
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<User | null>;
  refreshSession(): Promise<Session | null>;
  onAuthChange(callback: (event: string, session: Session | null) => void): () => void;
  deleteAccount(): Promise<void>;
}

class AuthService implements IAuthService {
  async signUp(
    email: string,
    password: string,
    userData: Omit<UserInsert, 'id' | 'email'>
  ): Promise<{ user: User; session: Session | null }> {
    try {
      logger.info('🔐 Signing up user', { email });

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_EMAIL,
          emailValidation.error || 'Invalid email',
          'Please enter a valid email address.',
          ErrorSeverity.WARNING,
          { email }
        );
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_PASSWORD,
          passwordValidation.error || 'Invalid password',
          'Password must be at least 8 characters and contain letters and numbers.',
          ErrorSeverity.WARNING,
          { password: '***' }
        );
      }

      const gamerTagValidation = validateGamerTag(userData.gamer_tag ?? '');
      if (!gamerTagValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_GAMER_TAG,
          gamerTagValidation.error || 'Invalid gamer tag',
          'Gamer tag must be 3-15 characters and contain only letters, numbers, and underscores.',
          ErrorSeverity.WARNING,
          { gamerTag: userData.gamer_tag }
        );
      }

      const usernameValidation = validateUsername(userData.username);
      if (!usernameValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_USERNAME,
          usernameValidation.error || 'Invalid username',
          'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
          ErrorSeverity.WARNING,
          { username: userData.username }
        );
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        throw new KonexError(
          ErrorCode.AUTH_EMAIL_EXISTS,
          'Email already registered',
          'An account with this email already exists. Please sign in or use a different email.',
          ErrorSeverity.WARNING,
          { email }
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            gamer_tag: userData.gamer_tag,
            username: userData.username,
          },
        },
      });

      if (error) {
        logger.error('❌ Auth signup failed', { error, email });
        throw new KonexError(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          error.message,
          'Failed to create account. Please try again.',
          ErrorSeverity.ERROR,
          { error: error.message }
        );
      }

      if (!data.user) {
        throw new KonexError(
          ErrorCode.UNKNOWN_ERROR,
          'User creation failed',
          'Failed to create account. Please try again.',
          ErrorSeverity.ERROR
        );
      }

      logger.info('✅ Auth account created', { userId: data.user.id });

      try {
        await userService.createProfile(data.user.id, {
          ...userData,
          email: email.trim().toLowerCase(),
        });
        logger.info('✅ User profile created', { userId: data.user.id });
      } catch (profileError) {
        logger.error('❌ Profile creation failed, rolling back', { error: profileError });
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          'Profile creation failed',
          'Failed to create your profile. Please try again.',
          ErrorSeverity.ERROR,
          { error: profileError }
        );
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Signup error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Signup failed',
        'An unexpected error occurred. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    try {
      logger.info('🔐 Signing in user', { email });

      if (!email || !password) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Missing credentials',
          'Please enter your email and password.',
          ErrorSeverity.WARNING
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new KonexError(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          error.message,
          'Invalid email or password. Please try again.',
          ErrorSeverity.WARNING,
          { error: error.message }
        );
      }

      if (!data.user) {
        throw new KonexError(
          ErrorCode.AUTH_USER_NOT_FOUND,
          'User not found',
          'No account found with these credentials.',
          ErrorSeverity.WARNING
        );
      }

      logger.info('✅ User signed in', { userId: data.user.id });
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Signin error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Signin failed',
        'An unexpected error occurred. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async signOut(): Promise<void> {
    try {
      logger.info('🔐 Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      logger.info('✅ User signed out');
    } catch (error) {
      logger.error('❌ Signout error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Signout failed',
        'Failed to sign out. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      logger.info('🔐 Resetting password for', { email });
      if (!email) {
        throw new KonexError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Email required',
          'Please enter your email address.',
          ErrorSeverity.WARNING
        );
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: 'konex://reset-password',
        }
      );

      if (error) {
        throw error;
      }
      logger.info('✅ Password reset email sent');
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Password reset error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Password reset failed',
        'Failed to send password reset email. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      logger.info('🔐 Updating password');
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_PASSWORD,
          passwordValidation.error || 'Invalid password',
          'Password must be at least 8 characters and contain letters and numbers.',
          ErrorSeverity.WARNING
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
      logger.info('✅ Password updated');
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Password update error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Password update failed',
        'Failed to update password. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async updateEmail(newEmail: string): Promise<void> {
    try {
      logger.info('🔐 Updating email', { newEmail });
      const emailValidation = validateEmail(newEmail);
      if (!emailValidation.isValid) {
        throw new KonexError(
          ErrorCode.VALIDATION_INVALID_EMAIL,
          emailValidation.error || 'Invalid email',
          'Please enter a valid email address.',
          ErrorSeverity.WARNING,
          { newEmail }
        );
      }

      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim().toLowerCase(),
      });

      if (error) {
        throw error;
      }
      logger.info('✅ Email updated');
    } catch (error) {
      if (error instanceof KonexError) {
        throw error;
      }
      logger.error('❌ Email update error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Email update failed',
        'Failed to update email. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      logger.error('❌ Get session error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Session fetch failed',
        'Failed to get session. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return data.user;
    } catch (error) {
      logger.error('❌ Get current user error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'User fetch failed',
        'Failed to get current user. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      logger.error('❌ Refresh session error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Session refresh failed',
        'Failed to refresh session. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  onAuthChange(callback: (event: string, session: Session | null) => void): () => void {
    // Return an unsubscribe function immediately while ensuring the real
    // Supabase client will register the listener once initialized.
    let unsub: (() => void) | null = null;
    let cancelled = false;

    // If the proxy already forwards to a real client with auth listener support,
    // register synchronously and return the unsubscribe.
    try {
      const maybeAuth: any = (supabase as any)?.auth;
      if (maybeAuth && typeof maybeAuth.onAuthStateChange === 'function') {
        const { data } = maybeAuth.onAuthStateChange(callback);
        unsub = () => data?.subscription?.unsubscribe?.();
        return () => unsub?.();
      }
    } catch (err) {
      // fall through to deferred registration
      logger.debug('AuthService: auth not available yet, deferring auth listener registration');
    }

    // Deferred registration: register once the client is initialized
    getSupabaseClient()
      .then((client) => {
        if (cancelled) return;
        const { data } = client.auth.onAuthStateChange(callback);
        unsub = () => data?.subscription?.unsubscribe?.();
      })
      .catch((error) => {
        logger.error('❌ Failed to register deferred auth listener', { error });
      });

    // Return unsubscribe that will cancel deferred registration or unsubscribe when ready
    return () => {
      cancelled = true;
      if (unsub) {
        try {
          unsub();
        } catch (e) {
          logger.error('❌ Error while unsubscribing auth listener', { e });
        }
      }
    };
  }

  async deleteAccount(): Promise<void> {
    try {
      logger.info('🔐 Deleting account');
      const { error } = await supabase.rpc('delete_user_account');
      if (error) {
        throw error;
      }
      logger.info('✅ Account deleted');
    } catch (error) {
      logger.error('❌ Account deletion error', { error });
      throw new KonexError(
        ErrorCode.UNKNOWN_ERROR,
        'Account deletion failed',
        'Failed to delete account. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }
}

export const authService = new AuthService();
export default authService;