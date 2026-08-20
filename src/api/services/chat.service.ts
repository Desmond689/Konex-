// src/api/services/chat.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IChatService {
  getConversations(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getDMConversation(user1Id: string, user2Id: string): Promise<any>;
  getSquadConversation(squadId: string, limit?: number, offset?: number): Promise<any[]>;
  sendMessage(data: any): Promise<any>;
  sendDMMessage(senderId: string, receiverId: string, content: string, type?: string): Promise<any>;
  sendSquadMessage(senderId: string, squadId: string, content: string, type?: string): Promise<any>;
  markMessageRead(messageId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  getMessagesByConversation(conversationId: string, limit?: number, offset?: number): Promise<any[]>;
}

class ChatService implements IChatService {

  /** List chats where user is a participant (schema: chats + messages). */
  async getConversations(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      logger.info('💬 Fetching conversations for user', { userId });

      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const rows = chats || [];
      return rows.map((c: any) => {
        const last = c.last_message || {};
        const unreadMap = c.unread_count || {};
        const unread =
          typeof unreadMap === 'object' && unreadMap !== null
            ? Number(unreadMap[userId] || 0)
            : 0;
        return {
          id: c.id,
          type: c.type === 'squad' ? 'squad' : 'dm',
          title: c.name || (c.type === 'squad' ? 'Squad chat' : 'Direct message'),
          squad_id: c.squad_id,
          participants: c.participants || [],
          last_message: last,
          unread_count: unread,
          updated_at: c.last_message_at || c.updated_at || c.created_at,
        };
      });
    } catch (error) {
      logger.error('❌ Get conversations error', { error, userId });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Conversations fetch failed',
        'Failed to fetch conversations. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getDMConversation(user1Id: string, user2Id: string): Promise<any> {
    try {
      const { data: existing, error } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'dm')
        .contains('participants', [user1Id])
        .limit(50);

      if (error) throw error;

      const match = (existing || []).find((c: any) => {
        const p = c.participants || [];
        return p.includes(user1Id) && p.includes(user2Id) && p.length === 2;
      });
      if (match) return match;

      const { data: created, error: cErr } = await supabase
        .from('chats')
        .insert({
          type: 'dm',
          participants: [user1Id, user2Id],
          created_by: user1Id,
          status: 'active',
          unread_count: {},
          settings: {},
          is_pinned: false,
        })
        .select()
        .single();
      if (cErr) throw cErr;
      return created;
    } catch (error) {
      logger.error('❌ Get DM conversation error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'DM conversation failed',
        'Failed to open DM. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getSquadConversation(squadId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const { data: chat, error: chatErr } = await supabase
        .from('chats')
        .select('id')
        .eq('type', 'squad')
        .eq('squad_id', squadId)
        .maybeSingle();
      if (chatErr) throw chatErr;
      if (!chat?.id) return [];
      return this.getMessagesByConversation(chat.id, limit, offset);
    } catch (error) {
      logger.error('❌ Get squad conversation error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad chat fetch failed',
        'Failed to fetch squad conversation. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async sendMessage(data: any): Promise<any> {
    try {
      logger.info('💬 Sending message');
      const { data: message, error } = await supabase
        .from('messages')
        .insert(data)
        .select('*')
        .single();
      if (error) throw error;

      // Update chat last_message
      if (data.chat_id) {
        await supabase
          .from('chats')
          .update({
            last_message: message.content,
            last_message_at: message.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.chat_id);
      }

      logger.info('✅ Message sent', { messageId: message.id });
      return message;
    } catch (error) {
      logger.error('❌ Send message error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Send failed',
        'Failed to send message. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async sendDMMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: string = 'text'
  ): Promise<any> {
    try {
      const chat = await this.getDMConversation(senderId, receiverId);
      return this.sendMessage({
        chat_id: chat.id,
        sender_id: senderId,
        type: type || 'text',
        content: { text: content },
        status: 'sent',
        read_by: [senderId],
      });
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ Send DM error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'DM send failed',
        'Failed to send DM. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async sendSquadMessage(
    senderId: string,
    squadId: string,
    content: string,
    type: string = 'text'
  ): Promise<any> {
    try {
      let chatId: string | null = null;
      const { data: existing } = await supabase
        .from('chats')
        .select('id, participants')
        .eq('type', 'squad')
        .eq('squad_id', squadId)
        .maybeSingle();

      if (existing?.id) {
        chatId = existing.id;
        const parts: string[] = existing.participants || [];
        if (!parts.includes(senderId)) {
          await supabase
            .from('chats')
            .update({ participants: [...parts, senderId] })
            .eq('id', chatId);
        }
      } else {
        const { data: created, error: cErr } = await supabase
          .from('chats')
          .insert({
            type: 'squad',
            squad_id: squadId,
            participants: [senderId],
            created_by: senderId,
            status: 'active',
            unread_count: {},
            settings: {},
            is_pinned: false,
          })
          .select()
          .single();
        if (cErr) throw cErr;
        chatId = created.id;
      }

      return this.sendMessage({
        chat_id: chatId,
        sender_id: senderId,
        type: type || 'text',
        content: { text: content },
        status: 'sent',
        read_by: [senderId],
      });
    } catch (error) {
      if (error instanceof KonexError) throw error;
      logger.error('❌ Send squad message error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Squad message send failed',
        'Failed to send squad message. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async markMessageRead(messageId: string, userId: string): Promise<void> {
    try {
      const { data: msg, error: fetchErr } = await supabase
        .from('messages')
        .select('read_by')
        .eq('id', messageId)
        .single();
      if (fetchErr) throw fetchErr;
      const readBy: string[] = Array.isArray(msg?.read_by) ? [...msg.read_by] : [];
      if (!readBy.includes(userId)) readBy.push(userId);
      const { error } = await supabase
        .from('messages')
        .update({ read_by: readBy })
        .eq('id', messageId);
      if (error) throw error;
    } catch (error) {
      logger.error('❌ Mark message read error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Mark read failed',
        'Failed to mark message as read.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const convos = await this.getConversations(userId, 100, 0);
      return convos.reduce((sum, c) => sum + (Number(c.unread_count) || 0), 0);
    } catch (error) {
      logger.error('❌ Get unread count error', { error });
      return 0;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', userId);
      if (error) throw error;
    } catch (error) {
      logger.error('❌ Delete message error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Delete failed',
        'Failed to delete message.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getMessagesByConversation(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('💬 Fetching messages by chat', { conversationId });
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('❌ Get messages by conversation error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Messages fetch failed',
        'Failed to fetch messages. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }
}

export const chatService = new ChatService();
export default chatService;
