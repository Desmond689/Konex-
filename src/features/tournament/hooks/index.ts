/**
 * KONEX Tournament Hooks - Main Export
 * Billion Dollar Code - Production Ready
 */

export { useTournament } from './useTournament';
export { useTournaments } from './useTournaments';

export type {
    UseTournamentOptions,
    UseTournamentReturn
} from './useTournament';

export type {
    TournamentFilters,
    UseTournamentsOptions,
    UseTournamentsReturn
} from './useTournaments';

// ============================================
// 2. DEFAULT EXPORT
// ============================================

export default {
  useTournament,
  useTournaments,
};