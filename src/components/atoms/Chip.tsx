/**
 * KONEX Chip Component
 * Billion Dollar Code - Production Ready
 * 
 * Compact element for displaying tags, filters, or selections
 * 
 * Usage:
 * <Chip label="Gaming" selected={true} onPress={() => {}} />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

export interface ChipProps {
  /** Chip label text */
  label: string;
  /** Is the chip selected */
  selected?: boolean;
  /** Visual variant */
  variant?: ChipVariant;
  /** On press handler */
  onPress?: () => void;
  /** On close/delete handler */
  onClose?: () => void;
  /** Disable the chip */
  disabled?: boolean;
  /** Show as outlined */
  outlined?: boolean;
  /** Size of the chip */
  size?: 'sm' | 'md' | 'lg';
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

const VARIANT_COLORS: Record<ChipVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: 'primarySurface', text: 'primary', border: 'primary' },
  secondary: { bg: 'secondary', text: 'white', border: 'secondary' },
  success: { bg: 'success', text: 'white', border: 'success' },
  warning: { bg: 'warning', text: 'white', border: 'warning' },
  error: { bg: 'error', text: 'white', border: 'error' },
  neutral: { bg: 'surfaceSecondary', text: 'textSecondary', border: 'border' },
};

const SIZE_MAP: Record<'sm' | 'md' | 'lg', { padding: number; fontSize: number; height: number }> = {
  sm: { padding: 6, fontSize: 11, height: 24 },
  md: { padding: 8, fontSize: 13, height: 32 },
  lg: { padding: 10, fontSize: 15, height: 40 },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  variant = 'neutral',
  onPress,
  onClose,
  disabled = false,
  outlined = false,
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const variantColors = VARIANT_COLORS[variant];
  const sizeMap = SIZE_MAP[size];

  const isSelected = selected && !disabled;

  const getBackgroundColor = () => {
    if (disabled) return colors.disabled;
    if (isSelected) return colors[variantColors.bg as keyof typeof colors] as string;
    if (outlined) return 'transparent';
    return colors.surfaceSecondary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (isSelected) return colors[variantColors.text as keyof typeof colors] as string;
    return colors.text;
  };

  const getBorderColor = () => {
    if (disabled) return colors.disabled;
    if (isSelected) return colors[variantColors.border as keyof typeof colors] as string;
    return colors.border;
  };

  const chipStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizeMap.padding,
    paddingVertical: sizeMap.padding / 2,
    borderRadius: 16,
    backgroundColor: getBackgroundColor(),
    borderWidth: outlined ? 1 : 0,
    borderColor: getBorderColor(),
    height: sizeMap.height,
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeMap.fontSize,
    fontWeight: '500',
    color: getTextColor(),
    ...textStyle,
  };

  const chipContent = (
    <>
      <Text style={labelStyle} numberOfLines={1}>
        {label}
      </Text>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          disabled={disabled}
          style={{ marginLeft: 4 }}
        >
          <Icon 
            name="x" 
            size={sizeMap.fontSize + 2} 
            color={getTextColor()} 
          />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={chipStyle}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
        disabled={disabled}
        testID={testID}
      >
        {chipContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={chipStyle} testID={testID}>
      {chipContent}
    </View>
  );
};

export default Chip;