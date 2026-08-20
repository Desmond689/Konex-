/**
 * KONEX Icon Component
 * Billion Dollar Code - Production Ready
 * 
 * A flexible icon component supporting multiple icon sets
 * 
 * Usage:
 * <Icon name="heart" size={24} color="red" />
 */

import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type IconFamily = 'feather' | 'ionicons' | 'material' | 'antdesign' | 'fontawesome';

export interface IconProps {
  /** Icon name from the selected family */
  name: string;
  /** Size of the icon */
  size?: number;
  /** Color of the icon */
  color?: string;
  /** Icon family */
  family?: IconFamily;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  family = 'feather',
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const iconColor = color || colors.text;

  const renderIcon = () => {
    const props = {
      name,
      size,
      color: iconColor,
      testID,
    };

    const iconProps: any = props;

    switch (family) {
      case 'ionicons':
        return <Ionicons {...iconProps} />;
      case 'material':
        return <MaterialIcons {...iconProps} />;
      case 'antdesign':
        return <AntDesign {...iconProps} />;
      case 'fontawesome':
        return <FontAwesome {...iconProps} />;
      case 'feather':
      default:
        return <Feather {...iconProps} />;
    }
  };

  return <View style={style}>{renderIcon()}</View>;
};

export default Icon;