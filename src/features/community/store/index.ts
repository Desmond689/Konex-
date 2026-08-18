/**
 * KONEX Community Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useCommunityStore } from './community.store';
export type {
    CommunityMember,
    CommunityState
} from './community.store';

export {
    selectCommunities, selectCurrentCommunity, selectIsLoading, selectMembers, selectMyCommunities
} from './community.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useCommunityStore,
};