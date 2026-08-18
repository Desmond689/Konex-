export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'invite';
  createdAt: string;
  readBy?: string[];
}

export interface Conversation {
  id: string;
  type: 'dm' | 'squad' | 'group';
  participantIds: string[];
  lastMessageAt?: string;
  metadata?: Record<string, unknown>;
}
