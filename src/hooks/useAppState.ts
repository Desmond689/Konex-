/**
 * KONEX useAppState Hook
 * Billion Dollar Code - Production Ready
 * 
 * Tracks app state (active, background, inactive)
 * 
 * Usage:
 * const { appState, isActive, isBackground } = useAppState();
 */

import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { trackEvent } from '../config/analytics';
import { logger } from '../core/logger/logger.service';

export interface UseAppStateReturn {
  appState: AppStateStatus;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
  previousAppState: AppStateStatus | null;
  timeInBackground: number;
  timeInForeground: number;
}

export const useAppState = (): UseAppStateReturn => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [previousAppState, setPreviousAppState] = useState<AppStateStatus | null>(null);
  const [backgroundStartTime, setBackgroundStartTime] = useState<number | null>(null);
  const [foregroundStartTime, setForegroundStartTime] = useState<number>(Date.now());
  const [timeInBackground, setTimeInBackground] = useState<number>(0);
  const [timeInForeground, setTimeInForeground] = useState<number>(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const currentState = appState;
      setPreviousAppState(currentState);
      setAppState(nextAppState);

      // Track app state changes
      if (currentState === 'active' && nextAppState !== 'active') {
        // App went to background
        setBackgroundStartTime(Date.now());
        setForegroundStartTime(0);
        
        // Calculate foreground duration
        const foregroundDuration = backgroundStartTime 
          ? Date.now() - (foregroundStartTime || Date.now())
          : 0;
        setTimeInForeground(prev => prev + foregroundDuration);
        
        logger.debug('📱 App went to background');
        trackEvent('app_background', {
          duration: foregroundDuration,
          previousState: currentState,
        });
      }

      if (currentState !== 'active' && nextAppState === 'active') {
        // App came to foreground
        const backgroundDuration = backgroundStartTime 
          ? Date.now() - backgroundStartTime
          : 0;
        setTimeInBackground(prev => prev + backgroundDuration);
        setBackgroundStartTime(null);
        setForegroundStartTime(Date.now());
        
        logger.debug('📱 App came to foreground');
        trackEvent('app_foreground', {
          duration: backgroundDuration,
          previousState: currentState,
        });
      }

      if (nextAppState === 'inactive') {
        logger.debug('📱 App became inactive');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState, backgroundStartTime, foregroundStartTime]);

  // Calculate current session duration
  useEffect(() => {
    if (appState === 'active') {
      const interval = setInterval(() => {
        setTimeInForeground(prev => prev + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [appState]);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
    previousAppState,
    timeInBackground,
    timeInForeground,
  };
};

export default useAppState;