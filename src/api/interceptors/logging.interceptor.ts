/**
 * KONEX API Interceptors - Main Export
 * Billion Dollar Code - Production Ready
 */

// Auth Interceptor
export {
    authInterceptor, default as authInterceptorDefault, getCurrentUser, isAuthenticated, resetInterceptor, signOut
} from './auth.interceptor';

// Error Interceptor
export {
    clearErrorStats, errorInterceptor, default as errorInterceptorDefault, getErrorStats, handleApiError, processApiRequest, processApiResponse, updateErrorInterceptor
} from './error.interceptor';

// Logging Interceptor
export {
    clearLogs, getLogs, getLogStats, logApiError, loggingInterceptor, default as loggingInterceptorDefault, logRequest,
    logResponse, updateLoggingInterceptor
} from './logging.interceptor';

// Types
export type {
    AuthInterceptorConfig,
    InterceptedRequest
} from './auth.interceptor';

export type {
    ErrorInterceptorConfig,
    ErrorResponse
} from './error.interceptor';

export type {
    LogEntry, LoggingInterceptorConfig
} from './logging.interceptor';

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  auth: authInterceptor,
  error: errorInterceptor,
  logging: loggingInterceptor,
};