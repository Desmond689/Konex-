/**
 * KONEX Switch Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable toggle switch
 * 
 * Usage:
 * <Switch value={enabled} onValueChange={setEnabled} />
 */

import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SwitchProps extends RNSwitchProps {
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const defaultTrackColor = {
    false: colors.surfaceTertiary,
    true: colors.primary,
  };

  const defaultThumbColor = colors.surface;

  return (
    <RNSwitch
      value={value}
      onValueChange={disabled ? undefined : onValueChange}
      disabled={disabled}
      trackColor={trackColor || defaultTrackColor}
      thumbColor={thumbColor || defaultThumbColor}
      testID={testID}
      {...props}
    />
  );
};

export default Switch;