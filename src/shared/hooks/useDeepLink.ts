/**
 * KONEX useDeepLink Hook
 * Billion Dollar Code - Production Ready
 * 
 * Handles deep linking
 * 
 * Usage:
 * const { handleDeepLink, initialUrl } = useDeepLink();
 */

import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { logger } from '../../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface DeepLinkData {
  /** Full URL */
  url: string;
  /** Parsed route */
  route: string;
  /** Query parameters */
  params: Record<string, string>;
}

export interface UseDeepLinkReturn {
  /** Initial URL */
  initialUrl: string | null;
  /** Last deep link */
  lastDeepLink: DeepLinkData | null;
  /** Handle deep link */
  handleDeepLink: (url: string) => void;
  /** Parse URL */
  parseUrl: (url: string) => DeepLinkData | null;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export function useDeepLink(): UseDeepLinkReturn {
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const [lastDeepLink, setLastDeepLink] = useState<DeepLinkData | null>(null);

  // ============================================
  // PARSE URL
  // ============================================

  const parseUrl = useCallback((url: string): DeepLinkData | null => {
    try {
      const parsed = new URL(url);
      const route = parsed.hostname + parsed.pathname;
      const params: Record<string, string> = {};

      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        url,
        route,
        params,
      };
    } catch (error) {
      logger.error('❌ Failed to parse deep link URL', { url, error });
      return null;
    }
  }, []);

  // ============================================
  // HANDLE DEEP LINK
  // ============================================

  const handleDeepLink = useCallback((url: string) => {
    const parsed = parseUrl(url);
    if (parsed) {
      setLastDeepLink(parsed);
      logger.info('🔗 Deep link received', { url, route: parsed.route });
    }
  }, [parseUrl]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Get initial URL
    const getInitialUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          setInitialUrl(url);
          handleDeepLink(url);
        }
      } catch (error) {
        logger.error('❌ Failed to get initial URL', { error });
      }
    };

    getInitialUrl();

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return {
    initialUrl,
    lastDeepLink,
    handleDeepLink,
    parseUrl,
  };
}

export default useDeepLink;