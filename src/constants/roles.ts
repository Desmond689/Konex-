/**
 * KONEX Roles Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all available roles and their properties
 * 
 * Usage:
 * import { ROLES, getRoleById, getRolesByCategory } from '@constants/roles';
 */

// ============================================
// 1. TYPES
// ============================================

export interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'primary' | 'secondary' | 'special';
  color: string;
  abilities: string[];
}

// ============================================
// 2. ROLE DEFINITIONS
// ============================================

export const ROLES: Role[] = [
  // ============================================
  // PRIMARY ROLES
  // ============================================
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Precise long-range marksman who eliminates key targets',
    icon: '🎯',
    category: 'primary',
    color: '#8B5CF6',
    abilities: ['Long-range precision', 'Headshot specialist', 'Map control', 'Clutch potential'],
  },
  {
    id: 'rusher',
    name: 'Rusher',
    description: 'Aggressive front-line player who pushes objectives',
    icon: '🏃',
    category: 'primary',
    color: '#EF4444',
    abilities: ['High aggression', 'Objective pressure', 'Fast movement', 'Flanking'],
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Team-oriented player who enables teammates',
    icon: '🛡️',
    category: 'primary',
    color: '#10B981',
    abilities: ['Team healing', 'Shield support', 'Utility', 'Revive specialist'],
  },
  {
    id: 'flex',
    name: 'Flex',
    description: 'Versatile player who fills any role',
    icon: '🔄',
    category: 'primary',
    color: '#F59E0B',
    abilities: ['Role versatility', 'Adaptability', 'Team coverage', 'Strategic flexibility'],
  },

  // ============================================
  // SECONDARY ROLES
  // ============================================
  {
    id: 'strategist',
    name: 'Strategist',
    description: 'Tactical player who calls the shots',
    icon: '🧠',
    category: 'secondary',
    color: '#3B82F6',
    abilities: ['Tactical planning', 'Shot calling', 'Map awareness', 'Team coordination'],
  },
  {
    id: 'fragger',
    name: 'Fragger',
    description: 'High-kill player who wins gunfights',
    icon: '💥',
    category: 'secondary',
    color: '#EC4899',
    abilities: ['High damage', 'Gunfight specialist', 'Entry fragger', 'Clutch performance'],
  },
  {
    id: 'igl',
    name: 'IGL',
    description: 'In-Game Leader who directs the team',
    icon: '👑',
    category: 'secondary',
    color: '#8B5CF6',
    abilities: ['Team leadership', 'Strategy creation', 'Moral support', 'Decision making'],
  },
  {
    id: 'anchor',
    name: 'Anchor',
    description: 'Reliable player who holds positions',
    icon: '⚓',
    category: 'secondary',
    color: '#6B7280',
    abilities: ['Position holding', 'Defense specialist', 'Consistency', 'Reliability'],
  },

  // ============================================
  // SPECIAL ROLES
  // ============================================
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Creates gaming content for the community',
    icon: '🎥',
    category: 'special',
    color: '#F43F5E',
    abilities: ['Content creation', 'Editing', 'Streaming', 'Community engagement'],
  },
  {
    id: 'tournament_organizer',
    name: 'Tournament Organizer',
    description: 'Organizes and hosts tournaments',
    icon: '🏆',
    category: 'special',
    color: '#F59E0B',
    abilities: ['Event planning', 'Tournament management', 'Rule enforcement', 'Prize distribution'],
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Helps new players learn the game',
    icon: '📚',
    category: 'special',
    color: '#10B981',
    abilities: ['Teaching', 'Coaching', 'Patience', 'Communication'],
  },
  {
    id: 'clan_leader',
    name: 'Clan Leader',
    description: 'Leads and manages a clan/squad',
    icon: '🛡️',
    category: 'special',
    color: '#8B5CF6',
    abilities: ['Leadership', 'Management', 'Recruiting', 'Team building'],
  },
];

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

/**
 * Get role by ID
 */
export const getRoleById = (id: string): Role | undefined => {
  return ROLES.find((role) => role.id === id);
};

/**
 * Get roles by category
 */
export const getRolesByCategory = (category: Role['category']): Role[] => {
  return ROLES.filter((role) => role.category === category);
};

/**
 * Get primary roles
 */
export const getPrimaryRoles = (): Role[] => {
  return getRolesByCategory('primary');
};

/**
 * Get secondary roles
 */
export const getSecondaryRoles = (): Role[] => {
  return getRolesByCategory('secondary');
};

/**
 * Get special roles
 */
export const getSpecialRoles = (): Role[] => {
  return getRolesByCategory('special');
};

/**
 * Get role options for dropdown
 */
export const getRoleOptions = () => {
  return ROLES.map((role) => ({
    label: `${role.icon} ${role.name}`,
    value: role.id,
    description: role.description,
  }));
};

/**
 * Get role by name
 */
export const getRoleByName = (name: string): Role | undefined => {
  return ROLES.find((role) => role.name.toLowerCase() === name.toLowerCase());
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  ROLES,
  getRoleById,
  getRolesByCategory,
  getPrimaryRoles,
  getSecondaryRoles,
  getSpecialRoles,
  getRoleOptions,
  getRoleByName,
};