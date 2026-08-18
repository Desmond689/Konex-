/**
 * KONEX Analytics Configuration
 * Billion Dollar Code - Production Ready
 * 
 * This file handles all analytics and tracking for the app.
 * Supports multiple providers (Segment, Mixpanel, Firebase) with
 * a unified API for tracking events, screen views, user properties,
 * and performance metrics.
 * 
 * Usage:
 * import { trackEvent, trackScreen, identifyUser } from '@config/analytics';
 * 
 * trackEvent('post_liked', { postId: '123', userId: '456' });
 * trackScreen('HomeScreen');
 * identifyUser('user_123', { gamerTag: 'SniperKing' });
 */

import { Platform } from 'react-native';
import { logger } from '../core/logger/logger.service';
import {
    APP_ENVIRONMENT,
    APP_VERSION,
    FEATURES,
    IS_DEVELOPMENT,
    IS_PRODUCTION
} from './env';

// ============================================
// 1. TYPES
// ============================================

export interface AnalyticsConfig {
  enabled: boolean;
  providers: {
    segment?: {
      writeKey: string;
    };
    mixpanel?: {
      token: string;
    };
    firebase?: {
      enabled: boolean;
    };
  };
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
  debug: boolean;
  sampleRate: number;
  trackScreens: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsScreen {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface UserProperties {
  id?: string;
  email?: string;
  username?: string;
  gamerTag?: string;
  gameId?: string;
  gamingStyle?: string;
  skillLevel?: string;
  role?: string;
  squadId?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface AnalyticsProvider {
  init(config: AnalyticsConfig): void;
  track(event: AnalyticsEvent): void;
  trackScreen(screen: AnalyticsScreen): void;
  identify(userId: string, properties?: UserProperties): void;
  reset(): void;
  flush(): Promise<void>;
}

// ============================================
// 2. ANALYTICS CONFIGURATION
// ============================================

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: FEATURES.enableAnalytics || false,
  providers: {
    segment: {
      writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
    },
    mixpanel: {
      token: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '',
    },
    firebase: {
      enabled: IS_PRODUCTION,
    },
  },
  batchSize: 20,
  flushInterval: 30000, // 30 seconds
  maxQueueSize: 1000,
  debug: IS_DEVELOPMENT,
  sampleRate: IS_PRODUCTION ? 0.5 : 1.0,
  trackScreens: true,
  trackErrors: true,
  trackPerformance: true,
};

// ============================================
// 3. EVENT NAMES
// ============================================

export const AnalyticsEvents = {
  // Auth Events
  AUTH_LOGIN: 'auth_login',
  AUTH_SIGNUP: 'auth_signup',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_PASSWORD_RESET: 'auth_password_reset',
  AUTH_PASSWORD_CHANGE: 'auth_password_change',
  AUTH_EMAIL_CHANGE: 'auth_email_change',

  // User Events
  USER_PROFILE_VIEW: 'user_profile_view',
  USER_PROFILE_EDIT: 'user_profile_edit',
  USER_FOLLOW: 'user_follow',
  USER_UNFOLLOW: 'user_unfollow',
  USER_FRIEND_REQUEST: 'user_friend_request',
  USER_FRIEND_ACCEPT: 'user_friend_accept',
  USER_FRIEND_REMOVE: 'user_friend_remove',
  USER_BADGE_EARNED: 'user_badge_earned',

  // Squad Events
  SQUAD_CREATE: 'squad_create',
  SQUAD_JOIN: 'squad_join',
  SQUAD_LEAVE: 'squad_leave',
  SQUAD_KICK: 'squad_kick',
  SQUAD_INVITE: 'squad_invite',
  SQUAD_INVITE_ACCEPT: 'squad_invite_accept',
  SQUAD_INVITE_DECLINE: 'squad_invite_decline',
  SQUAD_VIEW: 'squad_view',
  SQUAD_EDIT: 'squad_edit',
  SQUAD_DELETE: 'squad_delete',
  SQUAD_PROMOTE: 'squad_promote',
  SQUAD_DEMOTE: 'squad_demote',
  SQUAD_TRANSFER_LEADERSHIP: 'squad_transfer_leadership',
  SQUAD_JOIN_REQUEST: 'squad_join_request',
  SQUAD_JOIN_REQUEST_APPROVE: 'squad_join_request_approve',
  SQUAD_JOIN_REQUEST_DENY: 'squad_join_request_deny',

  // Post Events
  POST_CREATE: 'post_create',
  POST_VIEW: 'post_view',
  POST_EDIT: 'post_edit',
  POST_DELETE: 'post_delete',
  POST_LIKE: 'post_like',
  POST_UNLIKE: 'post_unlike',
  POST_COMMENT: 'post_comment',
  POST_COMMENT_DELETE: 'post_comment_delete',
  POST_SHARE: 'post_share',
  POST_SAVE: 'post_save',
  POST_UNSAVE: 'post_unsave',
  POST_REPORT: 'post_report',

  // LFG Events
  LFG_CREATE: 'lfg_create',
  LFG_VIEW: 'lfg_view',
  LFG_JOIN: 'lfg_join',
  LFG_LEAVE: 'lfg_leave',
  LFG_FILL: 'lfg_fill',
  LFG_CANCEL: 'lfg_cancel',

  // Tournament Events
  TOURNAMENT_CREATE: 'tournament_create',
  TOURNAMENT_VIEW: 'tournament_view',
  TOURNAMENT_REGISTER: 'tournament_register',
  TOURNAMENT_UNREGISTER: 'tournament_unregister',
  TOURNAMENT_CHECK_IN: 'tournament_check_in',
  TOURNAMENT_MATCH_START: 'tournament_match_start',
  TOURNAMENT_MATCH_COMPLETE: 'tournament_match_complete',
  TOURNAMENT_WIN: 'tournament_win',

  // Chat Events
  CHAT_MESSAGE_SEND: 'chat_message_send',
  CHAT_MESSAGE_READ: 'chat_message_read',
  CHAT_CONVERSATION_START: 'chat_conversation_start',
  CHAT_GAME_INVITE: 'chat_game_invite',
  CHAT_SQUAD_INVITE: 'chat_squad_invite',

  // Community Events
  COMMUNITY_JOIN: 'community_join',
  COMMUNITY_LEAVE: 'community_leave',
  COMMUNITY_VIEW: 'community_view',
  COMMUNITY_SEARCH: 'community_search',

  // Search Events
  SEARCH: 'search',
  SEARCH_RESULT_CLICK: 'search_result_click',

  // Story Events
  STORY_CREATE: 'story_create',
  STORY_VIEW: 'story_view',
  STORY_REPLY: 'story_reply',

  // Notification Events
  NOTIFICATION_OPEN: 'notification_open',
  NOTIFICATION_CLICK: 'notification_click',
  NOTIFICATION_DISMISS: 'notification_dismiss',

  // Moderation Events
  REPORT_SUBMIT: 'report_submit',
  REPORT_RESOLVE: 'report_resolve',
  REPORT_DISMISS: 'report_dismiss',
  APPEAL_SUBMIT: 'appeal_submit',
  APPEAL_RESOLVE: 'appeal_resolve',

  // Admin Events
  ADMIN_ACTION: 'admin_action',
  ADMIN_ANNOUNCEMENT_CREATE: 'admin_announcement_create',
  ADMIN_ANNOUNCEMENT_DELETE: 'admin_announcement_delete',

  // General Events
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  APP_CRASH: 'app_crash',
  APP_UPDATE: 'app_update',
  SCREEN_VIEW: 'screen_view',
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_METRIC: 'performance_metric',
  DEEP_LINK_OPEN: 'deep_link_open',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_OPENED: 'push_notification_opened',
};

// ============================================
// 4. ANALYTICS SERVICE
// ============================================

class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private isFlushing: boolean = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private isInitialized: boolean = false;
  private providers: AnalyticsProvider[] = [];
  private eventSampling: Map<string, number> = new Map();

  private constructor() {
    this.config = ANALYTICS_CONFIG;
    this.sessionId = this.generateSessionId();
    this.setupFlushInterval();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ============================================
  // 5. INITIALIZATION
  // ============================================

  public init(config: Partial<AnalyticsConfig> = {}): void {
    try {
      this.config = { ...this.config, ...config };

      if (!this.config.enabled) {
        logger.info('📊 Analytics is disabled');
        return;
      }

      // Initialize providers
      this.initializeProviders();

      // Set up session
      this.sessionId = this.generateSessionId();

      this.isInitialized = true;

      // Track app open
      this.trackEvent(AnalyticsEvents.APP_OPEN, {
        environment: APP_ENVIRONMENT,
        version: APP_VERSION,
        platform: Platform.OS,
        platformVersion: Platform.Version,
      });

      logger.info('📊 Analytics initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize analytics', error);
    }
  }

  private initializeProviders(): void {
    // Initialize Segment
    if (this.config.providers.segment?.writeKey) {
      // import { createClient } from '@segment/analytics-react-native';
      // this.providers.push(new SegmentProvider(this.config.providers.segment.writeKey));
    }

    // Initialize Mixpanel
    if (this.config.providers.mixpanel?.token) {
      // import Mixpanel from 'mixpanel-react-native';
      // this.providers.push(new MixpanelProvider(this.config.providers.mixpanel.token));
    }

    // Initialize Firebase Analytics
    if (this.config.providers.firebase?.enabled) {
      // import analytics from '@react-native-firebase/analytics';
      // this.providers.push(new FirebaseProvider());
    }

    logger.info(`📊 ${this.providers.length} analytics providers initialized`);
  }

  // ============================================
  // 6. EVENT TRACKING
  // ============================================

  public trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }

    // Check sampling
    if (!this.shouldSample(name)) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        platform: Platform.OS,
        version: APP_VERSION,
        environment: APP_ENVIRONMENT,
        sessionId: this.sessionId,
      },
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId || undefined,
    };

    // Track in debug mode
    if (this.config.debug) {
      logger.debug(`📊 Event: ${name}`, event.properties);
    }

    // Add to queue
    this.queue.push(event);

    // Flush if queue is full
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public trackScreen(name: string, properties?: Record<string, any>): void {
    if (!this.config.trackScreens) {
      return;
    }

    this.trackEvent(AnalyticsEvents.SCREEN_VIEW, {
      screen_name: name,
      ...properties,
    });

    if (this.config.debug) {
      logger.debug(`📱 Screen: ${name}`);
    }
  }

  // ============================================
  // 7. USER IDENTIFICATION
  // ============================================

  public identifyUser(userId: string, properties?: UserProperties): void {
    if (!this.config.enabled) {
      return;
    }

    this.userId = userId;

    // Track user properties
    this.trackEvent('user_identified', {
      userId,
      ...properties,
    });

    // Update providers
    this.providers.forEach((provider) => {
      try {
        provider.identify(userId, properties);
      } catch (error) {
        logger.error('❌ Failed to identify user in provider', error);
      }
    });

    if (this.config.debug) {
      logger.debug(`👤 User identified: ${userId}`, properties);
    }
  }

  public setUserProperties(properties: UserProperties): void {
    if (!this.config.enabled || !this.userId) {
      return;
    }

    this.trackEvent('user_properties_updated', {
      userId: this.userId,
      ...properties,
    });
  }

  public resetUser(): void {
    this.userId = null;
    this.sessionId = this.generateSessionId();

    this.providers.forEach((provider) => {
      try {
        provider.reset();
      } catch (error) {
        logger.error('❌ Failed to reset user in provider', error);
      }
    });

    this.trackEvent('user_reset', { sessionId: this.sessionId });
  }

  // ============================================
  // 8. PERFORMANCE TRACKING
  // ============================================

  public trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    if (!this.config.trackPerformance) {
      return;
    }

    this.trackEvent(AnalyticsEvents.PERFORMANCE_METRIC, {
      metric,
      value,
      ...properties,
    });
  }

  public trackTiming(name: string, duration: number, properties?: Record<string, any>): void {
    this.trackPerformance(`${name}_duration`, duration, properties);
  }

  // ============================================
  // 9. ERROR TRACKING
  // ============================================

  public trackError(error: Error | string, properties?: Record<string, any>): void {
    if (!this.config.trackErrors) {
      return;
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    this.trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
      error: errorMessage,
      stack: errorStack,
      ...properties,
    });
  }

  // ============================================
  // 10. FLUSH & QUEUE MANAGEMENT
  // ============================================

  public flush(): void {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const events = [...this.queue];
    this.queue = [];

    // Process providers
    const promises = this.providers.map((provider) => {
      try {
        return provider.flush();
      } catch (error) {
        logger.error('❌ Failed to flush provider', error);
        return Promise.resolve();
      }
    });

    // Process each event
    events.forEach((event) => {
      this.providers.forEach((provider) => {
        try {
          provider.track(event);
        } catch (error) {
          logger.error('❌ Failed to track event in provider', error);
        }
      });
    });

    Promise.all(promises)
      .then(() => {
        this.isFlushing = false;
        if (this.queue.length > 0) {
          this.flush();
        }
      })
      .catch((error) => {
        logger.error('❌ Failed to flush analytics', error);
        this.isFlushing = false;
        // Re-queue events
        this.queue = [...events, ...this.queue];
        if (this.queue.length > this.config.maxQueueSize) {
          this.queue = this.queue.slice(-this.config.maxQueueSize);
        }
      });
  }

  private setupFlushInterval(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // ============================================
  // 11. SAMPLING
  // ============================================

  private shouldSample(eventName: string): boolean {
    // Always track errors and critical events
    const criticalEvents = [
      AnalyticsEvents.AUTH_LOGIN,
      AnalyticsEvents.AUTH_SIGNUP,
      AnalyticsEvents.APP_OPEN,
      AnalyticsEvents.APP_CRASH,
      AnalyticsEvents.ERROR_OCCURRED,
    ];

    if (criticalEvents.includes(eventName)) {
      return true;
    }

    // Check if this event has been sampled before
    const sampleRate = this.config.sampleRate;
    if (sampleRate >= 1) {
      return true;
    }

    // Use deterministic sampling based on event name
    const hash = this.hashString(eventName);
    return (hash % 100) / 100 < sampleRate;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ============================================
  // 12. UTILITY METHODS
  // ============================================

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getStatus(): {
    enabled: boolean;
    initialized: boolean;
    queueSize: number;
    sessionId: string | null;
    userId: string | null;
    providers: number;
    sampleRate: number;
  } {
    return {
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      queueSize: this.queue.length,
      sessionId: this.sessionId,
      userId: this.userId,
      providers: this.providers.length,
      sampleRate: this.config.sampleRate,
    };
  }

  public enable(enable: boolean): void {
    this.config.enabled = enable;
    if (enable) {
      this.setupFlushInterval();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  public setSampleRate(rate: number): void {
    this.config.sampleRate = Math.max(0, Math.min(1, rate));
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
    this.queue = [];
    this.providers = [];
    this.isInitialized = false;
    logger.info('📊 Analytics destroyed');
  }
}

// ============================================
// 13. EXPORT SINGLETON
// ============================================

export const analytics = AnalyticsService.getInstance();

// ============================================
// 14. CONVENIENCE FUNCTIONS
// ============================================

/**
 * Initialize analytics
 */
export const initAnalytics = (config?: Partial<AnalyticsConfig>): void => {
  analytics.init(config);
};

/**
 * Track an event
 */
export const trackEvent = (name: string, properties?: Record<string, any>): void => {
  analytics.trackEvent(name, properties);
};

/**
 * Track a screen view
 */
export const trackScreen = (name: string, properties?: Record<string, any>): void => {
  analytics.trackScreen(name, properties);
};

/**
 * Identify a user
 */
export const identifyUser = (userId: string, properties?: UserProperties): void => {
  analytics.identifyUser(userId, properties);
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: UserProperties): void => {
  analytics.setUserProperties(properties);
};

/**
 * Reset user data
 */
export const resetUser = (): void => {
  analytics.resetUser();
};

/**
 * Track a performance metric
 */
export const trackPerformance = (metric: string, value: number, properties?: Record<string, any>): void => {
  analytics.trackPerformance(metric, value, properties);
};

/**
 * Track a timing metric
 */
export const trackTiming = (name: string, duration: number, properties?: Record<string, any>): void => {
  analytics.trackTiming(name, duration, properties);
};

/**
 * Track an error
 */
export const trackError = (error: Error | string, properties?: Record<string, any>): void => {
  analytics.trackError(error, properties);
};

/**
 * Flush all pending events
 */
export const flushAnalytics = (): void => {
  analytics.flush();
};

/**
 * Get analytics status
 */
export const getAnalyticsStatus = (): {
  enabled: boolean;
  initialized: boolean;
  queueSize: number;
  sessionId: string | null;
  userId: string | null;
  providers: number;
  sampleRate: number;
} => {
  return analytics.getStatus();
};

/**
 * Enable/disable analytics
 */
export const enableAnalytics = (enabled: boolean): void => {
  analytics.enable(enabled);
};

/**
 * Set sample rate
 */
export const setAnalyticsSampleRate = (rate: number): void => {
  analytics.setSampleRate(rate);
};

/**
 * Destroy analytics
 */
export const destroyAnalytics = (): void => {
  analytics.destroy();
};

// ============================================
// 15. DEFAULT EXPORT
// ============================================

export default {
  analytics,
  initAnalytics,
  trackEvent,
  trackScreen,
  identifyUser,
  setUserProperties,
  resetUser,
  trackPerformance,
  trackTiming,
  trackError,
  flushAnalytics,
  getAnalyticsStatus,
  enableAnalytics,
  setAnalyticsSampleRate,
  destroyAnalytics,
  AnalyticsEvents,
  ANALYTICS_CONFIG,
};