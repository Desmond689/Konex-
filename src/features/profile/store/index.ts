/**
 * KONEX Profile Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useProfileStore } from './profile.store';

export type {
    Profile,
    ProfileState
} from './profile.store';

export {
    selectBadgesCount, selectError, selectFollowersCount,
    selectFollowingCount,
    selectFriendsCount, selectGamerTag, selectIsLoading, selectIsOnline,
    selectLastUpdated, selectProfile, selectSquadId,
    selectSquadRole, selectUsername
} from './profile.store';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useProfileStore,
};