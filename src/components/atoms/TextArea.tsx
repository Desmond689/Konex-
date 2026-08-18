/**
 * KONEX TextArea Component
 * Billion Dollar Code - Production Ready
 * 
 * A multi-line text input component
 * 
 * Usage:
 * <TextArea
 *   placeholder="Enter your bio"
 *   value={bio}
 *   onChangeText={setBio}
 *   maxLength={160}
 * />
 */

import React, { useState } from 'react';
import {
    NativeSyntheticEvent,
    Text,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface TextAreaProps extends TextInputProps {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
  /** Maximum number of characters */
  maxLength?: number;
  /** Number of lines */
  numberOfLines?: number;
  /** Show character count */
  showCharCount?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Custom error style */
  errorStyle?: TextStyle;
  /** Custom helper style */
  helperStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helper,
  maxLength,
  numberOfLines = 4,
  showCharCount = false,
  containerStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  style,
  onFocus,
  onBlur,
  onChangeText,
  value,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(value?.length || 0);

  const hasError = !!error;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setCharCount(text.length);
    onChangeText?.(text);
  };

  const getBorderColor = () => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const containerStyleCombined: ViewStyle = {
    marginBottom: 16,
    ...containerStyle,
  };

  const labelStyleCombined: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: hasError ? colors.error : colors.text,
    marginBottom: 6,
    ...labelStyle,
  };

  const inputContainerStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: 8,
    backgroundColor: hasError ? colors.error + '10' : colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 100,
  };

  const inputStyle: TextStyle = {
    fontSize: 16,
    color: colors.text,
    padding: 0,
    minHeight: 80,
    textAlignVertical: 'top',
    ...(style as TextStyle),
  };

  const errorStyleCombined: TextStyle = {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    ...errorStyle,
  };

  const helperStyleCombined: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    ...helperStyle,
  };

  const charCountStyle: TextStyle = {
    fontSize: 12,
    color: (charCount || 0) >= (maxLength || 0) ? colors.error : colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  };

  return (
    <View style={containerStyleCombined}>
      {label && <Text style={labelStyleCombined}>{label}</Text>}
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyle}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          value={value}
          maxLength={maxLength}
          testID={testID}
          {...props}
        />
      </View>
      {hasError && <Text style={errorStyleCombined}>{error}</Text>}
      {helper && !hasError && <Text style={helperStyleCombined}>{helper}</Text>}
      {showCharCount && maxLength && (
        <Text style={charCountStyle}>
          {charCount || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

export default TextArea;