/**
 * KONEX Deep Linking Configuration
 * Billion Dollar Code - Production Ready
 * 
 * Deep linking configuration for the app
 * 
 * Usage:
 * import { linking } from '@navigation/linking';
 */

import { LinkingOptions } from '@react-navigation/native';
import { APP_SCHEME } from '../config/env';
import { ROUTES } from '../config/routes';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export type RootStackParamList = {
  // Auth
  [ROUTES.AUTH.LOGIN]: undefined;
  [ROUTES.AUTH.SIGNUP]: undefined;
  [ROUTES.AUTH.ONBOARDING]: undefined;
  [ROUTES.AUTH.FORGOT_PASSWORD]: undefined;
  [ROUTES.AUTH.RESET_PASSWORD]: { token?: string };
  
  // Main
  [ROUTES.MAIN.HOME]: undefined;
  [ROUTES.MAIN.CHAT]: undefined;
  [ROUTES.MAIN.SQUADS]: undefined;
  [ROUTES.MAIN.PROFILE]: undefined;
  
  // Community
  [ROUTES.COMMUNITY.MAIN]: { communityId: string };
  [ROUTES.COMMUNITY.POSTS]: { communityId: string };
  [ROUTES.COMMUNITY.SQUADS]: { communityId: string };
  [ROUTES.COMMUNITY.LFG]: { communityId: string };
  [ROUTES.COMMUNITY.TOURNAMENTS]: { communityId: string };
  [ROUTES.COMMUNITY.MEMBERS]: { communityId: string };
  
  // Chat
  [ROUTES.CHAT.LIST]: undefined;
  [ROUTES.CHAT.DM]: { userId: string; conversationId?: string };
  [ROUTES.CHAT.SQUAD]: { squadId: string; conversationId?: string };
  
  // Squads
  [ROUTES.SQUADS.LIST]: { communityId?: string };
  [ROUTES.SQUADS.DETAIL]: { squadId: string };
  [ROUTES.SQUADS.CREATE]: { communityId?: string };
  [ROUTES.SQUADS.SETTINGS]: { squadId: string };
  
  // Profile
  [ROUTES.PROFILE.MAIN]: { userId?: string };
  [ROUTES.PROFILE.EDIT]: undefined;
  [ROUTES.PROFILE.BADGES]: undefined;
  
  // Search
  [ROUTES.SEARCH.MAIN]: { communityId?: string; initialQuery?: string };
  
  // Stories
  [ROUTES.STORIES.VIEW]: { userId: string };
  [ROUTES.STORIES.CREATE]: undefined;
  
  // Tournaments
  [ROUTES.TOURNAMENTS.MAIN]: { communityId: string };
  [ROUTES.TOURNAMENTS.DETAIL]: { tournamentId: string };
  [ROUTES.TOURNAMENTS.CREATE]: { communityId: string };
  
  // LFG
  [ROUTES.LFG.MAIN]: { communityId?: string };
  [ROUTES.LFG.CREATE]: { communityId?: string };
  [ROUTES.LFG.DETAIL]: { lfgId: string };
  
  // Notifications
  [ROUTES.NOTIFICATIONS.MAIN]: undefined;
  
  // Admin
  [ROUTES.ADMIN.DASHBOARD]: undefined;
  [ROUTES.ADMIN.USERS]: undefined;
  [ROUTES.ADMIN.SQUADS]: undefined;
  [ROUTES.ADMIN.REPORTS]: undefined;
  [ROUTES.ADMIN.APPEALS]: undefined;
};

// ============================================
// 2. LINKING CONFIGURATION
// ============================================

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [`${APP_SCHEME}://`, `https://${APP_SCHEME}.app`],
  
  config: {
    screens: {
      // Auth
      [ROUTES.AUTH.LOGIN]: 'auth/login',
      [ROUTES.AUTH.SIGNUP]: 'auth/signup',
      [ROUTES.AUTH.ONBOARDING]: 'auth/onboarding',
      [ROUTES.AUTH.FORGOT_PASSWORD]: 'auth/forgot-password',
      [ROUTES.AUTH.RESET_PASSWORD]: 'auth/reset-password/:token?',
      
      // Main
      [ROUTES.MAIN.HOME]: 'home',
      [ROUTES.MAIN.CHAT]: 'chat',
      [ROUTES.MAIN.SQUADS]: 'squads',
      [ROUTES.MAIN.PROFILE]: 'profile',
      
      // Community
      [ROUTES.COMMUNITY.MAIN]: 'community/:communityId',
      [ROUTES.COMMUNITY.POSTS]: 'community/:communityId/posts',
      [ROUTES.COMMUNITY.SQUADS]: 'community/:communityId/squads',
      [ROUTES.COMMUNITY.LFG]: 'community/:communityId/lfg',
      [ROUTES.COMMUNITY.TOURNAMENTS]: 'community/:communityId/tournaments',
      [ROUTES.COMMUNITY.MEMBERS]: 'community/:communityId/members',
      
      // Chat
      [ROUTES.CHAT.LIST]: 'chat/list',
      [ROUTES.CHAT.DM]: 'chat/dm/:userId',
      [ROUTES.CHAT.SQUAD]: 'chat/squad/:squadId',
      
      // Squads
      [ROUTES.SQUADS.LIST]: 'squads/list',
      [ROUTES.SQUADS.DETAIL]: 'squads/:squadId',
      [ROUTES.SQUADS.CREATE]: 'squads/create',
      [ROUTES.SQUADS.SETTINGS]: 'squads/:squadId/settings',
      
      // Profile
      [ROUTES.PROFILE.MAIN]: 'profile/:userId?',
      [ROUTES.PROFILE.EDIT]: 'profile/edit',
      [ROUTES.PROFILE.BADGES]: 'profile/badges',
      
      // Search
      [ROUTES.SEARCH.MAIN]: 'search/:query?',
      
      // Stories
      [ROUTES.STORIES.VIEW]: 'stories/:userId',
      [ROUTES.STORIES.CREATE]: 'stories/create',
      
      // Tournaments
      [ROUTES.TOURNAMENTS.MAIN]: 'tournaments/:communityId',
      [ROUTES.TOURNAMENTS.DETAIL]: 'tournaments/:tournamentId',
      [ROUTES.TOURNAMENTS.CREATE]: 'tournaments/create/:communityId',
      
      // LFG
      [ROUTES.LFG.MAIN]: 'lfg',
      [ROUTES.LFG.CREATE]: 'lfg/create',
      [ROUTES.LFG.DETAIL]: 'lfg/:lfgId',
      
      // Notifications
      [ROUTES.NOTIFICATIONS.MAIN]: 'notifications',
      
      // Admin
      [ROUTES.ADMIN.DASHBOARD]: 'admin',
      [ROUTES.ADMIN.USERS]: 'admin/users',
      [ROUTES.ADMIN.SQUADS]: 'admin/squads',
      [ROUTES.ADMIN.REPORTS]: 'admin/reports',
      [ROUTES.ADMIN.APPEALS]: 'admin/appeals',
    },
  },
  
  async getInitialURL() {
    // Get the initial URL
    const url = await Linking.getInitialURL();
    if (url) {
      logger.info('🔗 Initial deep link:', { url });
    }
    return url;
  },
  
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      logger.info('🔗 Deep link received:', { url });
      listener(url);
    };
    
    // Subscribe to deep links
    const subscription = Linking.addEventListener('url', onReceiveURL);
    
    return () => {
      subscription.remove();
    };
  },
};

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default linking;