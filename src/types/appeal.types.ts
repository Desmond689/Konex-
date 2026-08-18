export interface Appeal {
  id: string;
  userId: string;
  reportId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}
