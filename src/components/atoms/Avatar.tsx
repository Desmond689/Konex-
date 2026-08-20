import React from 'react';
import {
  Image, ImageSourcePropType, ImageStyle, StyleSheet, Text, View, ViewStyle,
} from 'react-native';

export interface AvatarProps {
  uri?: string | null;
  source?: ImageSourcePropType;
  name?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  online?: boolean;
  borderWidth?: number;
  borderColor?: string;
  style?: ViewStyle | ImageStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri, source, name, size = 40, shape = 'circle', online, borderWidth, borderColor, style,
}) => {
  const sizeMap: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };
  const numericSize = typeof size === 'string' ? sizeMap[size] || 40 : size;
  const borderRadius = shape === 'circle' ? numericSize / 2 : shape === 'rounded' ? 8 : 0;
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const imageSource = source || (uri ? { uri } : undefined);
  const baseStyle = {
    width: numericSize, height: numericSize, borderRadius, borderWidth, borderColor,
  };
  return (
    <View style={{ position: 'relative' }}>
      {imageSource ? (
        <Image source={imageSource} style={[baseStyle, style] as any} />
      ) : (
        <View style={[styles.fallback, baseStyle, style as ViewStyle]}>
          <Text style={[styles.initials, { fontSize: numericSize * 0.4 }]}>{initials}</Text>
        </View>
      )}
      {online && (
        <View
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: numericSize * 0.28, height: numericSize * 0.28,
            borderRadius: numericSize * 0.14, backgroundColor: '#22C55E',
            borderWidth: 2, borderColor: '#fff',
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});

export default Avatar;
