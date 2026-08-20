/**
 * KONEX Skills Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all skill levels and their properties
 * 
 * Usage:
 * import { SKILL_LEVELS, getSkillLevelById } from '@constants/skills';
 */

// ============================================
// 1. TYPES
// ============================================

export interface SkillLevel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  minLevel: number;
  maxLevel: number;
}

// ============================================
// 2. SKILL LEVEL DEFINITIONS
// ============================================

export const SKILL_LEVELS: SkillLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Just starting out, learning the basics',
    icon: '🌱',
    color: '#10B981',
    minLevel: 0,
    maxLevel: 20,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Comfortable with the game, improving skills',
    icon: '📈',
    color: '#3B82F6',
    minLevel: 21,
    maxLevel: 50,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Skilled player with deep game knowledge',
    icon: '⚡',
    color: '#8B5CF6',
    minLevel: 51,
    maxLevel: 80,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Elite-level player, competitive ready',
    icon: '🏆',
    color: '#F59E0B',
    minLevel: 81,
    maxLevel: 100,
  },
];

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

/**
 * Get skill level by ID
 */
export const getSkillLevelById = (id: string): SkillLevel | undefined => {
  return SKILL_LEVELS.find((level) => level.id === id);
};

/**
 * Get skill level by name
 */
export const getSkillLevelByName = (name: string): SkillLevel | undefined => {
  return SKILL_LEVELS.find((level) => level.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get skill level by level number
 */
export const getSkillLevelByLevel = (level: number): SkillLevel | undefined => {
  return SKILL_LEVELS.find((sl) => level >= sl.minLevel && level <= sl.maxLevel);
};

/**
 * Get skill level options for dropdown
 */
export const getSkillLevelOptions = () => {
  return SKILL_LEVELS.map((level) => ({
    label: `${level.icon} ${level.name}`,
    value: level.id,
    description: level.description,
  }));
};

/**
 * Get next skill level
 */
export const getNextSkillLevel = (currentLevel: string): SkillLevel | undefined => {
  const currentIndex = SKILL_LEVELS.findIndex((level) => level.id === currentLevel);
  if (currentIndex === -1 || currentIndex === SKILL_LEVELS.length - 1) return undefined;
  return SKILL_LEVELS[currentIndex + 1];
};

/**
 * Get progress to next level
 */
export const getSkillProgress = (currentLevel: string, currentXp: number): number => {
  const level = getSkillLevelById(currentLevel);
  if (!level) return 0;
  const totalXp = level.maxLevel;
  return Math.min((currentXp / totalXp) * 100, 100);
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  SKILL_LEVELS,
  getSkillLevelById,
  getSkillLevelByName,
  getSkillLevelByLevel,
  getSkillLevelOptions,
  getNextSkillLevel,
  getSkillProgress,
};