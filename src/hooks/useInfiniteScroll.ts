/**
 * KONEX useInfiniteScroll Hook
 * Billion Dollar Code - Production Ready
 * 
 * Handles infinite scrolling with pagination
 * 
 * Usage:
 * const { data, loadMore, isLoading, hasMore } = useInfiniteScroll(fetchData);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../core/logger/logger.service';

export interface UseInfiniteScrollOptions {
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
  enabled?: boolean;
  initialData?: any[];
  onError?: (error: Error) => void;
  onSuccess?: (data: any[]) => void;
}

export interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  page: number;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  setData: (data: T[]) => void;
  setHasMore: (hasMore: boolean) => void;
  clearError: () => void;
}

export function useInfiniteScroll<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const {
    initialPage = 0,
    pageSize = 20,
    threshold = 100,
    enabled = true,
    initialData = [],
    onError,
    onSuccess,
  } = options;

  // State
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [total, setTotal] = useState<number>(0);

  // Refs
  const isMountedRef = useRef<boolean>(true);
  const isLoadingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const currentPageRef = useRef<number>(initialPage);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================
  // LOAD MORE
  // ============================================

  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || isRefreshingRef.current || !hasMore || !enabled) {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const nextPage = currentPageRef.current;
      const result = await fetchFn(nextPage, pageSize);

      if (!isMountedRef.current) return;

      if (result.data && result.data.length > 0) {
        setData((prev) => [...prev, ...result.data]);
        setPage(nextPage);
        currentPageRef.current = nextPage + 1;
        setHasMore(result.hasMore);
        if (result.total !== undefined) {
          setTotal(result.total);
        }

        if (onSuccess) {
          onSuccess(result.data);
        }

        logger.debug(`📄 Loaded page ${nextPage + 1}, items: ${result.data.length}`);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      if (isMountedRef.current && !(err instanceof DOMException && err.name === 'AbortError')) {
        const error = err as Error;
        setError(error);
        if (onError) {
          onError(error);
        }
        logger.error('❌ Infinite scroll load error', error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        isLoadingRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, [fetchFn, pageSize, hasMore, enabled, onError, onSuccess]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current || !enabled) {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setError(null);
      currentPageRef.current = initialPage;
      setPage(initialPage);

      const result = await fetchFn(initialPage, pageSize);

      if (isMountedRef.current) {
        setData(result.data || []);
        setHasMore(result.hasMore);
        currentPageRef.current = initialPage + 1;
        setPage(initialPage);
        if (result.total !== undefined) {
          setTotal(result.total);
        }

        if (onSuccess) {
          onSuccess(result.data || []);
        }

        logger.debug(`🔄 Refreshed: ${result.data?.length || 0} items`);
      }
    } catch (err) {
      if (isMountedRef.current && !(err instanceof DOMException && err.name === 'AbortError')) {
        const error = err as Error;
        setError(error);
        if (onError) {
          onError(error);
        }
        logger.error('❌ Infinite scroll refresh error', error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
        isRefreshingRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, [fetchFn, initialPage, pageSize, enabled, onError, onSuccess]);

  // ============================================
  // RESET
  // ============================================

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setError(null);
    setPage(initialPage);
    setTotal(0);
    currentPageRef.current = initialPage;
    isLoadingRef.current = false;
    isRefreshingRef.current = false;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialPage]);

  // ============================================
  // SETTERS
  // ============================================

  const setDataDirect = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  const setHasMoreDirect = useCallback((value: boolean) => {
    setHasMore(value);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // AUTO-LOAD
  // ============================================

  useEffect(() => {
    if (enabled && initialData.length === 0) {
      loadMore();
    }
  }, [enabled, initialData.length]);

  return {
    data,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    page,
    total,
    loadMore,
    refresh,
    reset,
    setData: setDataDirect,
    setHasMore: setHasMoreDirect,
    clearError,
  };
}

export default useInfiniteScroll;