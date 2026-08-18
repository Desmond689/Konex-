/**
 * KONEX LFGPartyChat Component
 * Billion Dollar Code - Production Ready
 * 
 * A chat component specifically for LFG parties
 * 
 * Usage:
 * <LFGPartyChat
 *   partyId={partyId}
 *   messages={messages}
 *   onSend={handleSend}
 *   onLeave={handleLeave}
 * />
 */

import { formatDistanceToNow } from 'date-fns';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Icon from '../../../components/atoms/Icon';
import EmptyState from '../../../components/molecules/EmptyState';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface PartyMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

export interface LFGPartyChatProps {
  /** Party ID */
  partyId: string;
  /** Party name */
  partyName?: string;
  /** Messages */
  messages: PartyMessage[];
  /** On send handler */
  onSend: (content: string) => Promise<void>;
  /** On leave handler */
  onLeave: () => Promise<void>;
  /** On user press handler */
  onUserPress?: (userId: string) => void;
  /** Is loading */
  isLoading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGPartyChat: React.FC<LFGPartyChatProps> = ({
  partyId,
  partyName = 'Party Chat',
  messages,
  onSend,
  onLeave,
  onUserPress,
  isLoading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSend(inputText.trim());
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: PartyMessage }) => {
    const isOwn = item.isOwn;

    const bubbleStyle: ViewStyle = {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 12,
      backgroundColor: isOwn ? colors.primary : colors.surfaceSecondary,
      marginVertical: 4,
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
    };

    const textStyle: TextStyle = {
      fontSize: 14,
      color: isOwn ? '#FFFFFF' : colors.text,
    };

    const timeStyle: TextStyle = {
      fontSize: 10,
      color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textMuted,
      marginTop: 2,
      alignSelf: 'flex-end',
    };

    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 }}>
        {!isOwn && (
          <TouchableOpacity onPress={() => onUserPress?.(item.senderId)}>
            <Avatar
              source={item.senderAvatar ? { uri: item.senderAvatar } : undefined}
              name={item.senderName}
              size="xs"
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        )}
        <View style={bubbleStyle}>
          {!isOwn && (
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary, marginBottom: 2 }}>
              {item.senderName}
            </Text>
          )}
          <Text style={textStyle}>{item.content}</Text>
          <Text style={timeStyle}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Text>
        </View>
      </View>
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    fontSize: 15,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    maxHeight: 100,
    minHeight: 40,
  };

  return (
    <Card style={containerStyle} testID={testID}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>💬 {partyName}</Text>
        <Button
          title="Leave"
          variant="ghost"
          size="sm"
          onPress={onLeave}
        />
      </View>

      {messages.length === 0 ? (
        <EmptyState
          title="No Messages"
          description="Start the conversation!"
          icon="💬"
          style={{ padding: 20 }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 12 }}
          inverted
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={inputContainerStyle}>
          <TextInput
            style={inputStyle}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            style={{
              marginLeft: 8,
              padding: 8,
              borderRadius: 20,
              backgroundColor: inputText.trim() ? colors.primary : colors.disabled,
            }}
          >
            <Icon name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Card>
  );
};

export default LFGPartyChat;