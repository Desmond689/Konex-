export interface Squad {
  id: string;
  name: string;
  tag?: string;
  description?: string;
  gameId?: string;
  ownerId: string;
  memberCount: number;
  avatarUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface SquadMember {
  userId: string;
  squadId: string;
  role: 'owner' | 'officer' | 'member';
  joinedAt: string;
}
