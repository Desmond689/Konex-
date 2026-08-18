/**
 * KONEX SaveButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Save/Bookmark button with count
 * 
 * Usage:
 * <SaveButton
 *   isSaved={isSaved}
 *   count={savesCount}
 *   onPress={handleSave}
 * />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Icon from '../../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface SaveButtonProps {
  /** Is saved by the current user */
  isSaved: boolean;
  /** Number of saves */
  count: number;
  /** On press handler */
  onPress: () => void;
  /** Size of the icon */
  size?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SaveButton: React.FC<SaveButtonProps> = ({
  isSaved,
  count,
  onPress,
  size = 22,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...style,
  };

  const countStyle: TextStyle = {
    fontSize: 14,
    color: isSaved ? colors.primary : colors.textMuted,
    marginLeft: 4,
    fontWeight: isSaved ? '600' : '400',
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <Icon
        name={isSaved ? 'bookmark' : 'bookmark'}
        size={size}
        color={isSaved ? colors.primary : colors.textMuted}
      />
      {count > 0 && <Text style={countStyle}>{count}</Text>}
    </TouchableOpacity>
  );
};

export default SaveButton;