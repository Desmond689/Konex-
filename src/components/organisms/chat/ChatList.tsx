/**
 * KONEX ChatList Component
 * Billion Dollar Code - Production Ready
 * 
 * A list of chat conversations with preview and unread indicators
 * 
 * Usage:
 * <ChatList
 *   conversations={conversations}
 *   onSelectConversation={handleSelect}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../../atoms/Avatar';
import Badge from '../../atoms/Badge';
import EmptyState from '../../molecules/EmptyState';

// ============================================
// 1. TYPES
// ============================================

export interface Conversation {
  id: string;
  type: 'dm' | 'squad';
  otherUser?: {
    id: string;
    gamerTag: string;
    username: string;
    avatarUrl: string | null;
    onlineStatus: 'online' | 'away' | 'offline';
  };
  squad?: {
    id: string;
    name: string;
    iconUrl: string | null;
  };
  lastMessage: {
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    type: string;
  };
  unreadCount: number;
}

export interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string, type: 'dm' | 'squad') => void;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  onSelectConversation,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const renderItem = ({ item }: { item: Conversation }) => {
    const isDM = item.type === 'dm';
    const displayName = isDM ? item.otherUser?.gamerTag || 'Unknown' : item.squad?.name || 'Unknown';
    const displayAvatar = isDM ? item.otherUser?.avatarUrl : item.squad?.iconUrl;
    const isOnline = isDM ? item.otherUser?.onlineStatus === 'online' : false;
    const lastMessage = item.lastMessage;

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
        onPress={() => onSelectConversation(item.id, item.type)}
        activeOpacity={0.7}
      >
        <Avatar
          source={displayAvatar ? { uri: displayAvatar } : undefined}
          name={displayName}
          size="lg"
          online={isOnline}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              {displayName}
              {isDM && isOnline && (
                <Text style={{ fontSize: 12, fontWeight: '400', color: colors.success, marginLeft: 4 }}>
                   • Online
                </Text>
              )}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 13,
                color: item.unreadCount > 0 ? colors.text : colors.textMuted,
                fontWeight: item.unreadCount > 0 ? '500' : '400',
                flex: 1,
                marginRight: 8,
              }}
              numberOfLines={1}
            >
              {lastMessage.senderName}: {lastMessage.content}
            </Text>
            {item.unreadCount > 0 && (
              <Badge count={item.unreadCount} variant="error" size="sm" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {conversations.length === 0 ? (
        <EmptyState
          title="No Conversations"
          description="Start chatting with friends or join a squad"
          icon="💬"
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ChatList;