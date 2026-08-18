/**
 * KONEX AuthFooter Component
 * Billion Dollar Code - Production Ready
 * 
 * Footer component for auth screens with links
 * 
 * Usage:
 * <AuthFooter
 *   text="Don't have an account?"
 *   linkText="Sign Up"
 *   onLinkPress={() => navigation.navigate('Signup')}
 * />
 */

import React from 'react';
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface AuthFooterProps {
  /** Main text */
  text: string;
  /** Link text */
  linkText: string;
  /** On link press handler */
  onLinkPress: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Custom link style */
  linkStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AuthFooter: React.FC<AuthFooterProps> = ({
  text,
  linkText,
  onLinkPress,
  style,
  textStyle,
  linkStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    ...style,
  };

  const textStyleCombined: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
    ...textStyle,
  };

  const linkStyleCombined: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
    ...linkStyle,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <Text style={textStyleCombined}>{text}</Text>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={linkStyleCombined}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthFooter;