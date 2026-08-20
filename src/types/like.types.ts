export interface Like {
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'story';
  createdAt: string;
}
