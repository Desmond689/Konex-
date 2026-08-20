export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  gameId?: string;
  memberCount: number;
  avatarUrl?: string;
  bannerUrl?: string;
  isPublic: boolean;
  rules?: string[];
  createdAt: string;
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}
