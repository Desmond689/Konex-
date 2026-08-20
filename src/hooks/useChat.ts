// @ts-nocheck
/**
 * KONEX useChat Hook
 * Billion Dollar Code - Production Ready
 * 
 * Provides chat management
 * 
 * Usage:
 * const { messages, sendMessage, markAsRead } = useChat(conversationId);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { realtimeService } from '../api/realtime';
import { chatService } from '../api/services/chat.service';
import { logger } from '../core/logger/logger.service';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { useAnalytics } from './useAnalytics';
import { useAuth } from './useAuth';

export interface UseChatOptions {
  conversationId?: string;
  squadId?: string;
  receiverId?: string;
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UseChatReturn {
  messages: any[];
  isLoading: boolean;
  isSending: boolean;
  hasMore: boolean;
  error: Error | null;
  typingUsers: string[];
  unreadCount: number;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, type?: string, mediaUrl?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendGameInvite: (gameInviteData: any) => Promise<void>;
  sendSquadInvite: (squadId: string) => Promise<void>;
  sendPostShare: (postId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  refresh: () => Promise<void>;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const {
    conversationId,
    squadId,
    receiverId,
    initialLimit = 50,
    autoFetch = true,
  } = options;

  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showToast } = useUIStore();
  
  const {
    messages,
    setMessages,
    addMessage,
    markMessageRead,
    markAllRead,
    setTyping: setTypingStore,
    unreadCount,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  // ============================================
  // FETCH MESSAGES
  // ============================================

  const fetchMessages = useCallback(async (pageNum: number, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsLoading(true);
      } else if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      let result;
      if (conversationId) {
        result = await chatService.getMessagesByConversation(conversationId, initialLimit, pageNum * initialLimit);
      } else if (squadId) {
        result = await chatService.getSquadConversation(squadId, initialLimit, pageNum * initialLimit);
      } else if (receiverId && user) {
        result = await chatService.getDMConversation(user.id, receiverId);
      } else {
        result = [];
      }

      const messagesData = result || [];
      const hasMoreData = messagesData.length >= initialLimit;

      if (refresh || pageNum === 0) {
        setMessages(conversationId || squadId || '', messagesData);
        setPage(pageNum + 1);
        setHasMore(hasMoreData);
      } else {
        setMessages(conversationId || squadId || '', [...messagesData, ...messages]);
        setPage(pageNum + 1);
        setHasMore(hasMoreData);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Fetch messages error', error);
    } finally {
      if (refresh) {
        setIsLoading(false);
      } else if (pageNum === 0) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [conversationId, squadId, receiverId, user, initialLimit, messages]);

  // ============================================
  // LOAD MORE / REFRESH
  // ============================================

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    await fetchMessages(page, false);
  }, [page, hasMore, isLoadingMore, isLoading, fetchMessages]);

  const refresh = useCallback(async () => {
    await fetchMessages(0, true);
  }, [fetchMessages]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = useCallback(async (content: string, type: string = 'text', mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) {
      showToast('Message cannot be empty', 'warning');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      let result;
      if (conversationId) {
        // This would need conversation ID mapping
        result = await chatService.sendMessage({
          sender_id: user?.id,
          receiver_id: receiverId,
          content: content.trim(),
          message_type: type,
          media_url: mediaUrl,
        });
      } else if (squadId) {
        result = await chatService.sendSquadMessage(
          user?.id || '',
          squadId,
          content.trim(),
          type
        );
      } else if (receiverId) {
        result = await chatService.sendDMMessage(
          user?.id || '',
          receiverId,
          content.trim(),
          type
        );
      } else {
        throw new Error('No conversation target specified');
      }

      addMessage(conversationId || squadId || '', result);
      
      trackEvent('chat_message_send', {
        type,
        hasMedia: !!mediaUrl,
        conversationId,
        squadId,
        receiverId,
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('❌ Send message error', error);
      showToast('Failed to send message', 'error');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [user, conversationId, squadId, receiverId, addMessage, trackEvent, showToast]);

  // ============================================
  // MARK AS READ
  // ============================================

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await chatService.markMessageRead(messageId, user?.id || '');
      markMessageRead(conversationId || squadId || '', messageId);
    } catch (err) {
      logger.error('❌ Mark message read error', err);
    }
  }, [user, conversationId, squadId, markMessageRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all messages as read in the conversation
      markAllRead(conversationId || squadId || '');
      trackEvent('chat_mark_all_read', { conversationId, squadId });
    } catch (err) {
      logger.error('❌ Mark all read error', err);
    }
  }, [conversationId, squadId, markAllRead, trackEvent]);

  // ============================================
  // INVITES & SHARES
  // ============================================

  const sendGameInvite = useCallback(async (gameInviteData: any) => {
    try {
      const content = JSON.stringify(gameInviteData);
      await sendMessage(content, 'game_invite');
      trackEvent('chat_game_invite', { conversationId, squadId, receiverId });
    } catch (err) {
      logger.error('❌ Send game invite error', err);
      showToast('Failed to send game invite', 'error');
      throw err;
    }
  }, [sendMessage, conversationId, squadId, receiverId, trackEvent, showToast]);

  const sendSquadInvite = useCallback(async (targetSquadId: string) => {
    try {
      const content = JSON.stringify({ squadId: targetSquadId });
      await sendMessage(content, 'squad_invite');
      trackEvent('chat_squad_invite', { conversationId, squadId, receiverId, targetSquadId });
    } catch (err) {
      logger.error('❌ Send squad invite error', err);
      showToast('Failed to send squad invite', 'error');
      throw err;
    }
  }, [sendMessage, conversationId, squadId, receiverId, trackEvent, showToast]);

  const sendPostShare = useCallback(async (postId: string) => {
    try {
      const content = JSON.stringify({ postId });
      await sendMessage(content, 'post_share');
      trackEvent('chat_post_share', { conversationId, squadId, receiverId, postId });
    } catch (err) {
      logger.error('❌ Send post share error', err);
      showToast('Failed to share post', 'error');
      throw err;
    }
  }, [sendMessage, conversationId, squadId, receiverId, trackEvent, showToast]);

  // ============================================
  // TYPING INDICATOR
  // ============================================

  const setTyping = useCallback((isTyping: boolean) => {
    const chatId = conversationId || squadId || '';
    setTypingStore(chatId, user?.id || '', isTyping);

    if (isTyping) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Auto-clear typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStore(chatId, user?.id || '', false);
      }, 3000);
    }
  }, [user, conversationId, squadId, setTypingStore]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================

  useEffect(() => {
    if (!autoFetch) return;

    // Subscribe to realtime updates
    let subscription: any;

    if (squadId) {
      subscription = realtimeService.subscribe(`squad_${squadId}`, {
        table: 'messages',
        filter: { squad_id: squadId },
        onInsert: (payload) => {
          addMessage(squadId, payload);
        },
      });
    } else if (receiverId && user) {
      subscription = realtimeService.subscribe(`dm_${user.id}`, {
        table: 'messages',
        filter: { receiver_id: user.id },
        onInsert: (payload) => {
          addMessage(conversationId || '', payload);
        },
      });
    }

    return () => {
      if (subscription) {
        realtimeService.unsubscribe(subscription.id);
      }
    };
  }, [squadId, receiverId, user, autoFetch, addMessage]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (autoFetch && (conversationId || squadId || receiverId)) {
      fetchMessages(0);
    }
  }, [conversationId, squadId, receiverId, autoFetch]);

  return {
    messages,
    isLoading,
    isSending,
    hasMore,
    error,
    typingUsers,
    unreadCount,
    loadMore,
    sendMessage,
    markAsRead,
    markAllAsRead,
    sendGameInvite,
    sendSquadInvite,
    sendPostShare,
    setTyping,
    refresh,
  };
};

export default useChat;