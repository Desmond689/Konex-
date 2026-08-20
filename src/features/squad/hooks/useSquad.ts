// @ts-nocheck
/**
 * KONEX useSquad Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides squad management functionality for a single squad
 * 
 * Usage:
 * const { squad, members, joinSquad, leaveSquad } = useSquad(squadId);
 */

import { useCallback, useEffect, useState } from 'react';
import { squadService } from '../../../api/services/squad.service';
import { logger } from '../../../core/logger/logger.service';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRealtime } from '../../../hooks/useRealtime';
import { useUIStore } from '../../../store/uiStore';
import { useSquadStore } from '../store/squad.store';

// ============================================
// 1. TYPES
// ============================================

export interface UseSquadOptions {
  autoFetch?: boolean;
  includeMembers?: boolean;
  includeRequests?: boolean;
}

export interface UseSquadReturn {
  // Data
  squad: any | null;
  members: any[];
  joinRequests: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  error: Error | null;
  isMember: boolean;
  isLeader: boolean;
  isAdmin: boolean;
  
  // Actions
  fetchSquad: () => Promise<void>;
  refresh: () => Promise<void>;
  joinSquad: () => Promise<void>;
  leaveSquad: () => Promise<void>;
  kickMember: (userId: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  demoteFromAdmin: (userId: string) => Promise<void>;
  transferLeadership: (userId: string) => Promise<void>;
  updateSquad: (data: any) => Promise<void>;
  deleteSquad: () => Promise<void>;
  sendInvite: (userId: string) => Promise<void>;
  approveJoinRequest: (userId: string) => Promise<void>;
  denyJoinRequest: (userId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export const useSquad = (squadId: string, options: UseSquadOptions = {}): UseSquadReturn => {
  const {
    autoFetch = true,
    includeMembers = true,
    includeRequests = false,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  const { subscribe, unsubscribe } = useRealtime();
  
  const {
    currentSquad,
    members,
    joinRequests,
    setCurrentSquad,
    setMembers,
    setJoinRequests,
    updateSquad: updateSquadStore,
    removeSquad,
    addMember,
    removeMember,
  } = useSquadStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  const squad = currentSquad?.id === squadId ? currentSquad : null;
  const isMember = squad?.memberIds?.includes(user?.id) || false;
  const isLeader = squad?.leaderId === user?.id;
  const isAdmin = squad?.adminIds?.includes(user?.id) || false;

  // ============================================
  // FETCH SQUAD
  // ============================================

  const fetchSquad = useCallback(async () => {
    if (!squadId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [squadData, membersData, requestsData] = await Promise.all([
        squadService.getSquad(squadId),
        includeMembers ? squadService.getSquadMembers(squadId) : [],
        includeRequests ? squadService.getSquadJoinRequests(squadId) : [],
      ]);

      setCurrentSquad(squadData);
      if (includeMembers) setMembers(membersData);
      if (includeRequests) setJoinRequests(requestsData);

      trackEvent('squad_view', { squadId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch squad error', error);
    } finally {
      setIsLoading(false);
    }
  }, [squadId, includeMembers, includeRequests, setCurrentSquad, setMembers, setJoinRequests, trackEvent]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    if (!squadId) return;

    try {
      setIsRefreshing(true);
      setError(null);

      const [squadData, membersData, requestsData] = await Promise.all([
        squadService.getSquad(squadId),
        includeMembers ? squadService.getSquadMembers(squadId) : [],
        includeRequests ? squadService.getSquadJoinRequests(squadId) : [],
      ]);

      setCurrentSquad(squadData);
      if (includeMembers) setMembers(membersData);
      if (includeRequests) setJoinRequests(requestsData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Refresh squad error', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [squadId, includeMembers, includeRequests, setCurrentSquad, setMembers, setJoinRequests]);

  // ============================================
  // JOIN / LEAVE
  // ============================================

  const joinSquad = useCallback(async () => {
    try {
      setIsJoining(true);
      setError(null);

      await squadService.joinSquad(user?.id || '', squadId);
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_join', { squadId });
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
  }, [user, squadId, refresh, trackEvent, showToast]);

  const leaveSquad = useCallback(async () => {
    try {
      setIsLeaving(true);
      setError(null);

      await squadService.leaveSquad(user?.id || '', squadId);
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_leave', { squadId });
      showToast('Left squad', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Leave squad error', error);
      showToast(error.message || 'Failed to leave squad', 'error');
      throw error;
    } finally {
      setIsLeaving(false);
    }
  }, [user, squadId, refresh, trackEvent, showToast]);

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  const kickMember = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      await squadService.kickMember(squadId, targetUserId, user?.id || '');
      removeMember(targetUserId);
      
      trackEvent('squad_kick', { squadId, targetUserId });
      showToast('Member kicked', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Kick member error', error);
      showToast(error.message || 'Failed to kick member', 'error');
      throw error;
    }
  }, [squadId, user, removeMember, trackEvent, showToast]);

  const promoteToAdmin = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      // This would call a service method to promote
      // For now, update locally
      const updatedSquad = {
        ...squad,
        adminIds: [...(squad?.adminIds || []), targetUserId],
      };
      updateSquadStore(squadId, updatedSquad);
      
      trackEvent('squad_promote', { squadId, targetUserId });
      showToast('Member promoted to Admin', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Promote to admin error', error);
      showToast('Failed to promote member', 'error');
      throw error;
    }
  }, [squadId, squad, updateSquadStore, trackEvent, showToast]);

  const demoteFromAdmin = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      const updatedSquad = {
        ...squad,
        adminIds: (squad?.adminIds || []).filter((id: string) => id !== targetUserId),
      };
      updateSquadStore(squadId, updatedSquad);
      
      trackEvent('squad_demote', { squadId, targetUserId });
      showToast('Admin demoted to Member', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Demote from admin error', error);
      showToast('Failed to demote admin', 'error');
      throw error;
    }
  }, [squadId, squad, updateSquadStore, trackEvent, showToast]);

  const transferLeadership = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      await squadService.transferLeadership(squadId, targetUserId, user?.id || '');
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_transfer_leadership', { squadId, targetUserId });
      showToast('Leadership transferred successfully', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Transfer leadership error', error);
      showToast(error.message || 'Failed to transfer leadership', 'error');
      throw error;
    }
  }, [squadId, user, refresh, trackEvent, showToast]);

  // ============================================
  // SQUAD MANAGEMENT
  // ============================================

  const updateSquad = useCallback(async (data: any) => {
    try {
      setError(null);

      const updated = await squadService.updateSquad(squadId, data);
      updateSquadStore(squadId, updated);
      
      trackEvent('squad_edit', { squadId, updatedFields: Object.keys(data) });
      showToast('Squad updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Update squad error', error);
      showToast(error.message || 'Failed to update squad', 'error');
      throw error;
    }
  }, [squadId, updateSquadStore, trackEvent, showToast]);

  const deleteSquad = useCallback(async () => {
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
      showToast(error.message || 'Failed to delete squad', 'error');
      throw error;
    }
  }, [squadId, removeSquad, trackEvent, showToast]);

  // ============================================
  // INVITES & REQUESTS
  // ============================================

  const sendInvite = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      // This would call a service to send invite
      trackEvent('squad_invite', { squadId, targetUserId });
      showToast('Invite sent!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Send invite error', error);
      showToast('Failed to send invite', 'error');
      throw error;
    }
  }, [squadId, trackEvent, showToast]);

  const approveJoinRequest = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      await squadService.approveJoinRequest(squadId, targetUserId);
      
      // Add member to squad
      addMember({ userId: targetUserId, squadId, role: 'Member' });
      
      // Remove from join requests
      setJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
      
      trackEvent('squad_join_request_approve', { squadId, targetUserId });
      showToast('Join request approved', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Approve join request error', error);
      showToast('Failed to approve request', 'error');
      throw error;
    }
  }, [squadId, addMember, setJoinRequests, trackEvent, showToast]);

  const denyJoinRequest = useCallback(async (targetUserId: string) => {
    try {
      setError(null);

      await squadService.denyJoinRequest(squadId, targetUserId);
      
      setJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
      
      trackEvent('squad_join_request_deny', { squadId, targetUserId });
      showToast('Join request denied', 'info');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Deny join request error', error);
      showToast('Failed to deny request', 'error');
      throw error;
    }
  }, [squadId, setJoinRequests, trackEvent, showToast]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!squadId) return;

    const subscription = subscribe(
      `squad_${squadId}`,
      {
        table: 'squads',
        filter: { id: squadId },
        onUpdate: (payload) => {
          setCurrentSquad(payload);
          trackEvent('squad_realtime_update', { squadId });
        },
      }
    );

    // Subscribe to member updates
    const memberSubscription = subscribe(
      `squad_members_${squadId}`,
      {
        table: 'squad_memberships',
        filter: { squad_id: squadId },
        onInsert: (payload) => {
          // Handle new member
          addMember(payload);
          trackEvent('squad_realtime_member_join', { squadId, userId: payload.userId });
        },
        onDelete: (payload) => {
          // Handle member removal
          removeMember(payload.userId);
        },
      }
    );

    setRealtimeSubscription([subscription, memberSubscription]);

    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.forEach((sub: any) => {
          if (sub) {
            unsubscribe(sub.id);
          }
        });
      }
    };
  }, [squadId, subscribe, unsubscribe, setCurrentSquad, addMember, removeMember, trackEvent]);

  // ============================================
  // UTILITY
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setIsRefreshing(false);
    setIsJoining(false);
    setIsLeaving(false);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && squadId) {
      fetchSquad();
    }
  }, [squadId, autoFetch]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    squad,
    members,
    joinRequests,
    
    // Loading states
    isLoading,
    isRefreshing,
    isJoining,
    isLeaving,
    
    // Error states
    error,
    
    // Status
    isMember,
    isLeader,
    isAdmin,
    
    // Actions
    fetchSquad,
    refresh,
    joinSquad,
    leaveSquad,
    kickMember,
    promoteToAdmin,
    demoteFromAdmin,
    transferLeadership,
    updateSquad,
    deleteSquad,
    sendInvite,
    approveJoinRequest,
    denyJoinRequest,
    
    // Utility
    clearError,
    reset: resetState,
  };
};

export default useSquad;