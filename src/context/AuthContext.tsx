// @ts-nocheck
/**
 * KONEX AuthContext
 * Billion Dollar Code - Production Ready
 * 
 * Provides authentication state and actions throughout the app
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../api/client';
import { authService } from '../api/services/auth.service';
import { userService } from '../api/services/user.service';
import { AnalyticsEvents, trackEvent } from '../config/analytics';
import { APP_NAME } from '../config/env.config';
import { logger } from '../core/logger/logger.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';

// ============================================
// 1. TYPES
// ============================================

export interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  
  // Session Management
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // Helpers
  getAuthHeader: () => string | null;
  isTokenValid: () => boolean;
}

// ============================================
// 2. CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// 3. PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    session,
    setAuth,
    clearAuth,
    setLoading,
    getAuthHeader: getAuthHeaderStore,
    isTokenValid: isTokenValidStore,
    refreshSession: refreshSessionStore,
  } = useAuthStore();
  
  const { setProfile, clear: clearUser } = useUserStore();
  const { showToast, setLoading: setUILoading } = useUIStore();
  
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 4. INITIALIZATION
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = await authService.getSession();

        if (session) {
          setAuth(session);
          
          // Fetch user profile
          try {
            const profile = await userService.getProfile(session.user.id);
            setProfile(profile);
            
            // Track authentication
            trackEvent(AnalyticsEvents.AUTH_LOGIN, {
              userId: session.user.id,
              email: session.user.email,
              method: 'session_restore',
            });
          } catch (profileError) {
            logger.error('❌ Failed to fetch user profile', profileError);
          }
        }
      } catch (error) {
        logger.error('❌ Auth initialization error', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener via authService. authService.onAuthChange
    // returns an unsubscribe function immediately while handling deferred
    // registration under the hood.
    const subscription = authService.onAuthChange((event, session) => {
      logger.debug('🔐 Auth state changed', { event, userId: session?.user?.id });

      if (event === 'SIGNED_IN' && session) {
        setAuth(session);
        // Track login
        trackEvent(AnalyticsEvents.AUTH_LOGIN, {
          userId: session.user.id,
          email: session.user.email,
          method: 'auth_state_change',
        });
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
        clearUser();
        // Track logout
        trackEvent(AnalyticsEvents.AUTH_LOGOUT);
      } else if (event === 'TOKEN_REFRESHED') {
        if (session) {
          refreshSessionStore(session);
        }
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          setAuth(session);
        }
      }
    });

    return () => {
      try {
        subscription?.();
      } catch (e) {
        logger.error('❌ Error while unsubscribing auth listener in AuthContext', e);
      }
    };
  }, []);

  // ============================================
  // 5. AUTH ACTIONS
  // ============================================

  const signIn = useCallback(async (email: string, password: string) => {
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
        
        showToast(`Welcome back, ${profile?.gamer_tag || 'Gamer'}!`, 'success');
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

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    try {
      setError(null);
      setUILoading(true);
      setLoading(true);

      const { user, session } = await authService.signUp(email, password, {
        gamer_tag: userData.gamerTag,
        username: userData.username,
        bio: userData.bio || null,
        gaming_style: userData.gamingStyle || 'Casual',
        skill_level: userData.skillLevel || 'Intermediate',
        role: userData.role || 'Flex',
        game_id: userData.gameId || '',
      });

      if (session) {
        setAuth(session);
        
        // Fetch user profile
        const profile = await userService.getProfile(user.id);
        setProfile(profile);
        
        // Track signup
        trackEvent(AnalyticsEvents.AUTH_SIGNUP, {
          userId: user.id,
          email: email,
          gamerTag: userData.gamerTag,
          gamingStyle: userData.gamingStyle,
        });
        
        showToast(`Welcome to ${APP_NAME}, ${userData.gamerTag}! 🎮`, 'success');
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

  const signOut = useCallback(async () => {
    try {
      setUILoading(true);
      
      // Track logout
      if (user) {
        trackEvent(AnalyticsEvents.AUTH_LOGOUT, { userId: user.id });
      }
      
      await authService.signOut();
      clearAuth();
      clearUser();
      
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
      
      showToast('Password reset email sent! Check your inbox.', 'success');
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

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setError(null);
      setUILoading(true);

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
      clearUser();
      
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

  // ============================================
  // 6. SESSION MANAGEMENT
  // ============================================

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

  // ============================================
  // 7. HELPERS
  // ============================================

  const getAuthHeader = useCallback(() => {
    return getAuthHeaderStore();
  }, [getAuthHeaderStore]);

  const isTokenValid = useCallback(() => {
    return isTokenValidStore();
  }, [isTokenValidStore]);

  // ============================================
  // 8. CONTEXT VALUE
  // ============================================

  const value = useMemo(() => ({
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    deleteAccount,
    refreshSession,
    clearError,
    getAuthHeader,
    isTokenValid,
  }), [
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    deleteAccount,
    refreshSession,
    clearError,
    getAuthHeader,
    isTokenValid,
  ]);

  // ============================================
  // 9. EXPORT
  // ============================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 10. HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// 11. DEFAULT EXPORT
// ============================================

export default AuthProvider;