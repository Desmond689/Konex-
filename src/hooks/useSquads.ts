// @ts-nocheck
/**
 * KONEX useSquads Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides multiple squads management with:
 * - Infinite scrolling
 * - Search functionality
 * - Filter by type
 * - Create, update, delete operations
 * - Join/Leave squad actions
 * - Real-time updates
 * 
 * Usage:
 * const { squads, isLoading, createSquad, joinSquad } = useSquads({ communityId: '123' });
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { squadService } from '../api/services/squad.service';
import { KonexError } from '../core/errors/app.error';
import { logger } from '../core/logger/logger.service';
import { useSquadStore } from '../store/squadStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useRealtime } from './useRealtime';

// ============================================
// 1. TYPES
// ============================================

export interface UseSquadsOptions {
  /** Filter squads by community ID */
  communityId?: string;
  /** Filter squads by search query */
  searchQuery?: string;
  /** Filter squads by type (Competitive, Casual, Ranked, Clan, Social) */
  squadType?: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  /** Filter squads by join type (open, approval, inviteOnly) */
  joinType?: 'open' | 'approval' | 'inviteOnly';
  /** Number of items per page */
  initialLimit?: number;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Enable real-time updates */
  enableRealtime?: boolean;
  /** Sort by field */
  sortBy?: 'member_count' | 'online_count' | 'created_at' | 'average_rating' | 'name';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

export interface UseSquadsReturn {
  // Data
  squads: any[];
  mySquads: any[];
  totalCount: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isJoining: boolean;
  hasMore: boolean;
  
  // Error states
  error: Error | null;
  
  // Fetch functions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  filter: (filters: Partial<UseSquadsOptions>) => void;
  resetFilters: () => void;
  
  // Squad operations
  createSquad: (data: SquadCreateData) => Promise<any>;
  updateSquad: (squadId: string, data: Partial<SquadUpdateData>) => Promise<void>;
  deleteSquad: (squadId: string) => Promise<void>;
  joinSquad: (squadId: string) => Promise<void>;
  leaveSquad: (squadId: string) => Promise<void>;
  getSquad: (squadId: string) => Promise<any>;
  getSquadMembers: (squadId: string) => Promise<any[]>;
  getSquadStats: (squadId: string) => Promise<any>;
  
  // Bulk operations
  fetchMySquads: () => Promise<void>;
  fetchSquadsByCommunity: (communityId: string) => Promise<void>;
  fetchSquadsByType: (type: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  setSquads: (squads: any[]) => void;
  getSquadById: (squadId: string) => any | undefined;
  isUserInSquad: (squadId: string) => boolean;
}

export interface SquadCreateData {
  name: string;
  tag?: string;
  description?: string;
  squadType: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  joinType: 'open' | 'approval' | 'inviteOnly';
  maxMembers?: number;
  iconUrl?: string;
}

export interface SquadUpdateData {
  name?: string;
  tag?: string;
  description?: string;
  squadType?: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  joinType?: 'open' | 'approval' | 'inviteOnly';
  maxMembers?: number;
  iconUrl?: string;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useSquads = (options: UseSquadsOptions = {}): UseSquadsReturn => {
  const {
    communityId,
    searchQuery,
    squadType,
    joinType,
    initialLimit = 20,
    autoFetch = true,
    enableRealtime = true,
    sortBy = 'member_count',
    sortOrder = 'desc',
  } = options;

  // ============================================
  // HOOKS
  // ============================================

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { subscribe, unsubscribe } = useRealtime();
  
  const {
    squads: storeSquads,
    mySquads: storeMySquads,
    setSquads: setStoreSquads,
    setMySquads: setStoreMySquads,
    addSquad: addStoreSquad,
    removeSquad: removeStoreSquad,
    updateSquad: updateStoreSquad,
  } = useSquadStore();

  // ============================================
  // STATE
  // ============================================

  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentFilters, setCurrentFilters] = useState<Partial<UseSquadsOptions>>({
    communityId,
    squadType,
    joinType,
    sortBy,
    sortOrder,
  });
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery || '');
  
  const realtimeSubscriptionRef = useRef<any>(null);

  // ============================================
  // FETCH FUNCTION
  // ============================================

  const fetchSquads = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;
      let total = 0;

      // Build query parameters
      const queryParams = {
        communityId: currentFilters.communityId,
        squadType: currentFilters.squadType,
        joinType: currentFilters.joinType,
        sortBy: currentFilters.sortBy || 'member_count',
        sortOrder: currentFilters.sortOrder || 'desc',
      };

      // If search term is present, use search API
      if (searchTerm && searchTerm.trim().length > 0) {
        result = await squadService.searchSquads(searchTerm.trim(), pageSize);
        // Search doesn't support pagination the same way, so we simulate it
        const start = page * pageSize;
        const end = start + pageSize;
        result = result.slice(start, end);
        total = result.length;
      } else if (queryParams.communityId) {
        // Fetch by community
        const response = await squadService.getSquadsByCommunity(
          queryParams.communityId,
          pageSize,
          page * pageSize
        );
        result = response || [];
        total = result.length;
        
        // Apply filters
        if (queryParams.squadType) {
          result = result.filter((s: any) => s.squad_type === queryParams.squadType);
        }
        if (queryParams.joinType) {
          result = result.filter((s: any) => s.join_type === queryParams.joinType);
        }
        
        // Apply sorting
        if (queryParams.sortBy) {
          result.sort((a: any, b: any) => {
            const aVal = a[queryParams.sortBy] || 0;
            const bVal = b[queryParams.sortBy] || 0;
            return queryParams.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          });
        }
      } else {
        // Generic fetch
        result = await squadService.getSquads(pageSize, page * pageSize);
        total = result.length || 0;
      }

      // Ensure result is always an array
      const safeResult = Array.isArray(result) ? result : [];
      
      // Calculate if there are more items
      const hasMoreData = safeResult.length >= pageSize && total > (page + 1) * pageSize;

      return {
        data: safeResult,
        hasMore: hasMoreData,
        total: total || safeResult.length,
      };
    } catch (err) {
      logger.error('❌ Fetch squads error', err);
      throw err;
    }
  }, [currentFilters, searchTerm]);

  // ============================================
  // INFINITE SCROLL
  // ============================================

  const {
    data,
    isLoading,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
    reset,
    setData,
  } = useInfiniteScroll(fetchSquads, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => {
      setError(err);
      trackEvent('squads_load_error', { error: err.message });
    },
    onSuccess: (newData) => {
      trackEvent('squads_loaded', { count: newData.length });
    },
  });

  // ============================================
  // FETCH MY SQUADS
  // ============================================

  const fetchMySquads = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await squadService.getSquadsByUser(user.id);
      setStoreMySquads(result || []);
      trackEvent('my_squads_view', { count: result.length });
    } catch (err) {
      logger.error('❌ Fetch my squads error', err);
    }
  }, [user, setStoreMySquads, trackEvent]);

  // ============================================
  // SEARCH FUNCTION
  // ============================================

  const search = useCallback(async (query: string) => {
    setSearchTerm(query);
    reset();
    await loadMore();
    
    trackEvent('squads_search', { query, resultsCount: data.length });
  }, [reset, loadMore, data.length, trackEvent]);

  // ============================================
  // FILTER FUNCTIONS
  // ============================================

  const filter = useCallback((filters: Partial<UseSquadsOptions>) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...filters,
    }));
    reset();
    loadMore();
    
    trackEvent('squads_filter', filters);
  }, [reset, loadMore, trackEvent]);

  const resetFilters = useCallback(() => {
    setCurrentFilters({
      communityId,
      sortBy: 'member_count',
      sortOrder: 'desc',
    });
    setSearchTerm(searchQuery || '');
    reset();
    loadMore();
    
    trackEvent('squads_filters_reset');
  }, [communityId, searchQuery, reset, loadMore, trackEvent]);

  // ============================================
  // SQUAD OPERATIONS
  // ============================================

  const createSquad = useCallback(async (squadData: SquadCreateData) => {
    try {
      setIsCreating(true);
      setError(null);

      const newSquad = await squadService.createSquad({
        name: squadData.name,
        tag: squadData.tag || null,
        description: squadData.description || null,
        squad_type: squadData.squadType,
        join_type: squadData.joinType,
        max_members: squadData.maxMembers || 20,
        icon_url: squadData.iconUrl || null,
        community_id: currentFilters.communityId || '',
        leader_id: user?.id || '',
      });

      // Add to store
      addStoreSquad(newSquad);
      
      // Update the infinite scroll data
      setData([newSquad, ...data]);

      trackEvent('squad_create', {
        squadId: newSquad.id,
        name: squadData.name,
        type: squadData.squadType,
      });

      showToast('Squad created successfully! 🎮', 'success');
      return newSquad;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Create squad error', error);
      
      const message = error instanceof KonexError 
        ? error.userMessage 
        : 'Failed to create squad. Please try again.';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user, currentFilters, addStoreSquad, setData, data, trackEvent, showToast]);

  const updateSquad = useCallback(async (squadId: string, updates: Partial<SquadUpdateData>) => {
    try {
      setError(null);

      const updatedSquad = await squadService.updateSquad(squadId, {
        name: updates.name,
        tag: updates.tag,
        description: updates.description,
        squad_type: updates.squadType,
        join_type: updates.joinType,
        max_members: updates.maxMembers,
        icon_url: updates.iconUrl,
      });

      updateStoreSquad(squadId, updatedSquad);
      
      // Update the infinite scroll data
      const updatedData = data.map((s: any) => 
        s.id === squadId ? { ...s, ...updatedSquad } : s
      );
      setData(updatedData);

      trackEvent('squad_update', { squadId, updatedFields: Object.keys(updates) });
      showToast('Squad updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Update squad error', error);
      
      const message = error instanceof KonexError 
        ? error.userMessage 
        : 'Failed to update squad. Please try again.';
      showToast(message, 'error');
      throw error;
    }
  }, [data, updateStoreSquad, setData, trackEvent, showToast]);

  const deleteSquad = useCallback(async (squadId: string) => {
    try {
      setError(null);

      await squadService.deleteSquad(squadId);
      removeStoreSquad(squadId);
      
      // Remove from the infinite scroll data
      const updatedData = data.filter((s: any) => s.id !== squadId);
      setData(updatedData);

      trackEvent('squad_delete', { squadId });
      showToast('Squad deleted successfully', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete squad error', error);
      
      const message = error instanceof KonexError 
        ? error.userMessage 
        : 'Failed to delete squad. Please try again.';
      showToast(message, 'error');
      throw error;
    }
  }, [data, removeStoreSquad, setData, trackEvent, showToast]);

  const joinSquad = useCallback(async (squadId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await squadService.joinSquad(user?.id || '', squadId);
      
      // Update squad in the list
      const squad = data.find((s: any) => s.id === squadId);
      if (squad) {
        const updatedSquad = {
          ...squad,
          member_count: squad.member_count + 1,
          is_member: true,
        };
        updateStoreSquad(squadId, updatedSquad);
        
        const updatedData = data.map((s: any) => 
          s.id === squadId ? updatedSquad : s
        );
        setData(updatedData);
      }

      // Refresh my squads
      await fetchMySquads();

      trackEvent('squad_join', { squadId });
      showToast('Joined squad successfully! 🎮', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Join squad error', error);
      
      const message = error instanceof KonexError 
        ? error.userMessage 
        : 'Failed to join squad. Please try again.';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, data, updateStoreSquad, setData, fetchMySquads, trackEvent, showToast]);

  const leaveSquad = useCallback(async (squadId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await squadService.leaveSquad(user?.id || '', squadId);
      
      // Update squad in the list
      const squad = data.find((s: any) => s.id === squadId);
      if (squad) {
        const updatedSquad = {
          ...squad,
          member_count: Math.max(0, squad.member_count - 1),
          is_member: false,
        };
        updateStoreSquad(squadId, updatedSquad);
        
        const updatedData = data.map((s: any) => 
          s.id === squadId ? updatedSquad : s
        );
        setData(updatedData);
      }

      // Refresh my squads
      await fetchMySquads();

      trackEvent('squad_leave', { squadId });
      showToast('Left squad', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Leave squad error', error);
      
      const message = error instanceof KonexError 
        ? error.userMessage 
        : 'Failed to leave squad. Please try again.';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, data, updateStoreSquad, setData, fetchMySquads, trackEvent, showToast]);

  // ============================================
  // GET SINGLE SQUAD
  // ============================================

  const getSquad = useCallback(async (squadId: string) => {
    try {
      return await squadService.getSquad(squadId);
    } catch (err) {
      logger.error('❌ Get squad error', err);
      throw err;
    }
  }, []);

  const getSquadMembers = useCallback(async (squadId: string) => {
    try {
      return await squadService.getSquadMembers(squadId);
    } catch (err) {
      logger.error('❌ Get squad members error', err);
      return [];
    }
  }, []);

  const getSquadStats = useCallback(async (squadId: string) => {
    try {
      return await squadService.getSquadStats(squadId);
    } catch (err) {
      logger.error('❌ Get squad stats error', err);
      return null;
    }
  }, []);

  // ============================================
  // BULK OPERATIONS
  // ============================================

  const fetchSquadsByCommunity = useCallback(async (targetCommunityId: string) => {
    filter({ communityId: targetCommunityId });
  }, [filter]);

  const fetchSquadsByType = useCallback(async (type: string) => {
    filter({ squadType: type as any });
  }, [filter]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    resetFilters();
    setError(null);
  }, [resetFilters]);

  const getSquadById = useCallback((squadId: string) => {
    return data.find((s: any) => s.id === squadId);
  }, [data]);

  const isUserInSquad = useCallback((squadId: string) => {
    const squad = getSquadById(squadId);
    return squad?.is_member || false;
  }, [getSquadById]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!enableRealtime || !currentFilters.communityId) return;

    const subscription = subscribe(
      `squads_${currentFilters.communityId}`,
      {
        table: 'squads',
        filter: { community_id: currentFilters.communityId },
        onInsert: (payload: any) => {
          // Add new squad to the list
          setData([payload, ...data]);
          addStoreSquad(payload);
          trackEvent('squad_realtime_insert', { squadId: payload.id });
        },
        onUpdate: (payload: any) => {
          // Update squad in the list
          const updatedData = data.map((s: any) => 
            s.id === payload.id ? { ...s, ...payload } : s
          );
          setData(updatedData);
          updateStoreSquad(payload.id, payload);
        },
        onDelete: (payload: any) => {
          // Remove squad from the list
          const updatedData = data.filter((s: any) => s.id !== payload.id);
          setData(updatedData);
          removeStoreSquad(payload.id);
        },
      }
    );

    realtimeSubscriptionRef.current = subscription;

    return () => {
      if (realtimeSubscriptionRef.current) {
        unsubscribe(realtimeSubscriptionRef.current.id);
        realtimeSubscriptionRef.current = null;
      }
    };
  }, [enableRealtime, currentFilters.communityId, data, subscribe, unsubscribe, addStoreSquad, updateStoreSquad, removeStoreSquad, setData, trackEvent]);

  // ============================================
  // EFFECTS
  // ============================================

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      reset();
      loadMore();
    }
  }, [autoFetch]);

  // Fetch my squads on user change
  useEffect(() => {
    if (user?.id) {
      fetchMySquads();
    }
  }, [user?.id]);

  // Refresh when filters change
  useEffect(() => {
    if (autoFetch) {
      reset();
      loadMore();
    }
  }, [currentFilters.communityId, currentFilters.squadType, currentFilters.joinType]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    squads: data,
    mySquads: storeMySquads,
    totalCount: data.length || 0,

    // Loading states
    isLoading,
    isRefreshing,
    isCreating,
    isJoining,
    hasMore,

    // Error states
    error,

    // Fetch functions
    loadMore,
    refresh,
    search,
    filter,
    resetFilters,

    // Squad operations
    createSquad,
    updateSquad,
    deleteSquad,
    joinSquad,
    leaveSquad,
    getSquad,
    getSquadMembers,
    getSquadStats,

    // Bulk operations
    fetchMySquads,
    fetchSquadsByCommunity,
    fetchSquadsByType,

    // Utility
    clearError,
    reset,
    setSquads: setData,
    getSquadById,
    isUserInSquad,
  };
};

export default useSquads;