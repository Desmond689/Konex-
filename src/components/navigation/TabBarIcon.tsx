/**
 * KONEX TabBarIcon Component
 * Billion Dollar Code - Production Ready
 * 
 * A tab bar icon with badge and focus state support
 * 
 * Usage:
 * <TabBarIcon
 *   name="home"
 *   focused={isFocused}
 *   badge={3}
 * />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface TabBarIconProps {
  /** Icon name */
  name: string;
  /** Is the tab focused */
  focused: boolean;
  /** Icon family */
  family?: 'feather' | 'ionicons' | 'material' | 'antdesign' | 'fontawesome';
  /** Size of the icon */
  size?: number;
  /** Badge count */
  badge?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  family = 'feather',
  size = 24,
  badge,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const iconColor = focused ? colors.primary : colors.textMuted;

  const containerStyle: ViewStyle = {
    position: 'relative',
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Icon
        name={name}
        size={size}
        color={iconColor}
        family={family}
      />
      {badge !== undefined && badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
          }}
        >
          <Badge count={badge} size="xs" variant="error" />
        </View>
      )}
    </View>
  );
};

export default TabBarIcon;