/**
 * KONEX useDeepLink Hook
 * Billion Dollar Code - Production Ready
 * 
 * Handles deep linking
 * 
 * Usage:
 * const { deepLink, handleDeepLink, clearDeepLink } = useDeepLink();
 */

import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { trackEvent } from '../config/analytics';
import { APP_SCHEME } from '../config/env.config';
import { logger } from '../core/logger/logger.service';
import * as Navigation from '../navigation/navigationRef';

export interface DeepLinkData {
  url: string;
  path: string;
  params: Record<string, string>;
  timestamp: string;
  source: 'app' | 'browser' | 'notification' | 'unknown';
}

export interface UseDeepLinkReturn {
  deepLink: DeepLinkData | null;
  isProcessing: boolean;
  error: string | null;
  handleDeepLink: (url: string) => Promise<void>;
  clearDeepLink: () => void;
  getInitialDeepLink: () => Promise<DeepLinkData | null>;
}

export const useDeepLink = (): UseDeepLinkReturn => {
  const [deepLink, setDeepLink] = useState<DeepLinkData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // PARSE DEEP LINK
  // ============================================

  const parseDeepLink = useCallback((url: string): DeepLinkData | null => {
    try {
      // Remove scheme
      let path = url;
      if (url.startsWith(APP_SCHEME)) {
        path = url.replace(`${APP_SCHEME}://`, '');
      } else if (url.startsWith('http')) {
        // Handle web links
        const parsedUrl = new URL(url);
        path = parsedUrl.pathname + parsedUrl.search;
      }

      // Split path and params
      const [pathWithoutParams, queryString] = path.split('?');
      const params: Record<string, string> = {};

      if (queryString) {
        queryString.split('&').forEach((param) => {
          const [key, value] = param.split('=');
          if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
          }
        });
      }

      // Determine source
      let source: DeepLinkData['source'] = 'unknown';
      if (url.includes('notification')) {
        source = 'notification';
      } else if (url.includes('browser')) {
        source = 'browser';
      } else if (url.includes('app')) {
        source = 'app';
      }

      return {
        url,
        path: pathWithoutParams || '/',
        params,
        timestamp: new Date().toISOString(),
        source,
      };
    } catch (err) {
      logger.error('❌ Parse deep link error', err);
      return null;
    }
  }, []);

  // ============================================
  // HANDLE DEEP LINK
  // ============================================

  const handleDeepLink = useCallback(async (url: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const parsed = parseDeepLink(url);
      if (!parsed) {
        throw new Error('Failed to parse deep link');
      }

      setDeepLink(parsed);

      // Track deep link
      trackEvent('deep_link_open', {
        path: parsed.path,
        params: parsed.params,
        source: parsed.source,
        url: parsed.url,
      });

      // Navigate based on path
      await navigateToDeepLink(parsed);

      logger.info('🔗 Deep link processed', {
        path: parsed.path,
        source: parsed.source,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to handle deep link';
      setError(errorMessage);
      logger.error('❌ Handle deep link error', err);
    } finally {
      setIsProcessing(false);
    }
  }, [parseDeepLink]);

  // ============================================
  // NAVIGATE TO DEEP LINK
  // ============================================

  const navigateToDeepLink = useCallback(async (deepLinkData: DeepLinkData) => {
    const { path, params } = deepLinkData;

    // Wait for navigation to be ready
    let attempts = 0;
    while (!Navigation.navigationRef.isReady() && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    // Route mapping
    const routes: Record<string, { screen: string; params?: any }> = {
      '/': { screen: 'Home' },
      '/home': { screen: 'Home' },
      '/profile': { screen: 'Profile', params: { userId: params.id || params.userId } },
      '/squad': { screen: 'SquadDetail', params: { squadId: params.id || params.squadId } },
      '/post': { screen: 'PostDetail', params: { postId: params.id || params.postId } },
      '/chat': { screen: 'ChatList' },
      '/dm': { screen: 'DM', params: { userId: params.id || params.userId } },
      '/squad-chat': { screen: 'SquadChat', params: { squadId: params.id || params.squadId } },
      '/community': { screen: 'Community', params: { communityId: params.id || params.communityId } },
      '/tournament': { screen: 'TournamentDetail', params: { tournamentId: params.id || params.tournamentId } },
      '/lfg': { screen: 'LFGDetail', params: { lfgId: params.id || params.lfgId } },
      '/story': { screen: 'StoryView', params: { storyId: params.id || params.storyId } },
      '/notifications': { screen: 'Notifications' },
      '/settings': { screen: 'Settings' },
      '/search': { screen: 'Search', params: { query: params.q || params.query } },
      '/onboarding': { screen: 'Onboarding' },
      '/auth': { screen: 'Login' },
    };

    // Find matching route
    let matchedRoute = routes[path];
    if (!matchedRoute) {
      // Try to match with wildcard
      const routeKeys = Object.keys(routes);
      for (const key of routeKeys) {
        if (key.includes('*') && path.startsWith(key.replace('*', ''))) {
          matchedRoute = routes[key];
          break;
        }
      }
    }

    if (matchedRoute) {
      // Merge params with route params
      const finalParams = {
        ...matchedRoute.params,
        ...params,
      };
      Navigation.navigate(matchedRoute.screen, finalParams);
    } else {
      // Default to Home
      Navigation.navigate('Home');
    }
  }, []);

  // ============================================
  // GET INITIAL DEEP LINK
  // ============================================

  const getInitialDeepLink = useCallback(async (): Promise<DeepLinkData | null> => {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        const parsed = parseDeepLink(url);
        if (parsed) {
          setDeepLink(parsed);
          return parsed;
        }
      }
      return null;
    } catch (err) {
      logger.error('❌ Get initial deep link error', err);
      return null;
    }
  }, [parseDeepLink]);

  // ============================================
  // CLEAR DEEP LINK
  // ============================================

  const clearDeepLink = useCallback(() => {
    setDeepLink(null);
    setError(null);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Handle initial deep link
    getInitialDeepLink().then((initial) => {
      if (initial) {
        handleDeepLink(initial.url);
      }
    });

    // Subscribe to deep link events
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [getInitialDeepLink, handleDeepLink]);

  return {
    deepLink,
    isProcessing,
    error,
    handleDeepLink,
    clearDeepLink,
    getInitialDeepLink,
  };
};

export default useDeepLink;