/**
 * KONEX RadioButton Component
 * Billion Dollar Code - Production Ready
 * 
 * A radio button component for selecting one option from a group
 * 
 * Usage:
 * <RadioButton
 *   selected={selected === 'option1'}
 *   onPress={() => setSelected('option1')}
 *   label="Option 1"
 * />
 */

import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface RadioButtonProps {
  /** Is the radio button selected */
  selected: boolean;
  /** On press handler */
  onPress: () => void;
  /** Label text */
  label?: string;
  /** Disable the radio button */
  disabled?: boolean;
  /** Size of the radio button */
  size?: number;
  /** Color when selected */
  selectedColor?: string;
  /** Color when not selected */
  unselectedColor?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onPress,
  label,
  disabled = false,
  size = 24,
  selectedColor,
  unselectedColor,
  style,
  labelStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const radioColor = selected 
    ? selectedColor || colors.primary 
    : unselectedColor || colors.border;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const radioStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: radioColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  };

  const innerRadioStyle: ViewStyle = {
    width: size / 2,
    height: size / 2,
    borderRadius: size / 4,
    backgroundColor: selected ? radioColor : 'transparent',
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
      <View style={radioStyle}>
        <View style={innerRadioStyle} />
      </View>
      {label && <Text style={labelTextStyle}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default RadioButton;