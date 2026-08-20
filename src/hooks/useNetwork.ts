/**
 * KONEX useNetwork Hook
 * Billion Dollar Code - Production Ready
 * 
 * Tracks network connectivity status
 * 
 * Usage:
 * const { isConnected, isWifi, isCellular } = useNetwork();
 */

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { trackEvent } from '../config/analytics';
import { logger } from '../core/logger/logger.service';

export interface UseNetworkReturn {
  isConnected: boolean;
  isWifi: boolean;
  isCellular: boolean;
  isUnknown: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  cellularGeneration: string | null;
  previousState: boolean | null;
}

export const useNetwork = (): UseNetworkReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isWifi, setIsWifi] = useState<boolean>(false);
  const [isCellular, setIsCellular] = useState<boolean>(false);
  const [isUnknown, setIsUnknown] = useState<boolean>(false);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [cellularGeneration, setCellularGeneration] = useState<string | null>(null);
  const [previousState, setPreviousState] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const initNetwork = async () => {
      try {
        const state = await NetInfo.fetch();
        updateNetworkState(state);

        unsubscribe = NetInfo.addEventListener((newState) => {
          updateNetworkState(newState);
        });
      } catch (error) {
        logger.error('❌ Network monitoring error', error);
      }
    };

    initNetwork();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const updateNetworkState = (state: any) => {
    const wasConnected = isConnected;
    const newConnected = state.isConnected || false;
    const newReachable = state.isInternetReachable || false;

    // Track network changes
    if (wasConnected !== newConnected) {
      setPreviousState(wasConnected);
      
      logger.debug(`📡 Network changed: ${wasConnected} -> ${newConnected}`);
      trackEvent('network_change', {
        from: wasConnected,
        to: newConnected,
        type: state.type,
      });

      // If network was lost, show notification
      if (!newConnected) {
        logger.warn('⚠️ Network connection lost');
      } else {
        logger.info('✅ Network connection restored');
      }
    }

    setIsConnected(newConnected);
    setIsInternetReachable(newReachable);
    setConnectionType(state.type || null);
    
    setIsWifi(state.type === 'wifi');
    setIsCellular(state.type === 'cellular');
    setIsUnknown(state.type === 'unknown');
    
    if (state.type === 'cellular' && state.details?.cellularGeneration) {
      setCellularGeneration(state.details.cellularGeneration);
    } else {
      setCellularGeneration(null);
    }
  };

  return {
    isConnected,
    isWifi,
    isCellular,
    isUnknown,
    isInternetReachable,
    connectionType,
    cellularGeneration,
    previousState,
  };
};

export default useNetwork;