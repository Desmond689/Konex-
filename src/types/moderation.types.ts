export interface ModerationAction {
  id: string;
  targetType: 'user' | 'post' | 'comment' | 'squad';
  targetId: string;
  action: 'warn' | 'mute' | 'ban' | 'delete' | 'approve';
  reason: string;
  moderatorId: string;
  createdAt: string;
  expiresAt?: string;
}
