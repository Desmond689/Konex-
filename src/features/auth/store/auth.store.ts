/**
 * KONEX Auth Store
 * Billion Dollar Code - Production Ready
 * 
 * Zustand store for auth state management
 * 
 * Usage:
 * const { isAuthenticated, user, setAuth, clearAuth } = useAuthStore();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================
// 1. TYPES
// ============================================

export interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  lastLoginAt: string | null;
  
  // Actions
  setAuth: (session: Session) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setLastLogin: () => void;
  reset: () => void;
  getAuthHeader: () => string | null;
  isTokenValid: () => boolean;
  refreshSession: (session: Session) => void;
}

// ============================================
// 2. INITIAL STATE
// ============================================

const initialState: Omit<AuthState, 
  'setAuth' | 'setUser' | 'setLoading' | 'clearAuth' | 
  'updateTokens' | 'setLastLogin' | 'reset' | 
  'getAuthHeader' | 'isTokenValid' | 'refreshSession'
> = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  lastLoginAt: null,
};

// ============================================
// 3. STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // SETTERS
      // ============================================

      setAuth: (session: Session) => {
        const expiresAt = session?.expires_at 
          ? new Date(session.expires_at).getTime() 
          : null;
        
        set({
          isAuthenticated: true,
          isLoading: false,
          user: session?.user || null,
          session: session,
          accessToken: session?.access_token || null,
          refreshToken: session?.refresh_token || null,
          expiresAt: expiresAt,
        });

        if (__DEV__) {
          console.log('🔐 Auth set:', {
            userId: session?.user?.id,
            email: session?.user?.email,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
        if (__DEV__) {
          console.log('👤 User updated:', { userId: user.id });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          session: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        });
        if (__DEV__) {
          console.log('🔐 Auth cleared');
        }
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          session: {
            ...get().session,
            access_token: accessToken,
            refresh_token: refreshToken,
          } as Session,
        });
        if (__DEV__) {
          console.log('🔄 Tokens updated');
        }
      },

      setLastLogin: () => {
        set({ lastLoginAt: new Date().toISOString() });
      },

      reset: () => {
        set(initialState);
        if (__DEV__) {
          console.log('🔄 Auth store reset');
        }
      },

      // ============================================
      // UTILITY METHODS
      // ============================================

      getAuthHeader: () => {
        const { accessToken } = get();
        return accessToken ? `Bearer ${accessToken}` : null;
      },

      isTokenValid: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;
        // Add 5-minute buffer
        return Date.now() < expiresAt - 5 * 60 * 1000;
      },

      refreshSession: (session: Session) => {
        const expiresAt = session?.expires_at 
          ? new Date(session.expires_at).getTime() 
          : null;
        
        set({
          session,
          accessToken: session?.access_token || null,
          refreshToken: session?.refresh_token || null,
          expiresAt,
        });

        if (__DEV__) {
          console.log('🔄 Session refreshed');
        }
      },
    }),
    {
      name: '@konex/auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        lastLoginAt: state.lastLoginAt,
      }),
      onRehydrateStorage: () => {
        if (__DEV__) {
          console.log('💾 Auth store rehydrated');
        }
        return (state) => {
          if (state) {
            state.setLoading(false);
          }
        };
      },
    }
  )
);

// ============================================
// 4. SELECTORS
// ============================================

export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectAuthHeader = (state: AuthState) => state.getAuthHeader();
export const selectIsTokenValid = (state: AuthState) => state.isTokenValid();

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default useAuthStore;