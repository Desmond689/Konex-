export interface Tournament {
  id: string;
  name: string;
  gameId?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startAt: string;
  endAt?: string;
  maxTeams: number;
  teamCount: number;
  prizePool?: string;
  rules?: string;
  createdAt: string;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  name: string;
  memberIds: string[];
  seed?: number;
}
