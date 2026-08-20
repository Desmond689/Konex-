/**
 * KONEX useThrottle Hook
 * Billion Dollar Code - Production Ready
 * 
 * Throttles a value or function call
 * 
 * Usage:
 * const throttledValue = useThrottle(scrollPosition, 100);
 * const throttledFn = useThrottle(() => handleScroll(), 100);
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// 1. TYPES
// ============================================

export interface UseThrottleOptions {
  /** Leading edge execution */
  leading?: boolean;
  /** Trailing edge execution */
  trailing?: boolean;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

/**
 * Throttles a value
 */
export function useThrottle<T>(
  value: T,
  limit: number,
  options?: UseThrottleOptions
): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRan.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (timeSinceLastRun >= limit) {
      setThrottledValue(value);
      lastRan.current = now;
    } else if (options?.trailing !== false) {
      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
        timeoutRef.current = null;
      }, limit - timeSinceLastRun);
    }
  }, [value, limit, options]);

  return throttledValue;
}

/**
 * Throttles a function call
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options?: UseThrottleOptions
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRan.current;

      if (timeSinceLastRun >= limit) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        fn(...args);
        lastRan.current = now;
      } else if (options?.trailing !== false) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fn(...args);
          lastRan.current = Date.now();
          timeoutRef.current = null;
        }, limit - timeSinceLastRun);
      }
    },
    [fn, limit, options]
  );
}

export default useThrottle;