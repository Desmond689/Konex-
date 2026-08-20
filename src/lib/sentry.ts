// @ts-nocheck
/**
 * KONEX Sentry Library
 * Billion Dollar Code - Production Ready
 * 
 * Wrapper for Sentry error tracking with user context and breadcrumbs
 * 
 * Usage:
 * import { captureException, captureMessage, setUser } from '@lib/sentry';
 */

import * as Sentry from './sentry-noop';
import { APP_ENVIRONMENT, APP_VERSION, FEATURES, IS_PRODUCTION, SENTRY_DSN } from '../config/env';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface SentryUser {
  id: string;
  username?: string;
  email?: string;
  gamerTag?: string;
}

// ============================================
// 2. INITIALIZATION
// ============================================

let isInitialized = false;

/**
 * Initialize Sentry
 */
export const initializeSentry = (): void => {
  if (isInitialized) return;
  if (!FEATURES.enableSentry || !SENTRY_DSN) {
    logger.warn('⚠️ Sentry not enabled or DSN missing');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENVIRONMENT || 'development',
      release: APP_VERSION || '0.0.1',
      tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,
      profilesSampleRate: IS_PRODUCTION ? 0.1 : 0.5,
      enableInExpoDevelopment: false,
      enableNative: true,
      enableAutoSessionTracking: true,
      attachScreenshot: true,
      attachViewHierarchy: true,
      maxBreadcrumbs: 100,
    });

    isInitialized = true;
    logger.info('🚨 Sentry initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry', { error });
  }
};

// ============================================
// 3. ERROR CAPTURING
// ============================================

/**
 * Capture an exception
 */
export const captureException = (
  error: Error | string,
  context?: Record<string, any>
): void => {
  try {
    if (!isInitialized) {
      logger.warn('⚠️ Sentry not initialized, exception not captured', { error });
      return;
    }

    if (typeof error === 'string') {
      Sentry.captureException(new Error(error), {
        extra: context,
      });
    } else {
      Sentry.captureException(error, {
        extra: context,
      });
    }

    logger.error('🚨 Exception captured', { error, context });
  } catch (err) {
    logger.error('❌ Failed to capture exception', { error: err });
  }
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>
): void => {
  try {
    if (!isInitialized) {
      logger.warn('⚠️ Sentry not initialized, message not captured', { message });
      return;
    }

    Sentry.captureMessage(message, {
      level,
      extra: context,
    });

    logger.debug('📝 Message captured', { message, level, context });
  } catch (error) {
    logger.error('❌ Failed to capture message', { error });
  }
};

// ============================================
// 4. USER CONTEXT
// ============================================

/**
 * Set user context
 */
export const setUser = (user: SentryUser | null): void => {
  try {
    if (!isInitialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        // Add custom data
        gamerTag: user.gamerTag,
      });
      logger.debug('👤 Sentry user set', { userId: user.id });
    } else {
      Sentry.setUser(null);
      logger.debug('👤 Sentry user cleared');
    }
  } catch (error) {
    logger.error('❌ Failed to set Sentry user', { error });
  }
};

/**
 * Set user tags
 */
export const setTags = (tags: Record<string, string | number | boolean>): void => {
  try {
    if (!isInitialized) return;

    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, String(value));
    });

    logger.debug('🏷️ Sentry tags set', { tags });
  } catch (error) {
    logger.error('❌ Failed to set Sentry tags', { error });
  }
};

// ============================================
// 5. BREADCRUMBS
// ============================================

/**
 * Add a breadcrumb
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: 'info' | 'warning' | 'error' | 'fatal',
  data?: Record<string, any>
): void => {
  try {
    if (!isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    });

    if (IS_PRODUCTION) {
      logger.debug('🍞 Breadcrumb added', { message, category, level });
    }
  } catch (error) {
    logger.error('❌ Failed to add breadcrumb', { error });
  }
};

/**
 * Create a transaction for performance monitoring
 */
export const startTransaction = (
  name: string,
  op: string,
  tags?: Record<string, string>
): any => {
  try {
    if (!isInitialized) return null;

    const transaction = Sentry.startTransaction({
      name,
      op,
      tags,
    });

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
    });

    return transaction;
  } catch (error) {
    logger.error('❌ Failed to start transaction', { error });
    return null;
  }
};

/**
 * Finish a transaction
 */
export const finishTransaction = (transaction: any): void => {
  try {
    if (!transaction) return;
    transaction.finish();
  } catch (error) {
    logger.error('❌ Failed to finish transaction', { error });
  }
};

// ============================================
// 6. PERFORMANCE
// ============================================

/**
 * Measure a function's performance
 */
export const measurePerformance = <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  
  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      addBreadcrumb(`Performance: ${name}`, 'performance', 'info', {
        duration,
        name,
      });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      addBreadcrumb(`Performance Error: ${name}`, 'performance', 'error', {
        duration,
        name,
        error: error.message,
      });
      throw error;
    });
};

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default {
  initializeSentry,
  captureException,
  captureMessage,
  setUser,
  setTags,
  addBreadcrumb,
  startTransaction,
  finishTransaction,
  measurePerformance,
};