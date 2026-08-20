/**
 * KONEX Error Interceptor
 * Billion Dollar Code - Production Ready
 * Handles all API errors with proper logging and user feedback
 */

import * as Sentry from '../../lib/sentry-noop';
import { APP_VERSION, IS_DEVELOPMENT, IS_PRODUCTION } from '../../config/env.config';
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface ErrorInterceptorConfig {
  onError?: (error: KonexError) => void;
  onNetworkError?: (error: Error) => void;
  onServerError?: (error: Error) => void;
  onAuthError?: (error: KonexError) => void;
  onValidationError?: (error: KonexError) => void;
  showUserFriendlyMessages?: boolean;
  logToConsole?: boolean;
  captureSentry?: boolean;
}

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// ============================================
// 2. ERROR INTERCEPTOR
// ============================================

class ErrorInterceptor {
  private static instance: ErrorInterceptor;
  private config: ErrorInterceptorConfig;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();

  private constructor(config: ErrorInterceptorConfig = {}) {
    this.config = {
      showUserFriendlyMessages: true,
      logToConsole: IS_DEVELOPMENT,
      captureSentry: IS_PRODUCTION,
      ...config,
    };
  }

  public static getInstance(config?: ErrorInterceptorConfig): ErrorInterceptor {
    if (!ErrorInterceptor.instance) {
      ErrorInterceptor.instance = new ErrorInterceptor(config);
    }
    return ErrorInterceptor.instance;
  }

  // ============================================
  // 3. ERROR HANDLING
  // ============================================

  /**
   * Handle any error from the API
   */
  handleError(error: any): KonexError {
    // Log the error
    this.logError(error);

    // Capture in Sentry
    this.captureError(error);

    // Determine the error type
    const konexError = this.mapToKonexError(error);

    // Track error rate
    this.trackError(konexError);

    // Call error handlers
    this.notifyHandlers(konexError);

    return konexError;
  }

  /**
   * Process API response and handle errors
   */
  processResponse(response: any): any {
    // If response is successful, return it
    if (response?.status && response.status < 400) {
      return response;
    }

    // Handle error response
    const error = this.createErrorFromResponse(response);
    return this.handleError(error);
  }

  /**
   * Process API request and handle errors
   */
  processRequest(request: any): any {
    try {
      // Validate request
      this.validateRequest(request);
      return request;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // 4. ERROR MAPPING
  // ============================================

  private mapToKonexError(error: any): KonexError {
    // If already a KonexError, return it
    if (error instanceof KonexError) {
      return error;
    }

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      return new KonexError(
        ErrorCode.NETWORK_OFFLINE,
        error.message || 'Network error',
        'Please check your internet connection and try again.',
        ErrorSeverity.ERROR,
        { originalError: error }
      );
    }

    // Check if it's a timeout error
    if (this.isTimeoutError(error)) {
      return new KonexError(
        ErrorCode.NETWORK_TIMEOUT,
        error.message || 'Timeout error',
        'The request timed out. Please try again.',
        ErrorSeverity.ERROR,
        { originalError: error }
      );
    }

    // Check if it's an auth error
    if (this.isAuthError(error)) {
      return new KonexError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        error.message || 'Authentication error',
        'Please sign in again to continue.',
        ErrorSeverity.ERROR,
        { originalError: error }
      );
    }

    // Check if it's a validation error
    if (this.isValidationError(error)) {
      return new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        error.message || 'Validation error',
        this.getValidationMessage(error),
        ErrorSeverity.WARNING,
        { originalError: error }
      );
    }

    // Check if it's a database error
    if (this.isDatabaseError(error)) {
      return this.mapDatabaseError(error);
    }

    // Default unknown error
    return new KonexError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      'Something went wrong. Please try again later.',
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }

  private mapDatabaseError(error: any): KonexError {
    const code = error?.code || '';

    switch (code) {
      case '23505': // Unique violation
        return new KonexError(
          ErrorCode.DB_DUPLICATE_RECORD,
          error.message || 'Duplicate record',
          'This record already exists.',
          ErrorSeverity.WARNING,
          { originalError: error }
        );
      case '23503': // Foreign key violation
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          error.message || 'Referenced record not found',
          'The referenced record could not be found.',
          ErrorSeverity.WARNING,
          { originalError: error }
        );
      case '42P01': // Undefined table
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          error.message || 'Table not found',
          'The requested table could not be found.',
          ErrorSeverity.ERROR,
          { originalError: error }
        );
      case '42601': // Syntax error
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          error.message || 'Query syntax error',
          'There was a problem with the request.',
          ErrorSeverity.ERROR,
          { originalError: error }
        );
      default:
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          error.message || 'Database error',
          'There was a problem with the database operation.',
          ErrorSeverity.ERROR,
          { originalError: error }
        );
    }
  }

  private createErrorFromResponse(response: any): any {
    const error = {
      status: response.status,
      code: response.data?.code || response.code || 'UNKNOWN_ERROR',
      message: response.data?.message || response.message || 'An error occurred',
      details: response.data?.details || response.details,
      timestamp: new Date().toISOString(),
      path: response.config?.url || response.url,
    };

    return error;
  }

  // ============================================
  // 5. ERROR DETECTION
  // ============================================

  private isNetworkError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('offline') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ENOTFOUND')
    );
  }

  private isTimeoutError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('ETIMEDOUT')
    );
  }

  private isAuthError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    const message = error?.message || '';
    return (
      status === 401 ||
      status === 403 ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid token') ||
      message.includes('session expired')
    );
  }

  private isValidationError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    const message = error?.message || '';
    return (
      status === 400 ||
      status === 422 ||
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    );
  }

  private isDatabaseError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('database') ||
      message.includes('postgres') ||
      message.includes('sql') ||
      message.includes('constraint') ||
      error?.code?.startsWith('2') ||
      error?.code?.startsWith('4')
    );
  }

  // ============================================
  // 6. ERROR LOGGING
  // ============================================

  private logError(error: any): void {
    if (!this.config.logToConsole) {
      return;
    }

    const timestamp = new Date().toISOString();

    if (error instanceof KonexError) {
      logger.error('❌ API Error:', {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        severity: error.severity,
        details: error.details,
        timestamp: error.timestamp || timestamp,
      });
    } else if (error?.message) {
      logger.error('❌ Error:', {
        message: error.message,
        details: error.details,
        status: error.status,
        code: error.code,
        timestamp,
      });
    } else {
      logger.error('❌ Unknown Error:', {
        error: JSON.stringify(error),
        timestamp,
      });
    }

    // Also log to console in development
    if (IS_DEVELOPMENT) {
      console.error('🔴 Error Details:', error);
    }
  }

  // ============================================
  // 7. SENTRY CAPTURE
  // ============================================

  private captureError(error: any): void {
    if (!this.config.captureSentry) {
      return;
    }

    try {
      if (error instanceof KonexError) {
        Sentry.captureException(error, {
          tags: {
            error_code: error.code,
            severity: error.severity,
          },
          extra: {
            details: error.details,
            userMessage: error.userMessage,
            timestamp: error.timestamp,
            appVersion: APP_VERSION,
          },
        });
      } else {
        Sentry.captureException(error, {
          tags: {
            error_type: 'API_ERROR',
          },
          extra: {
            status: error?.status,
            code: error?.code,
            details: error?.details,
          },
        });
      }
    } catch (sentryError) {
      logger.error('❌ Failed to capture error in Sentry', { error: sentryError });
    }
  }

  // ============================================
  // 8. ERROR TRACKING
  // ============================================

  private trackError(error: KonexError): void {
    const key = error.code;
    const now = Date.now();

    // Update error count
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);

    // Update last error time
    this.lastErrorTime.set(key, now);

    // If error count exceeds threshold, log warning
    if (count > 10) {
      logger.warn(`⚠️ High error rate for ${key}: ${count} occurrences`);
    }
  }

  // ============================================
  // 9. ERROR NOTIFICATION
  // ============================================

  private notifyHandlers(error: KonexError): void {
    if (!this.config.onError) {
      return;
    }

    try {
      this.config.onError(error);

      // Call specific handlers
      if (error.code === ErrorCode.NETWORK_OFFLINE || error.code === ErrorCode.NETWORK_TIMEOUT) {
        if (this.config.onNetworkError) {
          this.config.onNetworkError(error);
        }
      } else if (error.code.startsWith('AUTH_')) {
        if (this.config.onAuthError) {
          this.config.onAuthError(error);
        }
      } else if (error.code.startsWith('VALIDATION_')) {
        if (this.config.onValidationError) {
          this.config.onValidationError(error);
        }
      } else if (error.code.startsWith('DB_')) {
        if (this.config.onServerError) {
          this.config.onServerError(error);
        }
      }
    } catch (handlerError) {
      logger.error('❌ Error in error handler', { error: handlerError });
    }
  }

  // ============================================
  // 10. VALIDATION HELPERS
  // ============================================

  private validateRequest(request: any): void {
    if (!request) {
      throw new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Request is required',
        'The request object is required.',
        ErrorSeverity.ERROR
      );
    }

    if (!request.url) {
      throw new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'URL is required',
        'The request URL is required.',
        ErrorSeverity.ERROR
      );
    }

    // Validate HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (request.method && !validMethods.includes(request.method.toUpperCase())) {
      throw new KonexError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Invalid HTTP method',
        'The HTTP method is invalid.',
        ErrorSeverity.ERROR
      );
    }
  }

  private getValidationMessage(error: any): string {
    const details = error?.details;
    if (typeof details === 'string') {
      return details;
    }
    if (details?.message) {
      return details.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Please check your input and try again.';
  }

  // ============================================
  // 11. CONFIGURATION METHODS
  // ============================================

  updateConfig(config: Partial<ErrorInterceptorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getErrorStats(): Record<string, { count: number; lastOccurrence: number }> {
    const stats: Record<string, { count: number; lastOccurrence: number }> = {};
    this.errorCounts.forEach((count, key) => {
      stats[key] = {
        count,
        lastOccurrence: this.lastErrorTime.get(key) || 0,
      };
    });
    return stats;
  }

  clearErrorStats(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }

  reset(): void {
    this.clearErrorStats();
  }
}

// ============================================
// 12. EXPORT SINGLETON
// ============================================

export const errorInterceptor = ErrorInterceptor.getInstance();

// ============================================
// 13. CONVENIENCE FUNCTIONS
// ============================================

/**
 * Handle an API error
 */
export const handleApiError = (error: any): KonexError => {
  return errorInterceptor.handleError(error);
};

/**
 * Process an API response
 */
export const processApiResponse = (response: any): any => {
  return errorInterceptor.processResponse(response);
};

/**
 * Process an API request
 */
export const processApiRequest = (request: any): any => {
  return errorInterceptor.processRequest(request);
};

/**
 * Update error interceptor configuration
 */
export const updateErrorInterceptor = (config: Partial<ErrorInterceptorConfig>): void => {
  errorInterceptor.updateConfig(config);
};

/**
 * Get error statistics
 */
export const getErrorStats = (): Record<string, { count: number; lastOccurrence: number }> => {
  return errorInterceptor.getErrorStats();
};

/**
 * Clear error statistics
 */
export const clearErrorStats = (): void => {
  errorInterceptor.clearErrorStats();
};

// ============================================
// 14. EXPORT DEFAULT
// ============================================

export default errorInterceptor;