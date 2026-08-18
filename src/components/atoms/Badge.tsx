/**
 * KONEX Badge Component
 * Billion Dollar Code - Production Ready
 * 
 * Displays a small badge for counts, status, or labels
 * 
 * Usage:
 * <Badge count={5} variant="primary" />
 * <Badge label="NEW" variant="success" />
 */

import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Count to display (automatically formats to 99+) */
  count?: number;
  /** Label to display */
  label?: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Show as dot only */
  dot?: boolean;
  /** Maximum count before showing 99+ */
  maxCount?: number;
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

const VARIANT_COLORS: Record<BadgeVariant, { background: string; text: string }> = {
  primary: { background: 'primary', text: 'white' },
  secondary: { background: 'secondary', text: 'white' },
  success: { background: 'success', text: 'white' },
  warning: { background: 'warning', text: 'white' },
  error: { background: 'error', text: 'white' },
  info: { background: 'info', text: 'white' },
  neutral: { background: 'neutral', text: 'white' },
};

const SIZE_MAP: Record<BadgeSize, { padding: number; fontSize: number; minWidth: number }> = {
  xs: { padding: 4, fontSize: 10, minWidth: 16 },
  sm: { padding: 6, fontSize: 11, minWidth: 20 },
  md: { padding: 8, fontSize: 12, minWidth: 24 },
  lg: { padding: 10, fontSize: 14, minWidth: 28 },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Badge: React.FC<BadgeProps> = ({
  count,
  label,
  variant = 'primary',
  size = 'md',
  dot = false,
  maxCount = 99,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const variantColors = VARIANT_COLORS[variant];
  const sizeMap = SIZE_MAP[size];

  // Determine display text
  let displayText: string = label || '';
  if (count !== undefined) {
    displayText = count > maxCount ? `${maxCount}+` : String(count);
  }

  // Dot mode
  if (dot) {
    return (
      <View
        style={[
          {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors[variantColors.background as keyof typeof colors] as string,
          },
          style,
        ]}
        testID={testID}
      />
    );
  }

  // Don't render if no content
  if (!displayText && !label) {
    return null;
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors[variantColors.background as keyof typeof colors] as string,
          paddingHorizontal: sizeMap.padding,
          paddingVertical: sizeMap.padding / 2,
          borderRadius: 12,
          minWidth: sizeMap.minWidth,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
        },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          {
            color: colors[variantColors.text as keyof typeof colors] as string,
            fontSize: sizeMap.fontSize,
            fontWeight: '600',
            textAlign: 'center',
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayText}
      </Text>
    </View>
  );
};

export default Badge;