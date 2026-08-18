/**
 * KONEX Sentry Configuration
 * Billion Dollar Code - Production Ready
 * 
 * This file configures Sentry for error tracking and performance monitoring.
 * It handles initialization, error capturing, breadcrumbs, and user context.
 * 
 * Usage:
 * import { initSentry, captureError, setUserContext } from '@config/sentry';
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import { logger } from '../core/logger/logger.service';
import {
    APP_ENVIRONMENT,
    APP_NAME,
    APP_VERSION,
    IS_DEVELOPMENT,
    IS_PRODUCTION,
    SENTRY_DSN
} from './env';

// ============================================
// 1. TYPES
// ============================================

export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enableInExpoDevelopment: boolean;
  enableNative: boolean;
  enableAutoSessionTracking: boolean;
  attachScreenshot: boolean;
  attachViewHierarchy: boolean;
  maxBreadcrumbs: number;
  beforeSend?: (event: any) => any;
  integrations?: any[];
}

export interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  gamerTag?: string;
  [key: string]: any;
}

// ============================================
// 2. DEFAULT CONFIGURATION
// ============================================

export const SENTRY_CONFIG: SentryConfig = {
  dsn: SENTRY_DSN || '',
  environment: APP_ENVIRONMENT,
  release: APP_VERSION,
  tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,
  profilesSampleRate: IS_PRODUCTION ? 0.1 : 0.5,
  enableInExpoDevelopment: false,
  enableNative: true,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  maxBreadcrumbs: 100,
};

// ============================================
// 3. INITIALIZATION
// ============================================

/**
 * Initialize Sentry
 */
export const initSentry = (config: Partial<SentryConfig> = {}): void => {
  // Skip initialization if no DSN is provided
  if (!SENTRY_DSN) {
    if (IS_DEVELOPMENT) {
      logger.warn('⚠️ Sentry DSN not provided. Skipping Sentry initialization.');
    }
    return;
  }

  // Skip in development unless explicitly enabled
  if (IS_DEVELOPMENT && !config.enableInExpoDevelopment) {
    logger.debug('🔍 Sentry disabled in development mode');
    return;
  }

  try {
    const finalConfig = {
      ...SENTRY_CONFIG,
      ...config,
    };

    // Filter out undefined values
    const cleanConfig = Object.fromEntries(
      Object.entries(finalConfig).filter(([_, value]) => value !== undefined)
    );

    Sentry.init(cleanConfig);

    // Set tags
    Sentry.setTag('platform', Platform.OS);
    Sentry.setTag('app_name', APP_NAME);
    Sentry.setTag('environment', APP_ENVIRONMENT);

    // Set extra context
    Sentry.setExtra('platform_version', Platform.Version);
    Sentry.setExtra('is_production', IS_PRODUCTION);

    logger.info('✅ Sentry initialized successfully', {
      environment: APP_ENVIRONMENT,
      version: APP_VERSION,
      platform: Platform.OS,
    });
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry', error);
  }
};

// ============================================
// 4. ERROR CAPTURING
// ============================================

/**
 * Capture an error and send it to Sentry
 */
export const captureError = (
  error: Error | string,
  context?: Record<string, any>,
  tags?: Record<string, string>
): void => {
  try {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    Sentry.captureException(errorObj, {
      tags: {
        ...tags,
        platform: Platform.OS,
        version: APP_VERSION,
      },
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });

    if (IS_DEVELOPMENT) {
      logger.debug('📤 Error sent to Sentry:', {
        message: errorObj.message,
        context,
        tags,
      });
    }
  } catch (sentryError) {
    logger.error('❌ Failed to capture error in Sentry', sentryError);
  }
};

/**
 * Capture a message and send it to Sentry
 */
export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>,
  tags?: Record<string, string>
): void => {
  try {
    Sentry.captureMessage(message, {
      level,
      tags: {
        ...tags,
        platform: Platform.OS,
        version: APP_VERSION,
      },
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });

    if (IS_DEVELOPMENT) {
      logger.debug(`📤 Message sent to Sentry (${level}):`, {
        message,
        context,
        tags,
      });
    }
  } catch (sentryError) {
    logger.error('❌ Failed to capture message in Sentry', sentryError);
  }
};

// ============================================
// 5. USER CONTEXT
// ============================================

/**
 * Set user context in Sentry
 */
export const setUserContext = (user: UserContext | null): void => {
  try {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        // Sentry expects 'username' but we use 'gamerTag' - map it
        ...(user.gamerTag && { username: user.gamerTag }),
        ...user,
      });

      // Set user tags
      if (user.id) {
        Sentry.setTag('user_id', user.id);
      }
      if (user.gamerTag) {
        Sentry.setTag('gamer_tag', user.gamerTag);
      }

      logger.debug('👤 User context set in Sentry', { userId: user.id });
    } else {
      Sentry.setUser(null);
      logger.debug('👤 User context cleared from Sentry');
    }
  } catch (sentryError) {
    logger.error('❌ Failed to set user context in Sentry', sentryError);
  }
};

/**
 * Clear user context from Sentry
 */
export const clearUserContext = (): void => {
  setUserContext(null);
};

// ============================================
// 6. BREADCRUMBS
// ============================================

/**
 * Add a breadcrumb to Sentry
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  data?: Record<string, any>,
  level: 'info' | 'warning' | 'error' | 'fatal' = 'info'
): void => {
  try {
    Sentry.addBreadcrumb({
      message,
      category: category || 'app',
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        version: APP_VERSION,
      },
      level,
    });

    if (IS_DEVELOPMENT) {
      logger.debug(`🍞 Breadcrumb added (${category}):`, { message, category, data });
    }
  } catch (sentryError) {
    logger.error('❌ Failed to add breadcrumb to Sentry', sentryError);
  }
};

// ============================================
// 7. PERFORMANCE MONITORING
// ============================================

/**
 * Start a performance transaction
 */
export const startTransaction = (
  name: string,
  op: string = 'app'
): Sentry.Transaction | null => {
  try {
    const transaction = Sentry.startTransaction({
      name,
      op,
      tags: {
        platform: Platform.OS,
        version: APP_VERSION,
      },
    });

    if (IS_DEVELOPMENT) {
      logger.debug(`⏱️ Transaction started: ${name}`);
    }

    return transaction;
  } catch (sentryError) {
    logger.error('❌ Failed to start transaction in Sentry', sentryError);
    return null;
  }
};

/**
 * Finish a performance transaction
 */
export const finishTransaction = (
  transaction: Sentry.Transaction | null,
  status: 'ok' | 'error' = 'ok'
): void => {
  if (!transaction) return;

  try {
    transaction.setStatus(status);
    transaction.finish();

    if (IS_DEVELOPMENT) {
      logger.debug(`⏱️ Transaction finished: ${transaction.name}`);
    }
  } catch (sentryError) {
    logger.error('❌ Failed to finish transaction in Sentry', sentryError);
  }
};

// ============================================
// 8. CONTEXT HELPERS
// ============================================

/**
 * Set context for the current operation
 */
export const setOperationContext = (context: Record<string, any>): void => {
  try {
    Object.entries(context).forEach(([key, value]) => {
      Sentry.setExtra(key, value);
    });
  } catch (sentryError) {
    logger.error('❌ Failed to set operation context in Sentry', sentryError);
  }
};

/**
 * Set tags for the current operation
 */
export const setOperationTags = (tags: Record<string, string>): void => {
  try {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  } catch (sentryError) {
    logger.error('❌ Failed to set operation tags in Sentry', sentryError);
  }
};

/**
 * Clear all operation context
 */
export const clearOperationContext = (): void => {
  try {
    // Sentry doesn't have a direct way to clear extras
    // We'll set them to null or undefined
    Sentry.setExtra('operation', null);
  } catch (sentryError) {
    logger.error('❌ Failed to clear operation context in Sentry', sentryError);
  }
};

// ============================================
// 9. BEFORE SEND FILTER
// ============================================

/**
 * Filter events before sending to Sentry
 */
export const beforeSend = (event: any): any => {
  try {
    // Remove sensitive data from event
    if (event.request && event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }

    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb: any) => {
        if (breadcrumb.data) {
          // Remove sensitive fields
          const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card'];
          sensitiveFields.forEach((field) => {
            if (breadcrumb.data[field]) {
              breadcrumb.data[field] = '[REDACTED]';
            }
          });
        }
        return breadcrumb;
      });
    }

    // Remove sensitive data from extra
    if (event.extra) {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card'];
      sensitiveFields.forEach((field) => {
        if (event.extra[field]) {
          event.extra[field] = '[REDACTED]';
        }
      });
    }

    return event;
  } catch (error) {
    logger.error('❌ Failed to filter event for Sentry', error);
    return event;
  }
};

// ============================================
// 10. UTILITY FUNCTIONS
// ============================================

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = (): boolean => {
  return !!SENTRY_DSN && IS_PRODUCTION;
};

/**
 * Get the current Sentry status
 */
export const getSentryStatus = (): {
  enabled: boolean;
  environment: string;
  version: string;
  dsnConfigured: boolean;
} => {
  return {
    enabled: isSentryEnabled(),
    environment: APP_ENVIRONMENT,
    version: APP_VERSION,
    dsnConfigured: !!SENTRY_DSN,
  };
};

/**
 * Flush Sentry events
 */
export const flushSentry = async (timeout?: number): Promise<boolean> => {
  try {
    return await Sentry.flush(timeout || 2000);
  } catch (error) {
    logger.error('❌ Failed to flush Sentry', error);
    return false;
  }
};

/**
 * Close Sentry
 */
export const closeSentry = async (timeout?: number): Promise<boolean> => {
  try {
    return await Sentry.close(timeout || 2000);
  } catch (error) {
    logger.error('❌ Failed to close Sentry', error);
    return false;
  }
};

// ============================================
// 11. DEFAULT EXPORT
// ============================================

export default {
  initSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  finishTransaction,
  setOperationContext,
  setOperationTags,
  clearOperationContext,
  beforeSend,
  isSentryEnabled,
  getSentryStatus,
  flushSentry,
  closeSentry,
  SENTRY_CONFIG,
};