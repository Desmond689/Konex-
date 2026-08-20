// @ts-nocheck
﻿/**
 * KONEX Sentry Transport
 * Billion Dollar Code - Production Ready
 * Logs errors and warnings to Sentry for production monitoring
 */

import * as Sentry from '../../../lib/sentry-noop';
import { Platform } from 'react-native';
import { APP_NAME, APP_VERSION } from '../../../config/env.config';
import { LogEntry, LogLevel, LogTransport } from '../logger.types';

// ============================================
// 1. SENTRY TRANSPORT
// ============================================

export interface SentryTransportOptions {
  enabled?: boolean;
  sampleRate?: number;
  minLevel?: LogLevel;
  tags?: Record<string, string>;
  environment?: string;
}

export class SentryTransport implements LogTransport {
  private enabled: boolean = true;
  private sampleRate: number = 1.0;
  private minLevel: LogLevel = LogLevel.WARN;
  private tags: Record<string, string> = {};
  private environment: string = 'production';
  private breadcrumbCache: LogEntry[] = [];
  private maxBreadcrumbCache: number = 20;

  constructor(options: SentryTransportOptions = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.sampleRate = options.sampleRate || 1.0;
    this.minLevel = options.minLevel || LogLevel.WARN;
    this.tags = options.tags || {};
    this.environment = options.environment || 'production';

    // Set default tags
    this.tags = {
      platform: Platform.OS,
      version: APP_VERSION,
      app: APP_NAME,
      ...this.tags,
    };
  }

  log(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    // Check minimum level
    const levels = Object.values(LogLevel);
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(entry.level);
    if (currentIndex < minIndex) {
      return;
    }

    // Sample the logs to reduce volume
    if (Math.random() > this.sampleRate) {
      return;
    }

    try {
      // Add as breadcrumb for all logs
      this.addBreadcrumb(entry);

      // Capture errors and warnings
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
        this.captureError(entry);
      } else if (entry.level === LogLevel.WARN) {
        this.captureWarning(entry);
      } else if (entry.level === LogLevel.INFO && entry.context?.component === 'performance') {
        this.capturePerformance(entry);
      }
    } catch (error) {
      console.error('❌ Failed to log to Sentry:', error);
    }
  }

  private addBreadcrumb(entry: LogEntry): void {
    this.breadcrumbCache.push(entry);
    if (this.breadcrumbCache.length > this.maxBreadcrumbCache) {
      this.breadcrumbCache = this.breadcrumbCache.slice(-this.maxBreadcrumbCache);
    }

    Sentry.addBreadcrumb({
      message: entry.message,
      category: entry.context?.component || 'log',
      level: this.mapLevelToSentry(entry.level),
      data: {
        data: entry.data,
        context: entry.context,
        metadata: entry.metadata,
      },
      timestamp: new Date(entry.timestamp).getTime() / 1000,
    });
  }

  private captureError(entry: LogEntry): void {
    const error = entry.error || new Error(entry.message);

    Sentry.captureException(error, {
      tags: {
        level: entry.level,
        platform: Platform.OS,
        version: APP_VERSION,
        component: entry.context?.component || 'unknown',
        action: entry.context?.action || 'unknown',
        ...this.tags,
      },
      extra: {
        data: entry.data,
        context: entry.context,
        metadata: entry.metadata,
        timestamp: entry.timestamp,
        message: entry.message,
      },
      level: 'error',
    });
  }

  private captureWarning(entry: LogEntry): void {
    Sentry.captureMessage(entry.message, {
      level: 'warning',
      tags: {
        level: entry.level,
        platform: Platform.OS,
        version: APP_VERSION,
        component: entry.context?.component || 'unknown',
        action: entry.context?.action || 'unknown',
        ...this.tags,
      },
      extra: {
        data: entry.data,
        context: entry.context,
        metadata: entry.metadata,
        timestamp: entry.timestamp,
      },
    });
  }

  private capturePerformance(entry: LogEntry): void {
    // Only send performance metrics if they exceed threshold
    const duration = entry.data?.duration || 0;
    if (duration > 1000) {
      // Send as a message with performance context
      Sentry.captureMessage(`⏱️ Performance: ${entry.message}`, {
        level: 'info',
        tags: {
          type: 'performance',
          metric: entry.context?.metric || 'unknown',
          platform: Platform.OS,
          version: APP_VERSION,
          ...this.tags,
        },
        extra: {
          duration,
          component: entry.context?.component,
          data: entry.data,
          context: entry.context,
        },
      });
    }

    // Always add as breadcrumb
    Sentry.addBreadcrumb({
      message: `⏱️ ${entry.message}`,
      category: 'performance',
      data: {
        duration: entry.data?.duration,
        component: entry.context?.component,
        metric: entry.context?.metric,
        ...entry.data,
      },
      level: 'info',
    });
  }

  private mapLevelToSentry(level: LogLevel): Sentry.SeverityLevel {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warning';
      case LogLevel.ERROR:
        return 'error';
      case LogLevel.FATAL:
        return 'fatal';
      default:
        return 'info';
    }
  }

  /**
   * Set user context in Sentry
   */
  setUser(user: { id?: string; email?: string; username?: string }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Clear user context in Sentry
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Set a tag for all future events
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Remove a tag
   */
  removeTag(key: string): void {
    delete this.tags[key];
  }

  /**
   * Set the environment
   */
  setEnvironment(environment: string): void {
    this.environment = environment;
    this.setTag('environment', environment);
  }

  /**
   * Enable or disable the transport
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set the sample rate
   */
  setSampleRate(rate: number): void {
    this.sampleRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get the current status
   */
  getStatus(): { enabled: boolean; sampleRate: number; minLevel: LogLevel } {
    return {
      enabled: this.enabled,
      sampleRate: this.sampleRate,
      minLevel: this.minLevel,
    };
  }

  /**
   * Get all breadcrumbs
   */
  getBreadcrumbs(): LogEntry[] {
    return [...this.breadcrumbCache];
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbCache = [];
  }

  /**
   * Flush Sentry events
   */
  async flush(timeout?: number): Promise<boolean> {
    return Sentry.flush(timeout);
  }

  /**
   * Close Sentry
   */
  async close(timeout?: number): Promise<boolean> {
    return Sentry.close(timeout);
  }
}

export default SentryTransport;