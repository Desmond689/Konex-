/**
 * KONEX ListItem Component
 * Billion Dollar Code - Production Ready
 * 
 * A list item with icon, title, subtitle, and action
 * 
 * Usage:
 * <ListItem
 *   title="Profile"
 *   subtitle="Edit your profile"
 *   leftIcon="user"
 *   rightIcon="chevron-right"
 *   onPress={() => {}}
 * />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface ListItemProps {
  /** Title text */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Left icon name or avatar image */
  leftIcon?: string;
  /** Left avatar image source */
  avatarSource?: { uri: string };
  /** Right icon name */
  rightIcon?: string;
  /** On press handler */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show divider */
  showDivider?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Custom subtitle style */
  subtitleStyle?: TextStyle;
  /** Custom left icon style */
  leftIconStyle?: ViewStyle;
  /** Custom right icon style */
  rightIconStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  avatarSource,
  rightIcon,
  onPress,
  disabled = false,
  showDivider = false,
  style,
  titleStyle,
  subtitleStyle,
  leftIconStyle,
  rightIconStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: showDivider ? 1 : 0,
    borderBottomColor: colors.border,
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const leftIconStyleCombined: ViewStyle = {
    marginRight: 14,
    ...leftIconStyle,
  };

  const rightIconStyleCombined: ViewStyle = {
    marginLeft: 14,
    ...rightIconStyle,
  };

  const textContainerStyle: ViewStyle = {
    flex: 1,
  };

  const titleStyleCombined: TextStyle = {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    ...titleStyle,
  };

  const subtitleStyleCombined: TextStyle = {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    ...subtitleStyle,
  };

  const content = (
    <>
      {leftIcon ? (
        <View style={leftIconStyleCombined}>
          <Icon name={leftIcon} size={24} color={colors.textSecondary} />
        </View>
      ) : avatarSource ? (
        <View style={leftIconStyleCombined}>
          <Avatar source={avatarSource} size="sm" />
        </View>
      ) : null}

      <View style={textContainerStyle}>
        <Text style={titleStyleCombined}>{title}</Text>
        {subtitle && <Text style={subtitleStyleCombined}>{subtitle}</Text>}
      </View>

      {rightIcon && (
        <View style={rightIconStyleCombined}>
          <Icon name={rightIcon} size={20} color={colors.textMuted} />
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
        disabled={disabled}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
};

export default ListItem;