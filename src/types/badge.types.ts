export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria?: string;
}

export interface UserBadge {
  badgeId: string;
  userId: string;
  earnedAt: string;
  badge?: Badge;
}
