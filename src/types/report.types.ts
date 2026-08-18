export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'post' | 'comment' | 'message' | 'squad';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}
