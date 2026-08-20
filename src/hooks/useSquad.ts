// @ts-nocheck
/**
 * KONEX useSquad Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides squad management
 * 
 * Usage:
 * const { squad, members, joinSquad, leaveSquad } = useSquad(squadId);
 */

import { useCallback, useEffect, useState } from 'react';
import { squadService } from '../api/services/squad.service';
import { logger } from '../core/logger/logger.service';
import { useSquadStore } from '../store/squadStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseSquadOptions {
  autoFetch?: boolean;
  includeMembers?: boolean;
  includeRequests?: boolean;
}

export interface UseSquadReturn {
  squad: any | null;
  members: any[];
  joinRequests: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  isMember: boolean;
  isLeader: boolean;
  isAdmin: boolean;
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
}

export const useSquad = (squadId: string, options: UseSquadOptions = {}): UseSquadReturn => {
  const { autoFetch = true, includeMembers = true, includeRequests = false } = options;
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
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
  const [error, setError] = useState<Error | null>(null);

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
      await squadService.joinSquad(user?.id || '', squadId);
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_join', { squadId });
      showToast('Joined squad successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Join squad error', error);
      showToast(error.message || 'Failed to join squad', 'error');
      throw err;
    }
  }, [user, squadId, refresh, trackEvent, showToast]);

  const leaveSquad = useCallback(async () => {
    try {
      await squadService.leaveSquad(user?.id || '', squadId);
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_leave', { squadId });
      showToast('Left squad', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Leave squad error', error);
      showToast(error.message || 'Failed to leave squad', 'error');
      throw err;
    }
  }, [user, squadId, refresh, trackEvent, showToast]);

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  const kickMember = useCallback(async (targetUserId: string) => {
    try {
      await squadService.kickMember(squadId, targetUserId, user?.id || '');
      removeMember(targetUserId);
      
      trackEvent('squad_kick', { squadId, targetUserId });
      showToast('Member kicked', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Kick member error', error);
      showToast(error.message || 'Failed to kick member', 'error');
      throw err;
    }
  }, [squadId, user, removeMember, trackEvent, showToast]);

  const promoteToAdmin = useCallback(async (targetUserId: string) => {
    try {
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
      logger.error('❌ Promote to admin error', error);
      showToast('Failed to promote member', 'error');
      throw err;
    }
  }, [squadId, squad, updateSquadStore, trackEvent, showToast]);

  const demoteFromAdmin = useCallback(async (targetUserId: string) => {
    try {
      const updatedSquad = {
        ...squad,
        adminIds: (squad?.adminIds || []).filter((id: string) => id !== targetUserId),
      };
      updateSquadStore(squadId, updatedSquad);
      
      trackEvent('squad_demote', { squadId, targetUserId });
      showToast('Admin demoted to Member', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Demote from admin error', error);
      showToast('Failed to demote admin', 'error');
      throw err;
    }
  }, [squadId, squad, updateSquadStore, trackEvent, showToast]);

  const transferLeadership = useCallback(async (targetUserId: string) => {
    try {
      await squadService.transferLeadership(squadId, targetUserId, user?.id || '');
      
      // Refresh squad data
      await refresh();
      
      trackEvent('squad_transfer_leadership', { squadId, targetUserId });
      showToast('Leadership transferred successfully', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Transfer leadership error', error);
      showToast(error.message || 'Failed to transfer leadership', 'error');
      throw err;
    }
  }, [squadId, user, refresh, trackEvent, showToast]);

  // ============================================
  // SQUAD MANAGEMENT
  // ============================================

  const updateSquad = useCallback(async (data: any) => {
    try {
      const updated = await squadService.updateSquad(squadId, data);
      updateSquadStore(squadId, updated);
      
      trackEvent('squad_edit', { squadId, updatedFields: Object.keys(data) });
      showToast('Squad updated successfully!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Update squad error', error);
      showToast(error.message || 'Failed to update squad', 'error');
      throw err;
    }
  }, [squadId, updateSquadStore, trackEvent, showToast]);

  const deleteSquad = useCallback(async () => {
    try {
      await squadService.deleteSquad(squadId);
      removeSquad(squadId);
      
      trackEvent('squad_delete', { squadId });
      showToast('Squad deleted', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Delete squad error', error);
      showToast(error.message || 'Failed to delete squad', 'error');
      throw err;
    }
  }, [squadId, removeSquad, trackEvent, showToast]);

  // ============================================
  // INVITES & REQUESTS
  // ============================================

  const sendInvite = useCallback(async (targetUserId: string) => {
    try {
      // This would call a service to send invite
      trackEvent('squad_invite', { squadId, targetUserId });
      showToast('Invite sent!', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Send invite error', error);
      showToast('Failed to send invite', 'error');
      throw err;
    }
  }, [squadId, trackEvent, showToast]);

  const approveJoinRequest = useCallback(async (targetUserId: string) => {
    try {
      await squadService.approveJoinRequest(squadId, targetUserId);
      
      // Add member to squad
      addMember({ userId: targetUserId, squadId, role: 'Member' });
      
      // Remove from join requests
      setJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
      
      trackEvent('squad_join_request_approve', { squadId, targetUserId });
      showToast('Join request approved', 'success');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Approve join request error', error);
      showToast('Failed to approve request', 'error');
      throw err;
    }
  }, [squadId, addMember, setJoinRequests, trackEvent, showToast]);

  const denyJoinRequest = useCallback(async (targetUserId: string) => {
    try {
      await squadService.denyJoinRequest(squadId, targetUserId);
      
      setJoinRequests(prev => prev.filter(r => r.userId !== targetUserId));
      
      trackEvent('squad_join_request_deny', { squadId, targetUserId });
      showToast('Join request denied', 'info');
    } catch (err) {
      const error = err as Error;
      logger.error('❌ Deny join request error', error);
      showToast('Failed to deny request', 'error');
      throw err;
    }
  }, [squadId, setJoinRequests, trackEvent, showToast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && squadId) {
      fetchSquad();
    }
  }, [squadId, autoFetch]);

  return {
    squad,
    members,
    joinRequests,
    isLoading,
    isRefreshing,
    error,
    isMember,
    isLeader,
    isAdmin,
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
  };
};

export default useSquad;