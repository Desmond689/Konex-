/**
 * KONEX SocialLogin Component
 * Billion Dollar Code - Production Ready
 * 
 * Social login buttons for auth screens
 * 
 * Usage:
 * <SocialLogin
 *   onGooglePress={handleGoogleLogin}
 *   onApplePress={handleAppleLogin}
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
import Icon from '../../../components/atoms/Icon';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SocialLoginProps {
  /** On Google press handler */
  onGooglePress?: () => void;
  /** On Apple press handler */
  onApplePress?: () => void;
  /** On Discord press handler */
  onDiscordPress?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Show divider */
  showDivider?: boolean;
  /** Divider text */
  dividerText?: string;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onGooglePress,
  onApplePress,
  onDiscordPress,
  style,
  showDivider = true,
  dividerText = 'Or continue with',
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const containerStyle: ViewStyle = {
    ...style,
  };

  const dividerContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  };

  const dividerLineStyle: ViewStyle = {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  };

  const dividerTextStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: 12,
  };

  const buttonContainerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  };

  const buttonStyle: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  };

  const socialButtons = [
    { id: 'google', icon: 'google', onPress: onGooglePress, color: '#DB4437' },
    { id: 'apple', icon: 'apple', onPress: onApplePress, color: '#000000' },
    { id: 'discord', icon: 'discord', onPress: onDiscordPress, color: '#5865F2' },
  ].filter((btn) => btn.onPress);

  if (socialButtons.length === 0) return null;

  return (
    <View style={containerStyle} testID={testID}>
      {showDivider && (
        <View style={dividerContainerStyle}>
          <View style={dividerLineStyle} />
          <Text style={dividerTextStyle}>{dividerText}</Text>
          <View style={dividerLineStyle} />
        </View>
      )}

      <View style={buttonContainerStyle}>
        {socialButtons.map((btn) => (
          <TouchableOpacity
            key={btn.id}
            style={buttonStyle}
            onPress={btn.onPress}
            activeOpacity={0.7}
          >
            <Icon name={btn.icon} size={22} color={btn.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SocialLogin;