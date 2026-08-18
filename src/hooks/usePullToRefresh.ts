/**
 * KONEX usePullToRefresh Hook
 * Billion Dollar Code - Production Ready
 * 
 * Handles pull-to-refresh functionality
 * 
 * Usage:
 * const { refreshing, onRefresh } = usePullToRefresh(refreshFn);
 */

import { useCallback, useRef, useState } from 'react';
import { logger } from '../core/logger/logger.service';

export interface UsePullToRefreshOptions {
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onError?: (error: Error) => void;
  cooldown?: number;
}

export interface UsePullToRefreshReturn {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  startRefresh: () => void;
  completeRefresh: () => void;
  cancelRefresh: () => void;
}

export const usePullToRefresh = (
  refreshFn: () => Promise<void>,
  options: UsePullToRefreshOptions = {}
): UsePullToRefreshReturn => {
  const {
    onRefreshStart,
    onRefreshComplete,
    onError,
    cooldown = 1000,
  } = options;

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const isRefreshingRef = useRef<boolean>(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup
  useState(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  });

  const startRefresh = useCallback(() => {
    if (isRefreshingRef.current) {
      return;
    }
    setRefreshing(true);
    isRefreshingRef.current = true;
    if (onRefreshStart) {
      onRefreshStart();
    }
  }, [onRefreshStart]);

  const completeRefresh = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Apply cooldown before resetting
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setRefreshing(false);
        isRefreshingRef.current = false;
        if (onRefreshComplete) {
          onRefreshComplete();
        }
      }
      cooldownTimerRef.current = null;
    }, cooldown);
  }, [cooldown, onRefreshComplete]);

  const cancelRefresh = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    
    setRefreshing(false);
    isRefreshingRef.current = false;
  }, []);

  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return;
    }

    startRefresh();

    try {
      await refreshFn();
      completeRefresh();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      logger.error('❌ Pull to refresh error', error);
      // Still complete the refresh even on error
      completeRefresh();
    }
  }, [refreshFn, startRefresh, completeRefresh, onError]);

  return {
    refreshing,
    onRefresh,
    startRefresh,
    completeRefresh,
    cancelRefresh,
  };
};

export default usePullToRefresh;