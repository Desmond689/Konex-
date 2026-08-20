/**
 * KONEX Chat Store
 */

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  type?: 'text' | 'image' | 'invite';
}

export interface Conversation {
  id: string;
  type: 'dm' | 'squad';
  title?: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoading: false,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (conversationId, messages) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: messages } })),
  addMessage: (conversationId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), message],
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: {},
      isLoading: false,
    }),
}));

export default useChatStore;
