/**
 * KONEX useBadges Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides badges management
 * 
 * Usage:
 * const { badges, userBadges, featuredBadges, earnBadge } = useBadges();
 */

import { useCallback, useEffect, useState } from 'react';
import { badgeService } from '../api/services/badge.service';
import { logger } from '../core/logger/logger.service';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseBadgesReturn {
  badges: any[];
  userBadges: any[];
  featuredBadges: any[];
  isLoading: boolean;
  error: Error | null;
  fetchBadges: () => Promise<void>;
  fetchUserBadges: () => Promise<void>;
  fetchFeaturedBadges: () => Promise<void>;
  setFeaturedBadges: (badgeIds: string[]) => Promise<void>;
  checkEligibility: () => Promise<string[]>;
  awardBadge: (badgeId: string) => Promise<void>;
  removeBadge: (badgeId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useBadges = (): UseBadgesReturn => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [featuredBadges, setFeaturedBadgesState] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FETCH BADGES
  // ============================================

  const fetchBadges = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await badgeService.getBadges();
      setBadges(result || []);

      trackEvent('badges_view', { count: result.length });
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch badges error', error);
    } finally {
      setIsLoading(false);
    }
  }, [trackEvent]);

  const fetchUserBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await badgeService.getUserBadges(user.id);
      setUserBadges(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch user badges error', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchFeaturedBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await badgeService.getFeaturedBadges(user.id);
      setFeaturedBadgesState(result || []);
    } catch (err) {
      logger.error('❌ Fetch featured badges error', err);
    }
  }, [user]);

  // ============================================
  // SET FEATURED BADGES
  // ============================================

  const setFeaturedBadges = useCallback(async (badgeIds: string[]) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      await badgeService.setFeaturedBadges(user.id, badgeIds);
      
      // Refresh featured badges
      await fetchFeaturedBadges();
      
      trackEvent('badges_featured_update', { count: badgeIds.length });
      showToast('Featured badges updated!', 'success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Set featured badges error', error);
      showToast('Failed to update featured badges', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchFeaturedBadges, trackEvent, showToast]);

  // ============================================
  // BADGE OPERATIONS
  // ============================================

  const checkEligibility = useCallback(async () => {
    if (!user?.id) return [];

    try {
      return await badgeService.checkBadgeEligibility(user.id);
    } catch (err) {
      logger.error('❌ Check badge eligibility error', err);
      return [];
    }
  }, [user]);

  const awardBadge = useCallback(async (badgeId: string) => {
    if (!user?.id) return;

    try {
      await badgeService.awardBadge(user.id, badgeId);
      
      // Refresh user badges
      await fetchUserBadges();
      
      trackEvent('badge_earned', { badgeId });
      showToast('Badge earned! 🎉', 'success');
    } catch (err) {
      logger.error('❌ Award badge error', err);
      showToast('Failed to award badge', 'error');
      throw err;
    }
  }, [user, fetchUserBadges, trackEvent, showToast]);

  const removeBadge = useCallback(async (badgeId: string) => {
    if (!user?.id) return;

    try {
      await badgeService.removeBadge(user.id, badgeId);
      
      // Refresh user badges
      await fetchUserBadges();
      
      trackEvent('badge_removed', { badgeId });
      showToast('Badge removed', 'info');
    } catch (err) {
      logger.error('❌ Remove badge error', err);
      showToast('Failed to remove badge', 'error');
      throw err;
    }
  }, [user, fetchUserBadges, trackEvent, showToast]);

  // ============================================
  // REFRESH
  // ============================================

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchBadges(),
      fetchUserBadges(),
      fetchFeaturedBadges(),
    ]);
  }, [fetchBadges, fetchUserBadges, fetchFeaturedBadges]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchBadges();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserBadges();
      fetchFeaturedBadges();
    }
  }, [user?.id]);

  return {
    badges,
    userBadges,
    featuredBadges,
    isLoading,
    error,
    fetchBadges,
    fetchUserBadges,
    fetchFeaturedBadges,
    setFeaturedBadges,
    checkEligibility,
    awardBadge,
    removeBadge,
    refresh,
  };
};

export default useBadges;