export interface LFGPost {
  id: string;
  authorId: string;
  gameId?: string;
  title: string;
  description?: string;
  rank?: string;
  slots: number;
  filledSlots: number;
  status: 'open' | 'full' | 'closed';
  tags?: string[];
  createdAt: string;
  expiresAt?: string;
}
