export interface UserProfile {
  id: string;
  email: string;
  username: string;
  gamerTag?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  country?: string;
  favoriteGames?: string[];
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserInsert {
  id: string;
  email: string;
  username: string;
  gamerTag?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
