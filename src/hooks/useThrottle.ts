/**
 * KONEX useThrottle Hook
 * Billion Dollar Code - Production Ready
 * 
 * Throttles a callback function
 * 
 * Usage:
 * const { throttledCallback, cancel } = useThrottle(callback, 300);
 */

import { useCallback, useEffect, useRef } from 'react';

export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  throttledCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  isPending: boolean;
}

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  options?: { leading?: boolean; trailing?: boolean }
): UseThrottleReturn<T> => {
  const { leading = true, trailing = true } = options || {};

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const isPendingRef = useRef<boolean>(false);
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isPendingRef.current = false;
    lastArgsRef.current = null;
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      // Store the latest arguments
      lastArgsRef.current = args;

      // Leading edge
      if (leading && timeSinceLastCall >= delay) {
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
        isPendingRef.current = false;
        return;
      }

      // Trailing edge
      if (trailing) {
        isPendingRef.current = true;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastCallTimeRef.current = Date.now();
            lastArgsRef.current = null;
            isPendingRef.current = false;
            timerRef.current = null;
          }
        }, delay - timeSinceLastCall);
      }
    },
    [delay, leading, trailing]
  );

  return {
    throttledCallback,
    cancel,
    isPending: isPendingRef.current,
  };
};

export default useThrottle;