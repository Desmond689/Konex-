/**
 * KONEX MessageBubble Component
 * Billion Dollar Code - Production Ready
 * 
 * A chat message bubble with support for different message types
 * 
 * Usage:
 * <MessageBubble message={message} />
 */

import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Image,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';
import GameInviteCard from './GameInviteCard';
import SquadInviteCard from './SquadInviteCard';

// ============================================
// 1. TYPES
// ============================================

export interface Message {
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

export interface MessageBubbleProps {
  message: Message;
  onAvatarPress?: (userId: string) => void;
  onGameInviteJoin?: (data: any) => void;
  onSquadInviteJoin?: (data: any) => void;
  onPostShareOpen?: (postId: string) => void;
  style?: ViewStyle;
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAvatarPress,
  onGameInviteJoin,
  onSquadInviteJoin,
  onPostShareOpen,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showTimestamp, setShowTimestamp] = useState(false);

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View style={{ marginVertical: 4 }}>
            <Image
              source={{ uri: message.mediaUrl || message.content }}
              style={{ width: 200, height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
        );

      case 'game_invite':
        try {
          const data = JSON.parse(message.content);
          return (
            <GameInviteCard
              gameName={data.gameName || 'Unknown Game'}
              mode={data.mode || 'Unknown Mode'}
              players={data.players || 1}
              maxPlayers={data.maxPlayers || 5}
              map={data.map}
              rankRequirement={data.rankRequirement}
              micRequired={data.micRequired}
              onJoin={() => onGameInviteJoin?.(data)}
              isExpired={data.isExpired || false}
            />
          );
        } catch {
          return <Text style={{ color: colors.text }}>{message.content}</Text>;
        }

      case 'squad_invite':
        try {
          const data = JSON.parse(message.content);
          return (
            <SquadInviteCard
              squadName={data.squadName || 'Unknown Squad'}
              squadId={data.squadId}
              memberCount={data.memberCount || 1}
              onlineCount={data.onlineCount || 0}
              description={data.description}
              onJoin={() => onSquadInviteJoin?.(data)}
              isExpired={data.isExpired || false}
            />
          );
        } catch {
          return <Text style={{ color: colors.text }}>{message.content}</Text>;
        }

      case 'post_share':
        try {
          const data = JSON.parse(message.content);
          return (
            <TouchableOpacity
              onPress={() => onPostShareOpen?.(data.postId)}
              style={{
                padding: 12,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                marginVertical: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>
                📱 Shared a post
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                Tap to view
              </Text>
            </TouchableOpacity>
          );
        } catch {
          return <Text style={{ color: colors.text }}>{message.content}</Text>;
        }

      case 'voice':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 8,
              marginVertical: 4,
              minWidth: 120,
            }}
          >
            <Icon name="mic" size={20} color={colors.primary} />
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                marginHorizontal: 12,
              }}
            >
              <View
                style={{
                  width: '60%',
                  height: 4,
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>0:30</Text>
          </View>
        );

      case 'clip':
        return (
          <View
            style={{
              padding: 8,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 8,
              marginVertical: 4,
              alignItems: 'center',
            }}
          >
            <Icon name="video" size={32} color={colors.primary} />
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              🎥 Video Clip
            </Text>
            {message.mediaUrl && (
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Tap to play</Text>
            )}
          </View>
        );

      default:
        return (
          <Text style={{ fontSize: 15, color: colors.text }}>{message.content}</Text>
        );
    }
  };

  const bubbleStyle: ViewStyle = {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 16,
    backgroundColor: message.isOwn ? colors.primary : colors.surfaceSecondary,
    marginVertical: 2,
    ...style,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
    justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
  };

  const avatarStyle: ViewStyle = {
    marginRight: message.isOwn ? 0 : 8,
    marginLeft: message.isOwn ? 8 : 0,
  };

  const timeStyle: TextStyle = {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
  };

  const readReceiptStyle: TextStyle = {
    fontSize: 10,
    color: message.isRead ? colors.success : colors.textMuted,
    marginLeft: 4,
  };

  const handleBubblePress = () => {
    setShowTimestamp(!showTimestamp);
  };

  return (
    <View style={containerStyle} testID={testID}>
      {!message.isOwn && (
        <TouchableOpacity
          onPress={() => onAvatarPress?.(message.senderId)}
          style={avatarStyle}
        >
          <Avatar
            source={message.senderAvatar ? { uri: message.senderAvatar } : undefined}
            name={message.senderName}
            size="sm"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleBubblePress} activeOpacity={0.8}>
        <View style={bubbleStyle}>
          {!message.isOwn && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: 2 }}>
              {message.senderName}
            </Text>
          )}
          {renderContent()}
          {showTimestamp && (
            <Text style={timeStyle}>
              {format(new Date(message.createdAt), 'h:mm a')}
              {message.isOwn && (
                <Text style={readReceiptStyle}>
                  {'  '}
                  {message.isRead ? '✓✓ Read' : '✓ Sent'}
                </Text>
              )}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MessageBubble;