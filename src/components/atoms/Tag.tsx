/**
 * KONEX Tag Component
 * Billion Dollar Code - Production Ready
 * 
 * A small tag/label for categorization
 * 
 * Usage:
 * <Tag label="Gaming" variant="primary" />
 */

import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type TagVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface TagProps {
  /** Tag label text */
  label: string;
  /** Visual variant */
  variant?: TagVariant;
  /** Size of the tag */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. VARIANT MAPPING
// ============================================

const VARIANT_COLORS: Record<TagVariant, { bg: string; text: string }> = {
  primary: { bg: 'primarySurface', text: 'primary' },
  secondary: { bg: 'secondary', text: 'white' },
  success: { bg: 'success', text: 'white' },
  warning: { bg: 'warning', text: 'white' },
  error: { bg: 'error', text: 'white' },
  neutral: { bg: 'surfaceSecondary', text: 'textSecondary' },
  info: { bg: 'primarySurface', text: 'primary' },
};

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg', { padding: number; fontSize: number }> = {
  xs: { padding: 2, fontSize: 9 },
  sm: { padding: 4, fontSize: 10 },
  md: { padding: 6, fontSize: 12 },
  lg: { padding: 8, fontSize: 14 },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const variantColors = VARIANT_COLORS[variant];
  const sizeMap = SIZE_MAP[size];

  const tagStyle: ViewStyle = {
    backgroundColor: colors[variantColors.bg as keyof typeof colors] as string,
    paddingHorizontal: sizeMap.padding,
    paddingVertical: sizeMap.padding / 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    ...style,
  };

  const tagTextStyle: TextStyle = {
    fontSize: sizeMap.fontSize,
    fontWeight: '500',
    color: colors[variantColors.text as keyof typeof colors] as string,
    ...textStyle,
  };

  return (
    <View style={tagStyle} testID={testID}>
      <Text style={tagTextStyle}>{label}</Text>
    </View>
  );
};

export default Tag;