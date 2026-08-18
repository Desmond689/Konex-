/**
 * KONEX Gaming Styles Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all gaming styles and their properties
 * 
 * Usage:
 * import { GAMING_STYLES, getGamingStyleById } from '@constants/styles';
 */

// ============================================
// 1. TYPES
// ============================================

export interface GamingStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  examples: string[];
}

// ============================================
// 2. GAMING STYLE DEFINITIONS
// ============================================

export const GAMING_STYLES: GamingStyle[] = [
  {
    id: 'competitive',
    name: 'Competitive',
    description: 'Focused on winning and improving at all costs',
    icon: '🏆',
    color: '#EF4444',
    tags: ['Sweaty', 'Ranked', 'Tournaments', 'Meta'],
    examples: ['Ranked grind', 'Scrims', 'Tournaments', 'Clutch plays'],
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Playing for fun without pressure',
    icon: '🎮',
    color: '#10B981',
    tags: ['Relaxed', 'Fun', 'Chill', 'Laid back'],
    examples: ['Casual matches', 'Quick play', 'Mess around', 'Have fun'],
  },
  {
    id: 'ranked',
    name: 'Ranked',
    description: 'Focusing on climbing the competitive ranks',
    icon: '📈',
    color: '#3B82F6',
    tags: ['Climbing', 'Progression', 'Skill', 'Ranked'],
    examples: ['Ranked push', 'Solo queue', 'Team ranked', 'Leaderboard'],
  },
  {
    id: 'clan',
    name: 'Clan',
    description: 'Representing and playing for a clan',
    icon: '🛡️',
    color: '#8B5CF6',
    tags: ['Clan wars', 'Team play', 'Organized', 'Loyalty'],
    examples: ['Clan matches', 'Clan events', 'Team practice', 'Clan battles'],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Playing to connect and make friends',
    icon: '🤝',
    color: '#EC4899',
    tags: ['Friends', 'Community', 'Talking', 'Hangout'],
    examples: ['Party up', 'Voice chat', 'Making friends', 'Chill games'],
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Creating and sharing gaming content',
    icon: '🎥',
    color: '#F43F5E',
    tags: ['Streaming', 'Videos', 'Editing', 'Entertainment'],
    examples: ['Live streaming', 'YouTube videos', 'Clips', 'Montages'],
  },
];

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

/**
 * Get gaming style by ID
 */
export const getGamingStyleById = (id: string): GamingStyle | undefined => {
  return GAMING_STYLES.find((style) => style.id === id);
};

/**
 * Get gaming style by name
 */
export const getGamingStyleByName = (name: string): GamingStyle | undefined => {
  return GAMING_STYLES.find((style) => style.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get gaming style options for dropdown
 */
export const getGamingStyleOptions = () => {
  return GAMING_STYLES.map((style) => ({
    label: `${style.icon} ${style.name}`,
    value: style.id,
    description: style.description,
    color: style.color,
  }));
};

/**
 * Get gaming style color
 */
export const getGamingStyleColor = (id: string): string => {
  const style = getGamingStyleById(id);
  return style?.color || '#6B7280';
};

/**
 * Get gaming styles by tag
 */
export const getGamingStylesByTag = (tag: string): GamingStyle[] => {
  return GAMING_STYLES.filter((style) => style.tags.includes(tag));
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  GAMING_STYLES,
  getGamingStyleById,
  getGamingStyleByName,
  getGamingStyleOptions,
  getGamingStyleColor,
  getGamingStylesByTag,
};