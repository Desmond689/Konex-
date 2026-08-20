/**
 * KONEX Divider Component
 * Billion Dollar Code - Production Ready
 * 
 * A horizontal or vertical divider line
 * 
 * Usage:
 * <Divider />
 * <Divider orientation="vertical" height={40} />
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Thickness of the divider */
  thickness?: number;
  /** Color of the divider */
  color?: string;
  /** Margin around the divider */
  margin?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  margin = 0,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const dividerColor = color || colors.border;

  const dividerStyle: ViewStyle = {
    backgroundColor: dividerColor,
    ...(orientation === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          marginVertical: margin,
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: margin,
        }),
    ...style,
  };

  return <View style={dividerStyle} testID={testID} />;
};

export default Divider;