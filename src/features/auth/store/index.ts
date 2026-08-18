/**
 * KONEX Auth Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { selectAuthHeader, selectIsAuthenticated, selectIsLoading, selectIsTokenValid, selectUser, useAuthStore } from './auth.store';
export type { AuthState } from './auth.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useAuthStore,
};