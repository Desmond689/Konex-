/**
 * KONEX ChatScreen Component
 * Billion Dollar Code - Production Ready
 * 
 * The main chat screen with message list and input
 * 
 * Usage:
 * <ChatScreen
 *   messages={messages}
 *   onSend={handleSend}
 *   onLoadMore={handleLoadMore}
 * />
 */

import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Icon from '../../atoms/Icon';
import EmptyState from '../../molecules/EmptyState';
import AttachmentPicker from './AttachmentPicker';
import MessageBubble from './MessageBubble';

// ============================================
// 1. TYPES
// ============================================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: 'text' | 'image' | 'clip' | 'voice' | 'game_invite' | 'squad_invite' | 'post_share';
  mediaUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface ChatScreenProps {
  /** Messages to display */
  messages: ChatMessage[];
  /** On send message handler */
  onSend: (content: string, type?: string, mediaUrl?: string) => Promise<void>;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** On attachment send handler */
  onAttachmentSend?: (attachments: any[]) => Promise<void>;
  /** On game invite send handler */
  onGameInvite?: () => void;
  /** On squad invite send handler */
  onSquadInvite?: () => void;
  /** On post share handler */
  onPostShare?: () => void;
  /** Is loading more */
  isLoadingMore?: boolean;
  /** Has more messages */
  hasMore?: boolean;
  /** Is typing */
  isTyping?: boolean;
  /** Typing users */
  typingUsers?: string[];
  /** Chat title */
  title?: string;
  /** Chat subtitle */
  subtitle?: string;
  /** User avatar */
  avatarSource?: { uri: string } | null;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSend,
  onLoadMore,
  onAttachmentSend,
  onGameInvite,
  onSquadInvite,
  onPostShare,
  isLoadingMore = false,
  hasMore = false,
  isTyping = false,
  typingUsers = [],
  title = 'Chat',
  subtitle,
  avatarSource,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      setIsSending(true);
      await onSend(inputText.trim(), 'text');
      setInputText('');
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentSend = async (attachments: any[]) => {
    if (onAttachmentSend) {
      await onAttachmentSend(attachments);
    }
    setShowAttachments(false);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderHeader = () => (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity style={{ marginRight: 12 }}>
        <Icon name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      {avatarSource && (
        <Avatar source={avatarSource} name={title} size="sm" style={{ marginRight: 10 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: colors.textMuted }}>{subtitle}</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {onGameInvite && (
          <TouchableOpacity onPress={onGameInvite} style={{ marginRight: 12 }}>
            <Icon name="gamepad-2" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity>
          <Icon name="more-vertical" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isTyping && typingUsers.length === 0) return null;

    return (
      <View style={{ padding: 8, paddingLeft: 16 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
          {typingUsers.length > 0 ? `${typingUsers.join(', ')} typing...` : 'Someone is typing...'}
        </Text>
      </View>
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    maxHeight: 100,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        inverted
        ListEmptyComponent={
          <EmptyState title="No Messages" description="Say hello!" icon="💬" />
        }
        ListFooterComponent={renderFooter}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          isLoadingMore ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      />

      {showAttachments && (
        <AttachmentPicker
          onSend={handleAttachmentSend}
          isSending={isSending}
          maxAttachments={5}
        />
      )}

      <View style={inputContainerStyle}>
        <TouchableOpacity
          onPress={() => setShowAttachments(!showAttachments)}
          style={{ marginRight: 8 }}
        >
          <Icon name="paperclip" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={inputStyle}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          editable={!isSending}
        />
        {onGameInvite && (
          <TouchableOpacity onPress={onGameInvite} style={{ marginHorizontal: 4 }}>
            <Icon name="gamepad-2" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 24,
            backgroundColor: inputText.trim() ? colors.primary : colors.disabled,
          }}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;