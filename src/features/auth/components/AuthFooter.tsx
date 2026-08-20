/**
 * AuthFooter - flexible props for all auth screens
 */
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';

export interface AuthFooterProps {
  title?: string;
  subtitle?: string;
  text?: string;
  linkText?: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  [key: string]: any;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  title,
  subtitle,
  text,
  linkText,
  onPress,
  style,
  children,
}) => {
  const line = text || title || '';
  const link = linkText || subtitle || '';
  return (
    <View style={[{ alignItems: 'center', paddingVertical: 16 }, style]}>
      {children}
      {(line || link) ? (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            {line}
            {line && link ? ' ' : ''}
            {link ? (
              <Text style={{ color: '#7C3AED', fontWeight: '600' }}>{link}</Text>
            ) : null}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default AuthFooter;
