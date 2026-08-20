// @ts-nocheck
/**
 * KONEX useAuth Hook
 * Auth screens: login, signup, resetPassword
 */

import { useCallback, useState } from 'react';
import { AnalyticsEvents } from '../../../config/analytics';
import { logger } from '../../../core/logger/logger.service';
import {
  validateLoginInput,
  validateSignUpInput,
} from '../../../core/utils/validators/validation.utils';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth as useAppAuth } from '../../../hooks/useAuth';
import { useUIStore } from '../../../store/uiStore';

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
  isLoading: boolean;
  error: AuthError | null;
  isSuccess: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  reset: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const appAuth = useAppAuth() as any;
  const { showToast } = useUIStore();
  const { trackEvent } = useAnalytics();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        const validation = validateLoginInput(data);
        if (!validation.isValid) {
          const firstError = validation.errors?.[0];
          setError({
            field: firstError?.field,
            message: firstError?.message || 'Invalid input',
          });
          return { success: false, error: firstError?.message || 'Invalid input' };
        }

        const signInFn = appAuth.signIn || appAuth.login || appAuth.signin;
        const result = signInFn
          ? await signInFn(data.email, data.password)
          : { success: false, error: 'Auth not available' };

        if (result?.success) {
          setIsSuccess(true);
          try {
            trackEvent(AnalyticsEvents.AUTH_LOGIN, {
              method: 'email_password',
              email: data.email,
            });
          } catch {}
          try {
            showToast('Welcome back!', 'success');
          } catch {}
          return { success: true };
        }

        const msg = result?.error || 'Login failed';
        setError({ message: msg });
        return { success: false, error: msg };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An error occurred during login';
        setError({ message });
        logger.error('Login error', err);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [appAuth, showToast, trackEvent]
  );

  const signup = useCallback(
    async (data: SignUpData) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        const validation = validateSignUpInput(data);
        if (!validation.isValid) {
          const firstError = validation.errors?.[0];
          setError({
            field: firstError?.field,
            message: firstError?.message || 'Invalid input',
          });
          return { success: false, error: firstError?.message || 'Invalid input' };
        }

        const signUpFn = appAuth.signUp || appAuth.signup;
        const result = signUpFn
          ? await signUpFn(data)
          : { success: false, error: 'Auth not available' };

        if (result?.success) {
          setIsSuccess(true);
          try {
            showToast('Account created!', 'success');
          } catch {}
          return { success: true };
        }

        const msg = result?.error || 'Signup failed';
        setError({ message: msg });
        return { success: false, error: msg };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An error occurred during signup';
        setError({ message });
        logger.error('Signup error', err);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [appAuth, showToast]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const fn =
          appAuth.resetPassword ||
          appAuth.sendPasswordReset ||
          appAuth.forgotPassword;

        const result = fn ? await fn(email) : { success: true };

        try {
          showToast('Check your email for reset instructions', 'success');
        } catch {}

        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Reset password failed';
        setError({ message });
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [appAuth, showToast]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const fn = appAuth.updatePassword || appAuth.resetPassword;
        if (fn) {
          await fn(password);
        }

        try {
          showToast('Password updated', 'success');
        } catch {}

        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Update password failed';
        setError({ message });
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [appAuth, showToast]
  );

  const clearError = useCallback(() => setError(null), []);

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
    signIn: login,   // alias
    signUp: signup,  // alias
    resetPassword,
    updatePassword,
    clearError,
    reset,
  };
};

export default useAuth;