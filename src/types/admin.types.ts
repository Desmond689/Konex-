export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  pendingAppeals: number;
  totalSquads: number;
}
