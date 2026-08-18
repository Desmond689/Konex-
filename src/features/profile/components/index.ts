/**
 * KONEX Profile Components - Main Export
 * Billion Dollar Code - Production Ready
 */

export { EditProfileForm } from './EditProfileForm';
export { GamingIdentity } from './GamingIdentity';
export { ProfileActions } from './ProfileActions';
export { ProfileBadges } from './ProfileBadges';
export { ProfileHeader } from './ProfileHeader';
export { ProfileStats } from './ProfileStats';
export { ProfileTabs } from './ProfileTabs';

export type {
    ProfileHeaderProps, ProfileUser
} from './ProfileHeader';

export type {
    ProfileStatsProps, UserStats
} from './ProfileStats';

export type {
    ProfileTab,
    ProfileTabCounts,
    ProfileTabsProps
} from './ProfileTabs';

export type {
    Badge,
    ProfileBadgesProps
} from './ProfileBadges';

export type {
    EditProfileFormProps, ProfileFormData
} from './EditProfileForm';

export type {
    GamingIdentityData,
    GamingIdentityProps
} from './GamingIdentity';

export type {
    ProfileActionsProps, RelationshipStatus
} from './ProfileActions';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfileBadges,
  EditProfileForm,
  GamingIdentity,
  ProfileActions,
};