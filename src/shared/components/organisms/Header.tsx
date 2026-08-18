/**
 * KONEX Header Component
 * Billion Dollar Code - Production Ready
 * 
 * App header with navigation, title, and actions
 * 
 * Usage:
 * <Header
 *   title="Home"
 *   leftIcon="menu"
 *   onLeftPress={() => {}}
 *   rightIcon="search"
 *   onRightPress={() => {}}
 * />
 */

import React from 'react';
import {
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import Text from '../atoms/Text';

// ============================================
// 1. TYPES
// ============================================

export interface HeaderProps {
  /** Header title */
  title?: string;
  /** Left icon name */
  leftIcon?: string;
  /** On left press handler */
  onLeftPress?: () => void;
  /** Right icon name */
  rightIcon?: string;
  /** On right press handler */
  onRightPress?: () => void;
  /** Additional right icons */
  rightIcons?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
  }>;
  /** Show back button */
  showBack?: boolean;
  /** On back press handler */
  onBackPress?: () => void;
  /** Show avatar instead of left icon */
  showAvatar?: boolean;
  /** Avatar source */
  avatarSource?: { uri: string } | number;
  /** Avatar name for initials */
  avatarName?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightIcons = [],
  showBack = false,
  onBackPress,
  showAvatar = false,
  avatarSource,
  avatarName,
  containerStyle,
  titleStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyleCombined: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
    ...containerStyle,
  };

  const titleTextStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    ...titleStyle,
  };

  const leftContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    width: 44,
  };

  const rightContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  };

  const iconButtonStyle: ViewStyle = {
    padding: 4,
    position: 'relative',
  };

  const badgeStyle: ViewStyle = {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  };

  const badgeTextStyle: TextStyle = {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    }
  };

  const renderLeft = () => {
    if (showBack) {
      return (
        <TouchableOpacity onPress={handleBack} style={leftContainerStyle}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (showAvatar && avatarSource) {
      return (
        <TouchableOpacity onPress={onLeftPress} style={leftContainerStyle}>
          <Avatar source={avatarSource} name={avatarName} size="sm" />
        </TouchableOpacity>
      );
    }

    if (leftIcon) {
      return (
        <TouchableOpacity onPress={onLeftPress} style={leftContainerStyle}>
          <Icon name={leftIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return <View style={leftContainerStyle} />;
  };

  const renderRight = () => {
    const icons = [];

    if (rightIcon) {
      icons.push(
        <TouchableOpacity
          key="right-icon"
          onPress={onRightPress}
          style={iconButtonStyle}
        >
          <Icon name={rightIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    rightIcons.forEach((item, index) => {
      icons.push(
        <TouchableOpacity
          key={`right-icon-${index}`}
          onPress={item.onPress}
          style={iconButtonStyle}
        >
          <Icon name={item.icon} size={24} color={colors.text} />
          {item.badge && item.badge > 0 && (
            <View style={badgeStyle}>
              <Text style={badgeTextStyle}>
                {item.badge > 99 ? '99+' : item.badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return <View style={rightContainerStyle}>{icons}</View>;
  };

  return (
    <View style={containerStyleCombined} testID={testID}>
      {renderLeft()}
      <Text style={titleTextStyle} numberOfLines={1}>
        {title}
      </Text>
      {renderRight()}
    </View>
  );
};

export default Header;