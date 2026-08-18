/**
 * KONEX AuthHeader Component
 * Billion Dollar Code - Production Ready
 * 
 * Header component for auth screens
 * 
 * Usage:
 * <AuthHeader title="Welcome Back" subtitle="Sign in to continue" />
 */

import React from 'react';
import {
    Image,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface AuthHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Logo source */
  logo?: any;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Custom subtitle style */
  subtitleStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  logo,
  style,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    marginBottom: 32,
    ...style,
  };

  const logoStyle: ViewStyle = {
    width: 80,
    height: 80,
    marginBottom: 16,
  };

  const titleStyleCombined: TextStyle = {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    ...titleStyle,
  };

  const subtitleStyleCombined: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    ...subtitleStyle,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {logo && (
        <Image source={logo} style={logoStyle} resizeMode="contain" />
      )}
      <Text style={titleStyleCombined}>{title}</Text>
      {subtitle && <Text style={subtitleStyleCombined}>{subtitle}</Text>}
    </View>
  );
};

export default AuthHeader;