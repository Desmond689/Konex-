/**
 * KONEX Button Component
 * Billion Dollar Code - Production Ready
 * 
 * A versatile button component with multiple variants and sizes
 * 
 * Usage:
 * <Button title="Click Me" onPress={() => {}} variant="primary" />
 * <Button title="Loading" loading={true} />
 */

import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success' 
  | 'warning'
  | 'info'
  | 'dark'
  | 'light';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends TouchableOpacityProps {
  /** Button text */
  title: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading state */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon component to display before title */
  leftIcon?: React.ReactNode;
  /** Icon component to display after title */
  rightIcon?: React.ReactNode;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. SIZE MAPPING
// ============================================

const SIZE_MAP: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; height: number }> = {
  xs: { paddingVertical: 4, paddingHorizontal: 10, fontSize: 11, height: 28 },
  sm: { paddingVertical: 6, paddingHorizontal: 14, fontSize: 13, height: 36 },
  md: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 15, height: 44 },
  lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 17, height: 52 },
  xl: { paddingVertical: 18, paddingHorizontal: 36, fontSize: 19, height: 60 },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const sizeMap = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  // Get variant colors
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return { background: colors.primary, text: '#FFFFFF', border: colors.primary };
      case 'secondary':
        return { background: colors.secondary, text: '#FFFFFF', border: colors.secondary };
      case 'outline':
        return { background: 'transparent', text: colors.primary, border: colors.primary };
      case 'ghost':
        return { background: 'transparent', text: colors.primary, border: 'transparent' };
      case 'danger':
        return { background: colors.error, text: '#FFFFFF', border: colors.error };
      case 'success':
        return { background: colors.success, text: '#FFFFFF', border: colors.success };
      case 'warning':
        return { background: colors.warning, text: '#FFFFFF', border: colors.warning };
      case 'info':
        return { background: colors.info, text: '#FFFFFF', border: colors.info };
      case 'dark':
        return { background: colors.text, text: colors.background, border: colors.text };
      case 'light':
        return { background: colors.surface, text: colors.text, border: colors.border };
      default:
        return { background: colors.primary, text: '#FFFFFF', border: colors.primary };
    }
  };

  const variantColors = getVariantColors();

  const buttonStyle: ViewStyle = {
    backgroundColor: isDisabled ? colors.disabled : variantColors.background,
    paddingVertical: sizeMap.paddingVertical,
    paddingHorizontal: sizeMap.paddingHorizontal,
    borderRadius: 8,
    height: sizeMap.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'outline' || variant === 'ghost' ? 1 : 0,
    borderColor: isDisabled ? colors.disabled : variantColors.border,
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const textStyleCombined: TextStyle = {
    color: isDisabled ? colors.textMuted : variantColors.text,
    fontSize: sizeMap.fontSize,
    fontWeight: '600',
    textAlign: 'center',
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variantColors.text} 
          style={{ marginRight: 8 }}
        />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text style={textStyleCombined} numberOfLines={1}>
            {title}
          </Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;