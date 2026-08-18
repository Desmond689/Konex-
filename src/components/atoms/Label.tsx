/**
 * KONEX Label Component
 * Billion Dollar Code - Production Ready
 * 
 * A simple label component for form fields
 * 
 * Usage:
 * <Label text="Username" required={true} />
 */

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface LabelProps {
  /** Label text */
  text: string;
  /** Show required asterisk */
  required?: boolean;
  /** Color of the label */
  color?: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  /** Custom style */
  style?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Label: React.FC<LabelProps> = ({
  text,
  required = false,
  color,
  fontSize = 14,
  fontWeight = '500',
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const labelColor = color || colors.text;

  const labelStyle: TextStyle = {
    fontSize,
    fontWeight,
    color: labelColor,
    marginBottom: 4,
    ...style,
  };

  return (
    <Text style={labelStyle} testID={testID}>
      {text}
      {required && (
        <Text style={{ color: colors.error }}> *</Text>
      )}
    </Text>
  );
};

export default Label;