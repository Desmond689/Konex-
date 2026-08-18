/**
 * KONEX Squad Types Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all squad types and their properties
 * 
 * Usage:
 * import { SQUAD_TYPES, getSquadTypeById } from '@constants/squadTypes';
 */

// ============================================
// 1. TYPES
// ============================================

export interface SquadType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tagColor: string;
  maxMembers: number;
  defaultJoinType: 'open' | 'approval' | 'inviteOnly';
  features: string[];
}

// ============================================
// 2. SQUAD TYPE DEFINITIONS
// ============================================

export const SQUAD_TYPES: SquadType[] = [
  {
    id: 'competitive',
    name: 'Competitive',
    description: 'Focused on winning, ranked play, and tournaments',
    icon: '🏆',
    color: '#EF4444',
    tagColor: '#DC2626',
    maxMembers: 20,
    defaultJoinType: 'approval',
    features: ['Ranked play', 'Tournament participation', 'Team coordination', 'Strategy focus'],
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed gaming without pressure',
    icon: '🎮',
    color: '#10B981',
    tagColor: '#059669',
    maxMembers: 30,
    defaultJoinType: 'open',
    features: ['Fun-focused', 'No pressure', 'Social gaming', 'All skill levels'],
  },
  {
    id: 'ranked',
    name: 'Ranked',
    description: 'Climbing the ranks together',
    icon: '📈',
    color: '#3B82F6',
    tagColor: '#2563EB',
    maxMembers: 15,
    defaultJoinType: 'approval',
    features: ['Ranked focus', 'Skill improvement', 'Team synergy', 'Progression'],
  },
  {
    id: 'clan',
    name: 'Clan',
    description: 'Organized clan with structured leadership',
    icon: '🛡️',
    color: '#8B5CF6',
    tagColor: '#7C3AED',
    maxMembers: 50,
    defaultJoinType: 'approval',
    features: ['Structured hierarchy', 'Clan wars', 'Organized events', 'Long-term goals'],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Making friends and having fun',
    icon: '🤝',
    color: '#EC4899',
    tagColor: '#DB2777',
    maxMembers: 40,
    defaultJoinType: 'open',
    features: ['Friendship focus', 'Community building', 'Events and hangouts', 'Supportive environment'],
  },
];

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

/**
 * Get squad type by ID
 */
export const getSquadTypeById = (id: string): SquadType | undefined => {
  return SQUAD_TYPES.find((type) => type.id === id);
};

/**
 * Get squad type by name
 */
export const getSquadTypeByName = (name: string): SquadType | undefined => {
  return SQUAD_TYPES.find((type) => type.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get squad type options for dropdown
 */
export const getSquadTypeOptions = () => {
  return SQUAD_TYPES.map((type) => ({
    label: `${type.icon} ${type.name}`,
    value: type.id,
    description: type.description,
    color: type.color,
  }));
};

/**
 * Get squad type colors
 */
export const getSquadTypeColors = (id: string): { color: string; tagColor: string } => {
  const type = getSquadTypeById(id);
  return {
    color: type?.color || '#6B7280',
    tagColor: type?.tagColor || '#6B7280',
  };
};

/**
 * Get default join type for squad type
 */
export const getDefaultJoinType = (id: string): 'open' | 'approval' | 'inviteOnly' => {
  const type = getSquadTypeById(id);
  return type?.defaultJoinType || 'open';
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  SQUAD_TYPES,
  getSquadTypeById,
  getSquadTypeByName,
  getSquadTypeOptions,
  getSquadTypeColors,
  getDefaultJoinType,
};