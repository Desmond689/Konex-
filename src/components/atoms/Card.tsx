/**
 * KONEX Card Component
 * Billion Dollar Code - Production Ready
 * 
 * A container component with elevation and rounded corners
 * 
 * Usage:
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type CardElevation = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Elevation level */
  elevation?: CardElevation;
  /** Border radius */
  borderRadius?: number;
  /** Background color */
  backgroundColor?: string;
  /** Padding inside the card */
  padding?: number;
  /** On press handler (makes card touchable) */
  onPress?: () => void;
  /** Disable touch feedback */
  disabled?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. ELEVATION MAPPING
// ============================================

const ELEVATION_MAP: Record<CardElevation, { shadow: any; elevation: number }> = {
  none: { 
    shadow: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
    elevation: 0 
  },
  xs: { 
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    elevation: 1 
  },
  sm: { 
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    elevation: 2 
  },
  md: { 
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    elevation: 4 
  },
  lg: { 
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
    elevation: 8 
  },
  xl: { 
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 32 },
    elevation: 16 
  },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'md',
  borderRadius = 12,
  backgroundColor,
  padding = 16,
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const elevationStyle = ELEVATION_MAP[elevation];

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColor || colors.surface,
    borderRadius,
    padding,
    ...elevationStyle.shadow,
    elevation: elevationStyle.elevation,
    overflow: 'visible',
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

export default Card;