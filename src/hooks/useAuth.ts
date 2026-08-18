/**
 * KONEX useAuth Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides authentication state and actions
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

import { useCallback, useEffect, useState } from 'react';
import { authService } from '../api/services/auth.service';
import { userService } from '../api/services/user.service';
import { AnalyticsEvents, trackEvent } from '../config/analytics';
import { logger } from '../core/logger/logger.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';

export interface UseAuthReturn {
  // State
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  
  // Utility
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
  gamerTag: string;
  bio?: string;
  gamingStyle?: string;
  skillLevel?: string;
  role?: string;
}

export const useAuth = (): UseAuthReturn => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    setAuth, 
    clearAuth, 
    setLoading,
    refreshSession: refreshSessionStore,
  } = useAuthStore();
  
  const { setProfile } = useUserStore();
  const { showToast, setLoading: setUILoading } = useUIStore();
  
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 1. INITIALIZATION
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const session = await authService.getSession();
        
        if (session) {
          setAuth(session);
          
          // Fetch user profile
          const profile = await userService.getProfile(session.user.id);
          setProfile(profile);
          
          // Track login
          trackEvent(AnalyticsEvents.AUTH_LOGIN, {
            userId: session.user.id,
            method: 'session_restore',
          });
        }
      } catch (error) {
        logger.error('❌ Auth initialization error', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const subscription = authService.onAuthChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuth(session);
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
      }
    });

    return () => {
      subscription?.();
    };
  }, []);

  // ============================================
  // 2. AUTH ACTIONS
  // ============================================

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setUILoading(true);
      setLoading(true);

      const { session } = await authService.signIn(email, password);
      
      if (session) {
        setAuth(session);
        
        // Fetch user profile
        const profile = await userService.getProfile(session.user.id);
        setProfile(profile);
        
        // Track login
        trackEvent(AnalyticsEvents.AUTH_LOGIN, {
          userId: session.user.id,
          email: session.user.email,
          method: 'email_password',
        });
        
        showToast('Welcome back!', 'success');
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Login failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      trackEvent(AnalyticsEvents.AUTH_LOGIN, { error: message });
      return { success: false, error: message };
    } finally {
      setLoading(false);
      setUILoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      setError(null);
      setUILoading(true);
      setLoading(true);

      const { user, session } = await authService.signUp(
        data.email,
        data.password,
        {
          gamer_tag: data.gamerTag,
          username: data.username,
          bio: data.bio || null,
          gaming_style: data.gamingStyle || 'Casual',
          skill_level: data.skillLevel || 'Intermediate',
          role: data.role || 'Flex',
        }
      );

      if (session) {
        setAuth(session);
        
        // Fetch user profile
        const profile = await userService.getProfile(user.id);
        setProfile(profile);
        
        // Track signup
        trackEvent(AnalyticsEvents.AUTH_SIGNUP, {
          userId: user.id,
          email: data.email,
          gamerTag: data.gamerTag,
          gamingStyle: data.gamingStyle,
        });
        
        showToast('Account created successfully!', 'success');
        return { success: true };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Signup failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
      setUILoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUILoading(true);
      
      // Track logout
      if (user) {
        trackEvent(AnalyticsEvents.AUTH_LOGOUT, { userId: user.id });
      }
      
      await authService.signOut();
      clearAuth();
      
      showToast('Logged out successfully', 'info');
    } catch (error: any) {
      const message = error?.message || 'Logout failed. Please try again.';
      showToast(message, 'error');
      logger.error('❌ Logout error', error);
    } finally {
      setUILoading(false);
    }
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setUILoading(true);

      await authService.resetPassword(email);
      
      trackEvent(AnalyticsEvents.AUTH_PASSWORD_RESET, { email });
      
      showToast('Password reset email sent!', 'success');
      return { success: true };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Password reset failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setUILoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      setError(null);
      setUILoading(true);

      // Verify old password first
      await authService.signIn(user?.email || '', oldPassword);
      
      // Update password
      await authService.updatePassword(newPassword);
      
      trackEvent(AnalyticsEvents.AUTH_PASSWORD_CHANGE, { userId: user?.id });
      
      showToast('Password updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Password update failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setUILoading(false);
    }
  }, [user]);

  const updateEmail = useCallback(async (newEmail: string) => {
    try {
      setError(null);
      setUILoading(true);

      await authService.updateEmail(newEmail);
      
      trackEvent(AnalyticsEvents.AUTH_EMAIL_CHANGE, { userId: user?.id, newEmail });
      
      showToast('Email updated successfully!', 'success');
      return { success: true };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Email update failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setUILoading(false);
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    try {
      setError(null);
      setUILoading(true);

      await authService.deleteAccount();
      clearAuth();
      
      trackEvent('account_deleted', { userId: user?.id });
      
      showToast('Account deleted successfully', 'info');
      return { success: true };
    } catch (error: any) {
      const message = error?.userMessage || error?.message || 'Account deletion failed. Please try again.';
      setError(message);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setUILoading(false);
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authService.refreshSession();
      if (session) {
        refreshSessionStore(session);
      }
    } catch (error) {
      logger.error('❌ Session refresh error', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateEmail,
    deleteAccount,
    refreshSession,
    clearError,
  };
};

export default useAuth;