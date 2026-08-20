/**
 * KONEX useDebounce Hook
 * Billion Dollar Code - Production Ready
 * 
 * Debounces a value or callback
 * 
 * Usage:
 * const debouncedValue = useDebounce(value, 500);
 * const debouncedCallback = useDebounceCallback(callback, 500);
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

export function useDebounce<T>(
  value: T,
  delay: number = 500,
  options?: { leading?: boolean; trailing?: boolean }
): UseDebounceReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef<boolean>(true);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setDebouncedValue(value);
      setIsPending(false);
    }
  }, [value]);

  useEffect(() => {
    const { leading = false, trailing = true } = options || {};

    // Leading edge
    if (leading && leadingRef.current) {
      leadingRef.current = false;
      setDebouncedValue(value);
      setIsPending(true);
      return;
    }

    // Trailing edge
    if (trailing) {
      setIsPending(true);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
        timerRef.current = null;
        leadingRef.current = true;
      }, delay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, options]);

  // Reset leading flag when value changes
  useEffect(() => {
    leadingRef.current = true;
  }, [value]);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush,
  };
}

/**
 * Debounce a callback function
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  options?: { leading?: boolean; trailing?: boolean }
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const [isPending, setIsPending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);
  const argsRef = useRef<any[]>([]);
  const leadingRef = useRef<boolean>(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      callbackRef.current(...argsRef.current);
      setIsPending(false);
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const { leading = false, trailing = true } = options || {};

      argsRef.current = args;

      // Leading edge
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        callbackRef.current(...args);
        setIsPending(true);
        return;
      }

      // Trailing edge
      if (trailing) {
        setIsPending(true);
        
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          callbackRef.current(...args);
          setIsPending(false);
          timerRef.current = null;
          leadingRef.current = true;
        }, delay);
      }
    },
    [delay, options]
  );

  // Reset leading flag when callback changes
  useEffect(() => {
    leadingRef.current = true;
  }, [callback]);

  return {
    debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

export default useDebounce;