// @ts-nocheck
/**
 * KONEX useRealtime Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides realtime subscriptions
 * 
 * Usage:
 * const { subscribe, unsubscribe, isConnected } = useRealtime();
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { realtimeService } from '../api/realtime';
import { logger } from '../core/logger/logger.service';
import { useNetwork } from './useNetwork';

export interface UseRealtimeReturn {
  isConnected: boolean;
  subscribe: (topic: string, options: any) => any;
  unsubscribe: (subscriptionId: string) => void;
  unsubscribeAll: () => void;
  getActiveSubscriptions: () => any[];
  trackPresence: (subscriptionId: string, data: any) => void;
  untrackPresence: (subscriptionId: string) => void;
}

export const useRealtime = (): UseRealtimeReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const { isConnected: isNetworkConnected } = useNetwork();

  // ============================================
  // SUBSCRIBE
  // ============================================

  const subscribe = useCallback((topic: string, options: any) => {
    try {
      const subscription = realtimeService.subscribe(topic, options);
      subscriptionsRef.current.set(subscription.id, subscription);
      
      logger.debug('📡 Subscribed to realtime', { topic, subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      logger.error('❌ Realtime subscribe error', error);
      throw error;
    }
  }, []);

  // ============================================
  // UNSUBSCRIBE
  // ============================================

  const unsubscribe = useCallback((subscriptionId: string) => {
    try {
      realtimeService.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(subscriptionId);
      
      logger.debug('🔒 Unsubscribed from realtime', { subscriptionId });
    } catch (error) {
      logger.error('❌ Realtime unsubscribe error', error);
    }
  }, []);

  const unsubscribeAll = useCallback(() => {
    try {
      realtimeService.unsubscribeAll();
      subscriptionsRef.current.clear();
      
      logger.debug('🔒 Unsubscribed from all realtime channels');
    } catch (error) {
      logger.error('❌ Realtime unsubscribe all error', error);
    }
  }, []);

  // ============================================
  // PRESENCE
  // ============================================

  const trackPresence = useCallback((subscriptionId: string, data: any) => {
    try {
      realtimeService.trackPresence(subscriptionId, data);
    } catch (error) {
      logger.error('❌ Track presence error', error);
    }
  }, []);

  const untrackPresence = useCallback((subscriptionId: string) => {
    try {
      realtimeService.untrackPresence(subscriptionId);
    } catch (error) {
      logger.error('❌ Untrack presence error', error);
    }
  }, []);

  // ============================================
  // GET ACTIVE SUBSCRIPTIONS
  // ============================================

  const getActiveSubscriptions = useCallback(() => {
    return realtimeService.getActiveSubscriptions();
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Update connection status based on network
    setIsConnected(isNetworkConnected);
  }, [isNetworkConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, []);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    getActiveSubscriptions,
    trackPresence,
    untrackPresence,
  };
};

export default useRealtime;