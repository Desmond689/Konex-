/**
 * KONEX Input Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable text input component with validation states
 * 
 * Usage:
 * <Input
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Invalid email"
 * />
 */

import React, { useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export interface InputProps extends TextInputProps {
  /** Label text */
  label?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
  /** Left icon name */
  leftIcon?: string;
  /** Right icon name */
  rightIcon?: string;
  /** On right icon press */
  onRightIconPress?: () => void;
  /** Show password toggle */
  secureTextEntry?: boolean;
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

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  containerStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  style,
  onFocus,
  onBlur,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const typography = theme.typography;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(!secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  const hasError = !!error;
  const isPasswordField = secureTextEntry;
  const showRightIcon = rightIcon || isPasswordField;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: 8,
    backgroundColor: hasError ? colors.error + '10' : colors.surface,
    paddingHorizontal: 12,
    minHeight: 48,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
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

  return (
    <View style={containerStyleCombined}>
      {label && <Text style={labelStyleCombined}>{label}</Text>}
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={{ marginRight: 10 }}>
            <Icon name={leftIcon} size={20} color={colors.textMuted} />
          </View>
        )}
        <TextInput
          ref={inputRef}
          style={inputStyle}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPasswordField && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          {...props}
        />
        {showRightIcon && (
          <TouchableOpacity
            onPress={isPasswordField ? togglePasswordVisibility : onRightIconPress}
            style={{ marginLeft: 8 }}
          >
            {isPasswordField ? (
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textMuted}
              />
            ) : (
              <Icon name={rightIcon!} size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={errorStyleCombined}>{error}</Text>}
      {helper && !hasError && <Text style={helperStyleCombined}>{helper}</Text>}
    </View>
  );
};

export default Input;