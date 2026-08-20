// @ts-nocheck
/**
 * KONEX useSquads Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides multiple squads management functionality
 * 
 * Usage:
 * const { squads, createSquad, joinSquad } = useSquads();
 */

import { useCallback, useEffect, useState } from 'react';
import { squadService } from '../../../api/services/squad.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { useUIStore } from '../../../store/uiStore';
import { useSquadStore } from '../store/squad.store';

// ============================================
// 1. TYPES
// ============================================

export interface UseSquadsOptions {
  communityId?: string;
  searchQuery?: string;
  squadType?: string;
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UseSquadsReturn {
  // Data
  squads: any[];
  mySquads: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isJoining: boolean;
  hasMore: boolean;
  error: Error | null;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  createSquad: (data: any) => Promise<any>;
  updateSquad: (squadId: string, data: any) => Promise<void>;
  deleteSquad: (squadId: string) => Promise<void>;
  joinSquad: (squadId: string) => Promise<void>;
  leaveSquad: (squadId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  getSquadById: (squadId: string) => any | undefined;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useSquads = (options: UseSquadsOptions = {}): UseSquadsReturn => {
  const {
    communityId,
    searchQuery,
    squadType,
    initialLimit = 20,
    autoFetch = true,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    squads: storeSquads,
    mySquads: storeMySquads,
    setSquads,
    setMySquads,
    addSquad,
    removeSquad,
    updateSquad: updateSquadStore,
  } = useSquadStore();

  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery || '');

  // ============================================
  // FETCH SQUADS
  // ============================================

  const fetchSquads = useCallback(async (page: number, pageSize: number) => {
    try {
      let result;

      if (searchTerm) {
        result = await squadService.searchSquads(searchTerm, pageSize);
      } else if (communityId) {
        result = await squadService.getSquadsByCommunity(communityId, pageSize, page * pageSize);
      } else {
        result = await squadService.getSquads(pageSize, page * pageSize);
      }

      // Filter by squad type if specified
      if (squadType && result) {
        result = result.filter((s: any) => s.squad_type === squadType);
      }

      // Update store
      if (page === 0) {
        setSquads(result || []);
      } else {
        setSquads([...storeSquads, ...(result || [])]);
      }

      trackEvent('squads_fetch', {
        communityId,
        searchTerm,
        squadType,
        count: result?.length || 0,
        page,
      });

      return {
        data: result || [],
        hasMore: (result?.length || 0) >= pageSize,
        total: result?.length || 0,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch squads error', error);
      throw error;
    }
  }, [communityId, searchTerm, squadType, storeSquads, setSquads, trackEvent]);

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
  } = useInfiniteScroll(fetchSquads, {
    initialPage: 0,
    pageSize: initialLimit,
    onError: (err) => setError(err),
    onSuccess: (newData) => {
      trackEvent('squads_page_loaded', {
        communityId,
        count: newData.length,
      });
    },
  });

  // ============================================
  // SEARCH
  // ============================================

  const search = useCallback(async (query: string) => {
    setSearchTerm(query);
    reset();
    await loadMore();
    
    trackEvent('squads_search', { query });
  }, [reset, loadMore, trackEvent]);

  // ============================================
  // CREATE SQUAD
  // ============================================

  const createSquad = useCallback(async (data: any) => {
    try {
      setIsCreating(true);
      setError(null);

      const newSquad = await squadService.createSquad({
        ...data,
        community_id: communityId,
        leader_id: user?.id,
      });

      addSquad(newSquad);
      
      trackEvent('squad_create', {
        squadId: newSquad.id,
        name: newSquad.name,
        type: data.squadType,
        communityId,
      });

      showToast('Squad created successfully!', 'success');
      return newSquad;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Create squad error', error);
      showToast('Failed to create squad', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user, communityId, addSquad, trackEvent, showToast]);

  // ============================================
  // UPDATE SQUAD
  // ============================================

  const updateSquad = useCallback(async (squadId: string, data: any) => {
    try {
      setError(null);

      const updated = await squadService.updateSquad(squadId, data);
      updateSquadStore(squadId, updated);
      
      trackEvent('squad_edit', { squadId });
      showToast('Squad updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Update squad error', error);
      showToast('Failed to update squad', 'error');
      throw error;
    }
  }, [updateSquadStore, trackEvent, showToast]);

  // ============================================
  // DELETE SQUAD
  // ============================================

  const deleteSquad = useCallback(async (squadId: string) => {
    try {
      setError(null);

      await squadService.deleteSquad(squadId);
      removeSquad(squadId);
      
      trackEvent('squad_delete', { squadId });
      showToast('Squad deleted', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Delete squad error', error);
      showToast('Failed to delete squad', 'error');
      throw error;
    }
  }, [removeSquad, trackEvent, showToast]);

  // ============================================
  // JOIN / LEAVE
  // ============================================

  const joinSquad = useCallback(async (targetSquadId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await squadService.joinSquad(user?.id || '', targetSquadId);
      
      // Update squad data
      await refresh();
      
      trackEvent('squad_join', { squadId: targetSquadId });
      showToast('Joined squad successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Join squad error', error);
      showToast(error.message || 'Failed to join squad', 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, refresh, trackEvent, showToast]);

  const leaveSquad = useCallback(async (targetSquadId: string) => {
    try {
      setIsJoining(true);
      setError(null);

      await squadService.leaveSquad(user?.id || '', targetSquadId);
      
      // Update squad data
      await refresh();
      
      trackEvent('squad_leave', { squadId: targetSquadId });
      showToast('Left squad', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Leave squad error', error);
      showToast(error.message || 'Failed to leave squad', 'error');
      throw error;
    } finally {
      setIsJoining(false);
    }
  }, [user, refresh, trackEvent, showToast]);

  // ============================================
  // FETCH MY SQUADS
  // ============================================

  const fetchMySquads = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await squadService.getSquadsByUser(user.id);
      setMySquads(result || []);
    } catch (err) {
      logger.error('❌ Fetch my squads error', err);
    }
  }, [user, setMySquads]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    reset();
    setError(null);
  }, [reset]);

  const getSquadById = useCallback((squadId: string) => {
    return data.find((s: any) => s.id === squadId);
  }, [data]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && (communityId || searchTerm)) {
      resetState();
      loadMore();
    }
  }, [communityId, searchTerm, squadType, autoFetch]);

  // Fetch user's squads
  useEffect(() => {
    if (user?.id) {
      fetchMySquads();
    }
  }, [user?.id]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    squads: data,
    mySquads: storeMySquads,
    
    // Loading states
    isLoading,
    isRefreshing,
    isCreating,
    isJoining,
    hasMore,
    
    // Error states
    error,
    
    // Actions
    loadMore,
    refresh,
    search,
    createSquad,
    updateSquad,
    deleteSquad,
    joinSquad,
    leaveSquad,
    
    // Utility
    clearError,
    reset: resetState,
    getSquadById,
  };
};

export default useSquads;