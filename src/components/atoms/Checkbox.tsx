/**
 * KONEX Checkbox Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable checkbox component
 * 
 * Usage:
 * <Checkbox checked={checked} onPress={() => setChecked(!checked)} />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export interface CheckboxProps {
  /** Is the checkbox checked */
  checked: boolean;
  /** On press handler */
  onPress: () => void;
  /** Label text */
  label?: string;
  /** Disable the checkbox */
  disabled?: boolean;
  /** Size of the checkbox */
  size?: number;
  /** Color when checked */
  checkedColor?: string;
  /** Color when unchecked */
  uncheckedColor?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  labelStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 24,
  checkedColor,
  uncheckedColor,
  style,
  labelStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const boxColor = checked 
    ? checkedColor || colors.primary 
    : uncheckedColor || colors.border;

  const boxStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: boxColor,
    backgroundColor: checked ? boxColor : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...style,
  };

  const labelTextStyle: TextStyle = {
    marginLeft: 10,
    fontSize: 16,
    color: disabled ? colors.textMuted : colors.text,
    ...labelStyle,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled}
      testID={testID}
    >
      <View style={boxStyle}>
        {checked && (
          <Icon 
            name="check" 
            size={size * 0.6} 
            color="#FFFFFF" 
          />
        )}
      </View>
      {label && <Text style={labelTextStyle}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Checkbox;