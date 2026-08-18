/**
 * KONEX Tournament Components — Barrel Export
 * Billion Dollar Code - Production Ready
 *
 * Central export point for src/features/tournament/components
 *
 * Usage:
 * import { TournamentCard, TournamentBracket, TournamentRegistration } from '@/features/tournament/components';
 */

export { default as TournamentCard } from './TournamentCard';
export type {
    Tournament,
    TournamentCardProps,
    TournamentStatus,
} from './TournamentCard';

export { default as TournamentBracket } from './TournamentBracket';
export type {
    BracketFormat,
    BracketMatch,
    BracketMatchStatus,
    BracketRound,
    TournamentBracketProps,
} from './TournamentBracket';

export { default as TournamentRegistration } from './TournamentRegistration';
export type {
    RegisteredSquad,
    RegisteredSquadStatus,
    TournamentRegistrationProps,
} from './TournamentRegistration';
