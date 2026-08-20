export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  expiresAt: string;
  viewCount: number;
  createdAt: string;
}
