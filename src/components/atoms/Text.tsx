/**
 * KONEX Text Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable text component with variants
 * 
 * Usage:
 * <Text variant="heading1" color="primary">Hello World</Text>
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'body' 
  | 'bodyBold' 
  | 'bodySmall' 
  | 'bodySmallBold' 
  | 'caption' 
  | 'captionBold' 
  | 'overline';

export interface TextProps extends RNTextProps {
  /** Text variant */
  variant?: TextVariant;
  /** Text color */
  color?: string;
  /** Text alignment */
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  /** Number of lines to display */
  numberOfLines?: number;
  /** Custom style */
  style?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
  children,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const typography = theme.typography;

  const variantStyles = typography[variant as keyof typeof typography] || typography.body;
  const textColor = color || variantStyles.color || theme.colors.text;

  const textStyle: TextStyle = {
    ...variantStyles,
    color: textColor,
    textAlign: align,
    ...style,
  };

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      testID={testID}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;