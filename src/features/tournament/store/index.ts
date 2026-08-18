/**
 * KONEX Tournament Store - Main Export
 * Billion Dollar Code - Production Ready
 */

export { default, useTournamentStore } from './tournament.store';

export type {
    Tournament,
    TournamentStoreState
} from './tournament.store';

// ============================================
// 2. SELECTORS
// ============================================

export {
    selectFeaturedTournaments, selectFilteredTournaments,
    selectOpenTournaments, selectTournamentsByCommunity,
    selectTournamentStats
} from './tournament.store';
