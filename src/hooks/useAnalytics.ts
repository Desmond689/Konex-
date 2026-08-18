/**
 * KONEX useAnalytics Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides analytics tracking
 * 
 * Usage:
 * const { trackEvent, trackScreen, identifyUser } = useAnalytics();
 */

import { useCallback, useEffect } from 'react';
import {
    flushAnalytics,
    identifyUser as identifyAnalyticsUser,
    resetUser as resetAnalyticsUser,
    setUserProperties,
    trackEvent as trackAnalyticsEvent,
    trackScreen as trackAnalyticsScreen,
    trackError,
    trackPerformance,
    trackTiming
} from '../config/analytics';
import { logger } from '../core/logger/logger.service';
import { useAuth } from './useAuth';

export interface UseAnalyticsReturn {
  trackEvent: (name: string, properties?: Record<string, any>) => void;
  trackScreen: (name: string, properties?: Record<string, any>) => void;
  identifyUser: (userId: string, properties?: Record<string, any>) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void;
  trackTiming: (name: string, duration: number, properties?: Record<string, any>) => void;
  trackError: (error: Error | string, properties?: Record<string, any>) => void;
  trackAuthEvent: (event: string, properties?: Record<string, any>) => void;
  trackSquadEvent: (event: string, properties?: Record<string, any>) => void;
  trackPostEvent: (event: string, properties?: Record<string, any>) => void;
  trackChatEvent: (event: string, properties?: Record<string, any>) => void;
  flush: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const { user } = useAuth();

  // ============================================
  // IDENTIFY USER ON AUTH CHANGE
  // ============================================

  useEffect(() => {
    if (user) {
      identifyAnalyticsUser(user.id, {
        email: user.email,
        username: user.username,
        gamerTag: user.gamer_tag,
        gameId: user.game_id,
        gamingStyle: user.gaming_style,
        skillLevel: user.skill_level,
        role: user.role,
        squadId: user.squad_id,
        createdAt: user.created_at,
      });
    } else {
      resetAnalyticsUser();
    }
  }, [user]);

  // ============================================
  // TRACKING METHODS
  // ============================================

  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    try {
      trackAnalyticsEvent(name, {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: user?.id,
      });
    } catch (error) {
      logger.error('❌ Track event error', error);
    }
  }, [user]);

  const trackScreen = useCallback((name: string, properties?: Record<string, any>) => {
    try {
      trackAnalyticsScreen(name, {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: user?.id,
      });
    } catch (error) {
      logger.error('❌ Track screen error', error);
    }
  }, [user]);

  const identifyUser = useCallback((userId: string, properties?: Record<string, any>) => {
    try {
      identifyAnalyticsUser(userId, properties);
    } catch (error) {
      logger.error('❌ Identify user error', error);
    }
  }, []);

  const setUserPropertiesHook = useCallback((properties: Record<string, any>) => {
    try {
      setUserProperties(properties);
    } catch (error) {
      logger.error('❌ Set user properties error', error);
    }
  }, []);

  const trackPerformanceHook = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    try {
      trackPerformance(metric, value, {
        ...properties,
        userId: user?.id,
      });
    } catch (error) {
      logger.error('❌ Track performance error', error);
    }
  }, [user]);

  const trackTimingHook = useCallback((name: string, duration: number, properties?: Record<string, any>) => {
    try {
      trackTiming(name, duration, {
        ...properties,
        userId: user?.id,
      });
    } catch (error) {
      logger.error('❌ Track timing error', error);
    }
  }, [user]);

  const trackErrorHook = useCallback((error: Error | string, properties?: Record<string, any>) => {
    try {
      trackError(error, {
        ...properties,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('❌ Track error in analytics', err);
    }
  }, [user]);

  // ============================================
  // DOMAIN-SPECIFIC TRACKING
  // ============================================

  const trackAuthEvent = useCallback((event: string, properties?: Record<string, any>) => {
    trackEvent(`auth_${event}`, {
      ...properties,
      userId: user?.id,
    });
  }, [trackEvent, user]);

  const trackSquadEvent = useCallback((event: string, properties?: Record<string, any>) => {
    trackEvent(`squad_${event}`, {
      ...properties,
      userId: user?.id,
    });
  }, [trackEvent, user]);

  const trackPostEvent = useCallback((event: string, properties?: Record<string, any>) => {
    trackEvent(`post_${event}`, {
      ...properties,
      userId: user?.id,
    });
  }, [trackEvent, user]);

  const trackChatEvent = useCallback((event: string, properties?: Record<string, any>) => {
    trackEvent(`chat_${event}`, {
      ...properties,
      userId: user?.id,
    });
  }, [trackEvent, user]);

  const flush = useCallback(() => {
    try {
      flushAnalytics();
    } catch (error) {
      logger.error('❌ Flush analytics error', error);
    }
  }, []);

  return {
    trackEvent,
    trackScreen,
    identifyUser,
    setUserProperties: setUserPropertiesHook,
    trackPerformance: trackPerformanceHook,
    trackTiming: trackTimingHook,
    trackError: trackErrorHook,
    trackAuthEvent,
    trackSquadEvent,
    trackPostEvent,
    trackChatEvent,
    flush,
  };
};

export default useAnalytics;