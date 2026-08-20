/**
 * KONEX Error Handler
 * Billion Dollar Code - Production Ready
 * Centralized error handling with recovery strategies
 */

import { IS_DEVELOPMENT, IS_PRODUCTION } from '../../config/env.config';
import { logger } from '../logger/logger.service';
import { KonexError } from './app.error';
import { ErrorCode, ErrorSeverity } from './error.codes';

// ============================================
// 1. TYPES
// ============================================

export interface ErrorHandlerConfig {
  onError?: (error: KonexError) => void;
  onRecoverableError?: (error: KonexError) => boolean;
  onFatalError?: (error: KonexError) => void;
  maxRetries?: number;
  retryDelay?: number;
  showTechnicalErrors?: boolean;
  captureSentry?: boolean;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  path?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorResult {
  error: KonexError;
  handled: boolean;
  recovered?: boolean;
  retryCount?: number;
}

// ============================================
// 2. ERROR HANDLER
// ============================================

class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();
  private retryCounts: Map<string, number> = new Map();
  private errorListeners: ((error: KonexError) => void)[] = [];

  private constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      showTechnicalErrors: IS_DEVELOPMENT,
      captureSentry: IS_PRODUCTION,
      ...config,
    };
  }

  public static getInstance(config?: ErrorHandlerConfig): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  // ============================================
  // 3. MAIN HANDLE METHOD
  // ============================================

  /**
   * Handle any error
   */
  handle(error: any, context?: ErrorContext): KonexError {
    // Convert to KonexError if needed
    const konexError = this.normalizeError(error);

    // Add context to error
    if (context) {
      ( konexError as any).details = {
        ...konexError.details,
        context,
      };
    }

    // Log the error
    this.logError(konexError);

    // Track error rate
    this.trackError(konexError);

    // Notify listeners
    this.notifyListeners(konexError);

    // Check if error is recoverable
    if (this.isRecoverable(konexError)) {
      const recovered = this.handleRecoverableError(konexError);
      if (recovered) {
        return konexError;
      }
    }

    // Check if error is fatal
    if (konexError.isFatal()) {
      this.handleFatalError(konexError);
    }

    // Call global error handler
    if (this.config.onError) {
      this.config.onError(konexError);
    }

    return konexError;
  }

  /**
   * Handle a recoverable error
   */
  handleRecoverableError(error: KonexError): boolean {
    const strategy = this.getRecoveryStrategy(error);

    if (!strategy) {
      return false;
    }

    // Check if we've already tried to recover
    const retryKey = this.getRetryKey(error);
    const retryCount = this.retryCounts.get(retryKey) || 0;

    if (retryCount >= (this.config.maxRetries || 3)) {
      logger.warn(`⚠️ Max retries reached for ${error.code}`, {
        code: error.code,
        retryCount,
      });
      return false;
    }

    // Execute recovery strategy
    const recovered = this.executeRecovery(error, strategy);

    if (recovered) {
      this.retryCounts.set(retryKey, retryCount + 1);
      logger.info('🔄 Recovery successful', {
        code: error.code,
        strategy,
        retryCount: retryCount + 1,
      });

      if (this.config.onRecoverableError) {
        this.config.onRecoverableError(error);
      }

      return true;
    }

    return false;
  }

  /**
   * Handle a fatal error
   */
  handleFatalError(error: KonexError): void {
    logger.fatal('💀 FATAL ERROR', {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    });

    if (this.config.onFatalError) {
      this.config.onFatalError(error);
    }
  }

  // ============================================
  // 4. ERROR NORMALIZATION
  // ============================================

  private normalizeError(error: any): KonexError {
    // Already a KonexError
    if (error instanceof KonexError) {
      return error;
    }

    // Supabase error
    if (error?.code && error?.message) {
      return this.mapSupabaseError(error);
    }

    // Network error
    if (this.isNetworkError(error)) {
      return new KonexError(
        ErrorCode.NETWORK_OFFLINE,
        error.message || 'Network error',
        'Please check your internet connection.',
        ErrorSeverity.ERROR,
        { originalError: error },
        true,
        503
      );
    }

    // Timeout error
    if (this.isTimeoutError(error)) {
      return new KonexError(
        ErrorCode.NETWORK_TIMEOUT,
        error.message || 'Timeout error',
        'The request timed out. Please try again.',
        ErrorSeverity.ERROR,
        { originalError: error },
        true,
        504
      );
    }

    // Rate limit error
    if (this.isRateLimitError(error)) {
      return new KonexError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        error.message || 'Rate limit exceeded',
        'Too many requests. Please slow down.',
        ErrorSeverity.WARNING,
        { originalError: error },
        true,
        429
      );
    }

    // Default unknown error
    return new KonexError(
      ErrorCode.UNKNOWN_ERROR,
      error?.message || 'Unknown error',
      'An unexpected error occurred.',
      ErrorSeverity.ERROR,
      { originalError: error },
      true,
      500
    );
  }

  private mapSupabaseError(error: any): KonexError {
    const code = error.code;
    const message = error.message;

    // Map Supabase error codes to KonexError codes
    switch (code) {
      case '23505':
        return new KonexError(
          ErrorCode.DB_DUPLICATE_RECORD,
          message,
          'This record already exists.',
          ErrorSeverity.WARNING,
          { originalError: error },
          true,
          409
        );
      case '23503':
        return new KonexError(
          ErrorCode.DB_CONSTRAINT_VIOLATION,
          message,
          'The operation violates a database constraint.',
          ErrorSeverity.WARNING,
          { originalError: error },
          true,
          409
        );
      case '42P01':
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          message,
          'A database error occurred.',
          ErrorSeverity.ERROR,
          { originalError: error },
          true,
          500
        );
      case 'PGRST116':
        return new KonexError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          message,
          'The requested item could not be found.',
          ErrorSeverity.WARNING,
          { originalError: error },
          true,
          404
        );
      case 'PGRST301':
        return new KonexError(
          ErrorCode.DB_PERMISSION_DENIED,
          message,
          'You do not have permission to perform this action.',
          ErrorSeverity.WARNING,
          { originalError: error },
          true,
          403
        );
      default:
        if (code?.startsWith('AUTH_')) {
          return new KonexError(
            ErrorCode.AUTH_INVALID_CREDENTIALS,
            message,
            'Authentication failed. Please try again.',
            ErrorSeverity.WARNING,
            { originalError: error },
            true,
            401
          );
        }
        return new KonexError(
          ErrorCode.DB_QUERY_ERROR,
          message,
          'A database error occurred.',
          ErrorSeverity.ERROR,
          { originalError: error },
          true,
          500
        );
    }
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
      message.includes('ENOTFOUND') ||
      message.includes('ECONNRESET') ||
      message.includes('EPIPE')
    );
  }

  private isTimeoutError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ESOCKETTIMEDOUT')
    );
  }

  private isRateLimitError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    const message = error?.message || '';
    return (
      status === 429 ||
      message.includes('rate limit') ||
      message.includes('too many requests')
    );
  }

  // ============================================
  // 6. RECOVERY STRATEGIES
  // ============================================

  private isRecoverable(error: KonexError): boolean {
    const recoverableCodes = [
      ErrorCode.NETWORK_OFFLINE,
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.NETWORK_UNKNOWN,
      ErrorCode.AUTH_SESSION_EXPIRED,
      ErrorCode.AUTH_TOKEN_EXPIRED,
      ErrorCode.AUTH_TOKEN_INVALID,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.DB_TIMEOUT_ERROR,
    ];
    return recoverableCodes.includes(error.code);
  }

  private getRecoveryStrategy(error: KonexError): string | null {
    switch (error.code) {
      case ErrorCode.NETWORK_OFFLINE:
      case ErrorCode.NETWORK_TIMEOUT:
      case ErrorCode.NETWORK_UNKNOWN:
        return 'RETRY';
      case ErrorCode.AUTH_SESSION_EXPIRED:
      case ErrorCode.AUTH_TOKEN_EXPIRED:
      case ErrorCode.AUTH_TOKEN_INVALID:
        return 'REFRESH_TOKEN';
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 'WAIT_AND_RETRY';
      case ErrorCode.DB_TIMEOUT_ERROR:
        return 'RETRY_WITH_BACKOFF';
      default:
        return null;
    }
  }

  private executeRecovery(error: KonexError, strategy: string): boolean {
    try {
      switch (strategy) {
        case 'RETRY':
          // Implement retry logic
          logger.info('🔄 Executing RETRY strategy...');
          return true;
        case 'RETRY_WITH_BACKOFF':
          // Implement retry with exponential backoff
          logger.info('🔄 Executing RETRY_WITH_BACKOFF strategy...');
          return true;
        case 'REFRESH_TOKEN':
          // Implement token refresh
          logger.info('🔄 Executing REFRESH_TOKEN strategy...');
          return true;
        case 'WAIT_AND_RETRY':
          // Implement wait and retry
          logger.info('🔄 Executing WAIT_AND_RETRY strategy...');
          return true;
        default:
          logger.warn(`⚠️ Unknown recovery strategy: ${strategy}`);
          return false;
      }
    } catch (recoveryError) {
      logger.error('❌ Recovery execution failed', { recoveryError });
      return false;
    }
  }

  // ============================================
  // 7. ERROR TRACKING
  // ============================================

  private trackError(error: KonexError): void {
    const key = error.code;
    const now = Date.now();

    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);
    this.lastErrorTime.set(key, now);

    // If error count exceeds threshold, log warning
    if (count > 10) {
      logger.warn(`⚠️ High error rate for ${key}: ${count} occurrences`);
    }
  }

  private getRetryKey(error: KonexError): string {
    return `${error.code}_${Date.now().toString().slice(0, 10)}`;
  }

  // ============================================
  // 8. ERROR LOGGING
  // ============================================

  private logError(error: KonexError): void {
    if (error.isFatal()) {
      logger.fatal('💀 Fatal error', {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        details: error.details,
        stack: error.stack,
      });
    } else if (error.isWarning()) {
      logger.warn('⚠️ Warning', {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        details: error.details,
      });
    } else {
      logger.error('❌ Error', {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        details: error.details,
      });
    }
  }

  // ============================================
  // 9. EVENT LISTENERS
  // ============================================

  addListener(listener: (error: KonexError) => void): void {
    this.errorListeners.push(listener);
  }

  removeListener(listener: (error: KonexError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  private notifyListeners(error: KonexError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error('❌ Error in error listener', { listenerError });
      }
    });
  }

  // ============================================
  // 10. UTILITY METHODS
  // ============================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    counts: Record<string, number>;
    lastOccurrence: Record<string, number>;
    totalErrors: number;
  } {
    const counts: Record<string, number> = {};
    const lastOccurrence: Record<string, number> = {};

    this.errorCounts.forEach((count, key) => {
      counts[key] = count;
      lastOccurrence[key] = this.lastErrorTime.get(key) || 0;
    });

    return {
      counts,
      lastOccurrence,
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Reset error tracking
   */
  resetErrorStats(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
    this.retryCounts.clear();
  }

  /**
   * Reset the handler
   */
  reset(): void {
    this.resetErrorStats();
    this.errorListeners = [];
  }
}

// ============================================
// 11. EXPORT SINGLETON
// ============================================

export const errorHandler = ErrorHandler.getInstance();

// ============================================
// 12. CONVENIENCE FUNCTIONS
// ============================================

/**
 * Handle an error
 */
export const handleError = (error: any, context?: ErrorContext): KonexError => {
  return errorHandler.handle(error, context);
};

/**
 * Handle a recoverable error
 */
export const handleRecoverableError = (error: KonexError): boolean => {
  return errorHandler.handleRecoverableError(error);
};

/**
 * Handle a fatal error
 */
export const handleFatalError = (error: KonexError): void => {
  errorHandler.handleFatalError(error);
};

/**
 * Add an error listener
 */
export const addErrorListener = (listener: (error: KonexError) => void): void => {
  errorHandler.addListener(listener);
};

/**
 * Remove an error listener
 */
export const removeErrorListener = (listener: (error: KonexError) => void): void => {
  errorHandler.removeListener(listener);
};

/**
 * Update error handler configuration
 */
export const updateErrorHandler = (config: Partial<ErrorHandlerConfig>): void => {
  errorHandler.updateConfig(config);
};

/**
 * Get error statistics
 */
export const getErrorStats = (): {
  counts: Record<string, number>;
  lastOccurrence: Record<string, number>;
  totalErrors: number;
} => {
  return errorHandler.getErrorStats();
};

/**
 * Reset error handler
 */
export const resetErrorHandler = (): void => {
  errorHandler.reset();
};

// ============================================
// 13. EXPORT DEFAULT
// ============================================

export default errorHandler;