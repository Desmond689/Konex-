/**
 * KONEX MessageInput Component
 * Billion Dollar Code - Production Ready
 * 
 * A message input with typing indicator and attachments
 * 
 * Usage:
 * <MessageInput
 *   onSend={handleSend}
 *   onTyping={handleTyping}
 * />
 */

import React, { useRef, useState } from 'react';
import {
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from '../../../components/atoms/Icon';
import { useDebounce } from '../../../hooks/useDebounce';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface MessageInputProps {
  /** On send message handler */
  onSend: (text: string) => void;
  /** On typing handler */
  onTyping?: (isTyping: boolean) => void;
  /** On attachment press handler */
  onAttachmentPress?: () => void;
  /** On game invite press handler */
  onGameInvitePress?: () => void;
  /** Is sending */
  isSending?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom input style */
  inputStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  onAttachmentPress,
  onGameInvitePress,
  isSending = false,
  disabled = false,
  placeholder = 'Type a message...',
  style,
  inputStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const debouncedTyping = useDebounce(
    (typing: boolean) => {
      if (onTyping) {
        onTyping(typing);
      }
    },
    500
  );

  const handleTextChange = (newText: string) => {
    setText(newText);
    debouncedTyping.debouncedCallback(newText.length > 0);
  };

  const handleSend = () => {
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText('');
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onTyping) {
      onTyping(false);
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...style,
  };

  const inputContainerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 44,
  };

  const inputStyleCombined: TextStyle = {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
    maxHeight: 100,
    ...inputStyle,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {onAttachmentPress && (
        <TouchableOpacity
          onPress={onAttachmentPress}
          style={{ marginRight: 8 }}
          disabled={disabled}
        >
          <Icon name="paperclip" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      <View style={inputContainerStyle}>
        <TextInput
          ref={inputRef}
          style={inputStyleCombined}
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled && !isSending}
        />
      </View>

      {onGameInvitePress && (
        <TouchableOpacity
          onPress={onGameInvitePress}
          style={{ marginHorizontal: 4 }}
          disabled={disabled}
        >
          <Icon name="gamepad-2" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || isSending || disabled}
        style={{
          marginLeft: 8,
          padding: 8,
          borderRadius: 24,
          backgroundColor: text.trim() ? colors.primary : colors.disabled,
        }}
      >
        <Icon name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;