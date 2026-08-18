/**
 * KONEX Games Constants
 * Billion Dollar Code - Production Ready
 * 
 * Defines all supported games and their properties
 * 
 * Usage:
 * import { GAMES, getGameById, getGameByName } from '@constants/games';
 */

// ============================================
// 1. TYPES
// ============================================

export interface Game {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  genres: string[];
  platforms: string[];
  modes: string[];
  isActive: boolean;
  category: 'shooter' | 'battle_royale' | 'rpg' | 'sports' | 'strategy' | 'racing' | 'fighting' | 'other';
}

// ============================================
// 2. GAME DEFINITIONS
// ============================================

export const GAMES: Game[] = [
  {
    id: 'cod_mobile',
    name: 'COD Mobile',
    slug: 'cod-mobile',
    logoUrl: '/images/games/cod-mobile-logo.png',
    coverUrl: '/images/games/cod-mobile-cover.jpg',
    description: 'Call of Duty Mobile brings the iconic FPS experience to mobile devices with competitive multiplayer and battle royale modes.',
    developer: 'TiMi Studios',
    publisher: 'Activision',
    releaseDate: '2019-10-01',
    genres: ['Shooter', 'FPS', 'Action'],
    platforms: ['iOS', 'Android'],
    modes: ['Multiplayer', 'Battle Royale', 'Zombies'],
    isActive: true,
    category: 'shooter',
  },
  {
    id: 'pubg_mobile',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    logoUrl: '/images/games/pubg-mobile-logo.png',
    coverUrl: '/images/games/pubg-mobile-cover.jpg',
    description: 'PUBG Mobile delivers the ultimate battle royale experience with realistic gameplay and massive 100-player matches.',
    developer: 'Lightspeed & Quantum Studio',
    publisher: 'Tencent Games',
    releaseDate: '2018-03-19',
    genres: ['Shooter', 'Battle Royale', 'Action'],
    platforms: ['iOS', 'Android'],
    modes: ['Battle Royale', 'Arcade', 'Arena'],
    isActive: true,
    category: 'battle_royale',
  },
  {
    id: 'free_fire',
    name: 'Free Fire',
    slug: 'free-fire',
    logoUrl: '/images/games/free-fire-logo.png',
    coverUrl: '/images/games/free-fire-cover.jpg',
    description: 'Free Fire is the ultimate survival shooter game where 50 players fight for survival in a fast-paced battle royale.',
    developer: '111 Dots Studio',
    publisher: 'Garena',
    releaseDate: '2017-12-04',
    genres: ['Shooter', 'Battle Royale', 'Action'],
    platforms: ['iOS', 'Android'],
    modes: ['Battle Royale', 'Clash Squad'],
    isActive: true,
    category: 'battle_royale',
  },
  {
    id: 'mobile_legends',
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    logoUrl: '/images/games/mobile-legends-logo.png',
    coverUrl: '/images/games/mobile-legends-cover.jpg',
    description: 'Mobile Legends is a MOBA game where two teams of five players battle to destroy the enemy base.',
    developer: 'Moonton',
    publisher: 'Moonton',
    releaseDate: '2016-07-14',
    genres: ['MOBA', 'Strategy'],
    platforms: ['iOS', 'Android'],
    modes: ['Classic', 'Ranked', 'Brawl', 'Arcade'],
    isActive: true,
    category: 'strategy',
  },
  {
    id: 'genshin_impact',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    logoUrl: '/images/games/genshin-impact-logo.png',
    coverUrl: '/images/games/genshin-impact-cover.jpg',
    description: 'Genshin Impact is an open-world action RPG where you explore Teyvat, a vast world filled with adventure and mystery.',
    developer: 'HoYoverse',
    publisher: 'HoYoverse',
    releaseDate: '2020-09-28',
    genres: ['RPG', 'Action', 'Adventure'],
    platforms: ['iOS', 'Android', 'PC', 'PS4', 'PS5'],
    modes: ['Story', 'Co-op', 'Domain'],
    isActive: true,
    category: 'rpg',
  },
  {
    id: 'mlbb',
    name: 'MLBB',
    slug: 'mlbb',
    logoUrl: '/images/games/mlbb-logo.png',
    coverUrl: '/images/games/mlbb-cover.jpg',
    description: 'Mobile Legends: Bang Bang is the iconic MOBA game that started it all on mobile with fast-paced 5v5 matches.',
    developer: 'Moonton',
    publisher: 'Moonton',
    releaseDate: '2016-11-09',
    genres: ['MOBA', 'Strategy'],
    platforms: ['iOS', 'Android'],
    modes: ['Classic', 'Ranked', 'Brawl'],
    isActive: true,
    category: 'strategy',
  },
  {
    id: 'cod_warzone',
    name: 'COD Warzone',
    slug: 'cod-warzone',
    logoUrl: '/images/games/cod-warzone-logo.png',
    coverUrl: '/images/games/cod-warzone-cover.jpg',
    description: 'Call of Duty: Warzone is a battle royale game featuring cross-platform play and intense combat.',
    developer: 'Infinity Ward',
    publisher: 'Activision',
    releaseDate: '2020-03-10',
    genres: ['Shooter', 'Battle Royale'],
    platforms: ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series'],
    modes: ['Battle Royale', 'Plunder'],
    isActive: true,
    category: 'battle_royale',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    slug: 'valorant',
    logoUrl: '/images/games/valorant-logo.png',
    coverUrl: '/images/games/valorant-cover.jpg',
    description: 'Valorant is a team-based tactical shooter where players use unique abilities to outplay their opponents.',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    releaseDate: '2020-06-02',
    genres: ['Shooter', 'FPS', 'Tactical'],
    platforms: ['PC'],
    modes: ['Unrated', 'Competitive', 'Deathmatch', 'Spike Rush'],
    isActive: true,
    category: 'shooter',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    slug: 'fortnite',
    logoUrl: '/images/games/fortnite-logo.png',
    coverUrl: '/images/games/fortnite-cover.jpg',
    description: 'Fortnite is the iconic battle royale game where 100 players fight for survival on a vibrant island.',
    developer: 'Epic Games',
    publisher: 'Epic Games',
    releaseDate: '2017-07-25',
    genres: ['Shooter', 'Battle Royale', 'Action'],
    platforms: ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series', 'Switch', 'iOS', 'Android'],
    modes: ['Battle Royale', 'Zero Build', 'Creative'],
    isActive: true,
    category: 'battle_royale',
  },
];

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

/**
 * Get a game by ID
 */
export const getGameById = (id: string): Game | undefined => {
  return GAMES.find((game) => game.id === id);
};

/**
 * Get a game by name
 */
export const getGameByName = (name: string): Game | undefined => {
  return GAMES.find((game) => game.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get a game by slug
 */
export const getGameBySlug = (slug: string): Game | undefined => {
  return GAMES.find((game) => game.slug === slug);
};

/**
 * Get games by category
 */
export const getGamesByCategory = (category: Game['category']): Game[] => {
  return GAMES.filter((game) => game.category === category);
};

/**
 * Get active games
 */
export const getActiveGames = (): Game[] => {
  return GAMES.filter((game) => game.isActive);
};

/**
 * Get game categories with counts
 */
export const getGameCategories = (): { category: Game['category']; count: number; games: Game[] }[] => {
  const categories = GAMES.reduce((acc, game) => {
    if (!acc[game.category]) {
      acc[game.category] = [];
    }
    acc[game.category].push(game);
    return acc;
  }, {} as Record<Game['category'], Game[]>);

  return Object.entries(categories).map(([category, games]) => ({
    category: category as Game['category'],
    count: games.length,
    games,
  }));
};

/**
 * Search games by name
 */
export const searchGames = (query: string): Game[] => {
  const lowercaseQuery = query.toLowerCase();
  return GAMES.filter(
    (game) =>
      game.name.toLowerCase().includes(lowercaseQuery) ||
      game.description.toLowerCase().includes(lowercaseQuery) ||
      game.genres.some((genre) => genre.toLowerCase().includes(lowercaseQuery))
  );
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  GAMES,
  getGameById,
  getGameByName,
  getGameBySlug,
  getGamesByCategory,
  getActiveGames,
  getGameCategories,
  searchGames,
};