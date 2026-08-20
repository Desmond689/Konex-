export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  communityId?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
}
