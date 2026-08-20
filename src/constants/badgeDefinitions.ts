/**
 * KONEX Badge Definitions
 * Billion Dollar Code - Production Ready
 * 
 * Defines all badges available in the app with their requirements
 * 
 * Usage:
 * import { BADGE_DEFINITIONS, getBadgeById, getBadgesByCategory } from '@constants/badgeDefinitions';
 */

// ============================================
// 1. TYPES
// ============================================

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'identity' | 'activity' | 'community' | 'competition' | 'milestone';
  icon: string;
  emoji: string;
  requirement: {
    type: 'count' | 'achievement' | 'time' | 'action';
    target: number | string;
    description: string;
  };
  isHidden?: boolean;
}

export interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================
// 2. BADGE CATEGORIES
// ============================================

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'identity',
    name: 'Identity',
    description: 'Your gaming identity and style',
    icon: '🎯',
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'Earned through platform activity',
    icon: '📱',
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Helping and building the community',
    icon: '🤝',
  },
  {
    id: 'competition',
    name: 'Competition',
    description: 'Winning and competing',
    icon: '🏆',
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'Time and loyalty based',
    icon: '🎂',
  },
];

// ============================================
// 3. BADGE DEFINITIONS
// ============================================

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ============================================
  // IDENTITY BADGES
  // ============================================
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'You\'ve chosen the Sniper role',
    category: 'identity',
    icon: '🎯',
    emoji: '🎯',
    requirement: {
      type: 'action',
      target: 'sniper',
      description: 'Select Sniper as your role',
    },
  },
  {
    id: 'rusher',
    name: 'Rusher',
    description: 'You\'ve chosen the Rusher role',
    category: 'identity',
    icon: '🏃',
    emoji: '🏃',
    requirement: {
      type: 'action',
      target: 'rusher',
      description: 'Select Rusher as your role',
    },
  },
  {
    id: 'support',
    name: 'Support',
    description: 'You\'ve chosen the Support role',
    category: 'identity',
    icon: '🛡️',
    emoji: '🛡️',
    requirement: {
      type: 'action',
      target: 'support',
      description: 'Select Support as your role',
    },
  },
  {
    id: 'flex',
    name: 'Flex',
    description: 'You\'ve chosen the Flex role',
    category: 'identity',
    icon: '🔄',
    emoji: '🔄',
    requirement: {
      type: 'action',
      target: 'flex',
      description: 'Select Flex as your role',
    },
  },

  // ============================================
  // ACTIVITY BADGES
  // ============================================
  {
    id: 'first_post',
    name: 'First Post',
    description: 'You made your first post!',
    category: 'activity',
    icon: '📝',
    emoji: '📝',
    requirement: {
      type: 'count',
      target: 1,
      description: 'Create your first post',
    },
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'You\'ve posted 10+ times',
    category: 'activity',
    icon: '🎥',
    emoji: '🎥',
    requirement: {
      type: 'count',
      target: 10,
      description: 'Create 10+ posts',
    },
  },
  {
    id: 'engager',
    name: 'Engager',
    description: 'You\'ve liked 100+ posts',
    category: 'activity',
    icon: '❤️',
    emoji: '❤️',
    requirement: {
      type: 'count',
      target: 100,
      description: 'Like 100+ posts',
    },
  },
  {
    id: 'commentator',
    name: 'Commentator',
    description: 'You\'ve commented 50+ times',
    category: 'activity',
    icon: '💬',
    emoji: '💬',
    requirement: {
      type: 'count',
      target: 50,
      description: 'Comment 50+ times',
    },
  },

  // ============================================
  // COMMUNITY BADGES
  // ============================================
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'You\'ve joined 3+ squads',
    category: 'community',
    icon: '🤝',
    emoji: '🤝',
    requirement: {
      type: 'count',
      target: 3,
      description: 'Join 3+ squads',
    },
  },
  {
    id: 'helpful',
    name: 'Helpful',
    description: 'You\'ve been voted helpful 10+ times',
    category: 'community',
    icon: '🌟',
    emoji: '🌟',
    requirement: {
      type: 'count',
      target: 10,
      description: 'Receive 10+ helpful votes',
    },
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'You\'ve helped new players',
    category: 'community',
    icon: '📚',
    emoji: '📚',
    requirement: {
      type: 'action',
      target: 'mentor',
      description: 'Help new players in the community',
    },
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    description: 'You\'ve invited 5+ friends',
    category: 'community',
    icon: '👥',
    emoji: '👥',
    requirement: {
      type: 'count',
      target: 5,
      description: 'Invite 5+ friends to the app',
    },
  },

  // ============================================
  // COMPETITION BADGES
  // ============================================
  {
    id: 'clutch_king',
    name: 'Clutch King',
    description: 'You won a tournament!',
    category: 'competition',
    icon: '🏆',
    emoji: '🏆',
    requirement: {
      type: 'action',
      target: 'tournament_win',
      description: 'Win a tournament',
    },
  },
  {
    id: 'tournament_winner',
    name: 'Tournament Winner',
    description: 'You\'ve won 3+ tournaments',
    category: 'competition',
    icon: '🥇',
    emoji: '🥇',
    requirement: {
      type: 'count',
      target: 3,
      description: 'Win 3+ tournaments',
    },
  },
  {
    id: 'ranked_warrior',
    name: 'Ranked Warrior',
    description: 'Top 10 in ranked leaderboard',
    category: 'competition',
    icon: '⚔️',
    emoji: '⚔️',
    requirement: {
      type: 'action',
      target: 'ranked_top_10',
      description: 'Reach top 10 in ranked leaderboard',
    },
  },

  // ============================================
  // MILESTONE BADGES
  // ============================================
  {
    id: 'newbie',
    name: 'Newbie',
    description: 'Your first day on KONEX!',
    category: 'milestone',
    icon: '🌱',
    emoji: '🌱',
    requirement: {
      type: 'time',
      target: 1,
      description: 'Be active for 1 day',
    },
  },
  {
    id: 'loyal',
    name: 'Loyal',
    description: 'You\'ve been active for 30 days',
    category: 'milestone',
    icon: '🎂',
    emoji: '🎂',
    requirement: {
      type: 'time',
      target: 30,
      description: 'Be active for 30 days',
    },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'You\'ve been active for 1 year!',
    category: 'milestone',
    icon: '👑',
    emoji: '👑',
    requirement: {
      type: 'time',
      target: 365,
      description: 'Be active for 365 days',
    },
  },
  {
    id: 'og',
    name: 'OG',
    description: 'You were among the first 1000 users!',
    category: 'milestone',
    icon: '💎',
    emoji: '💎',
    requirement: {
      type: 'action',
      target: 'og',
      description: 'Be among the first 1000 users',
    },
    isHidden: true,
  },
];

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

/**
 * Get a badge by ID
 */
export const getBadgeById = (id: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find((badge) => badge.id === id);
};

/**
 * Get badges by category
 */
export const getBadgesByCategory = (
  category: BadgeDefinition['category']
): BadgeDefinition[] => {
  return BADGE_DEFINITIONS.filter((badge) => badge.category === category);
};

/**
 * Get badges by category name
 */
export const getBadgesByCategoryName = (
  categoryName: string
): BadgeDefinition[] => {
  const category = BADGE_CATEGORIES.find((c) => c.id === categoryName);
  if (!category) return [];
  return getBadgesByCategory(category.id as BadgeDefinition['category']);
};

/**
 * Get visible badges (excludes hidden badges)
 */
export const getVisibleBadges = (): BadgeDefinition[] => {
  return BADGE_DEFINITIONS.filter((badge) => !badge.isHidden);
};

/**
 * Get all badge categories
 */
export const getAllCategories = (): BadgeCategory[] => {
  return BADGE_CATEGORIES;
};

/**
 * Get badge emoji by ID
 */
export const getBadgeEmoji = (id: string): string => {
  const badge = getBadgeById(id);
  return badge?.emoji || '🏅';
};

/**
 * Get badge name by ID
 */
export const getBadgeName = (id: string): string => {
  const badge = getBadgeById(id);
  return badge?.name || 'Unknown Badge';
};

/**
 * Get badges for onboarding (identity badges only)
 */
export const getOnboardingBadges = (): BadgeDefinition[] => {
  return getBadgesByCategory('identity');
};

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default {
  BADGE_DEFINITIONS,
  BADGE_CATEGORIES,
  getBadgeById,
  getBadgesByCategory,
  getBadgesByCategoryName,
  getVisibleBadges,
  getAllCategories,
  getBadgeEmoji,
  getBadgeName,
  getOnboardingBadges,
};