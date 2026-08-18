/**
 * KONEX useAuth Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides authentication functionality for auth screens
 * 
 * Usage:
 * const { login, signup, isLoading, error } = useAuth();
 */

import { useCallback, useState } from 'react';
import { AnalyticsEvents } from '../../../config/analytics';
import { logger } from '../../../core/logger/logger.service';
import { validateLoginInput, validateSignUpInput } from '../../../core/utils/validators/validation.utils';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth as useAppAuth } from '../../../hooks/useAuth';
import { useUIStore } from '../../../store/uiStore';

// ============================================
// 1. TYPES
// ============================================

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  gamerTag: string;
  username: string;
  bio?: string;
  gamingStyle?: string;
  skillLevel?: string;
  role?: string;
  gameId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface UseAuthReturn {
  // State
  isLoading: boolean;
  error: AuthError | null;
  isSuccess: boolean;
  
  // Actions
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useAuth = (): UseAuthReturn => {
  const appAuth = useAppAuth();
  const { showToast } = useUIStore();
  const { trackEvent } = useAnalytics();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================
  // LOGIN
  // ============================================

  const login = useCallback(async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      // Validate input
      const validation = validateLoginInput(data);
      if (!validation.isValid) {
        const firstError = validation.errors[0];
        setError({
          field: firstError?.field,
          message: firstError?.message || 'Invalid input',
        });
        return { success: false, error: firstError?.message };
      }

      // Attempt login
      const result = await appAuth.signIn(data.email, data.password);
      
      if (result.success) {
        setIsSuccess(true);
        trackEvent(AnalyticsEvents.AUTH_LOGIN, {
          method: 'email_password',
          email: data.email,
        });
        showToast('Welcome back! 🎮', 'success');
        return { success: true };
      } else {
        setError({ message: result.error || 'Login failed' });
        return { success: false, error: result.error };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      setError({ message });
      logger.error('❌ Login error', err);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [appAuth, trackEvent, showToast]);

  // ============================================
  // SIGNUP
  // ============================================

  const signup = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      // Validate input
      const validation = validateSignUpInput({
        email: data.email,
        password: data.password,
        username: data.username,
        gamerTag: data.gamerTag,
        bio: data.bio,
      });

      if (!validation.isValid) {
        const firstError = validation.errors[0];
        setError({
          field: firstError?.field,
          message: firstError?.message || 'Invalid input',
        });
        return { success: false, error: firstError?.message };
      }

      // Check password confirmation
      if (data.password !== data.confirmPassword) {
        setError({
          field: 'confirmPassword',
          message: 'Passwords do not match',
        });
        return { success: false, error: 'Passwords do not match' };
      }

      // Attempt signup
      const result = await appAuth.signUp(
        data.email,
        data.password,
        {
          gamerTag: data.gamerTag,
          username: data.username,
          bio: data.bio,
          gamingStyle: data.gamingStyle || 'Casual',
          skillLevel: data.skillLevel || 'Intermediate',
          role: data.role || 'Flex',
          gameId: data.gameId || 'cod_mobile',
        }
      );

      if (result.success) {
        setIsSuccess(true);
        trackEvent(AnalyticsEvents.AUTH_SIGNUP, {
          email: data.email,
          gamerTag: data.gamerTag,
          gamingStyle: data.gamingStyle,
        });
        showToast(`Welcome to KONEX, ${data.gamerTag}! 🎮`, 'success');
        return { success: true };
      } else {
        setError({ message: result.error || 'Signup failed' });
        return { success: false, error: result.error };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during signup';
      setError({ message });
      logger.error('❌ Signup error', err);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [appAuth, trackEvent, showToast]);

  // ============================================
  // RESET PASSWORD
  // ============================================

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      const result = await appAuth.resetPassword(email);
      
      if (result.success) {
        setIsSuccess(true);
        trackEvent(AnalyticsEvents.AUTH_PASSWORD_RESET, { email });
        showToast('Password reset email sent! Check your inbox.', 'success');
        return { success: true };
      } else {
        setError({ message: result.error || 'Password reset failed' });
        return { success: false, error: result.error };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during password reset';
      setError({ message });
      logger.error('❌ Password reset error', err);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [appAuth, trackEvent, showToast]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    isSuccess,
    login,
    signup,
    resetPassword,
    clearError,
    reset,
  };
};

export default useAuth;