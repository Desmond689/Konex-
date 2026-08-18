/**
 * KONEX LikeButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Animated like button with count
 * 
 * Usage:
 * <LikeButton
 *   isLiked={isLiked}
 *   count={likesCount}
 *   onPress={handleLike}
 * />
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Icon from '../../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface LikeButtonProps {
  /** Is liked by the current user */
  isLiked: boolean;
  /** Number of likes */
  count: number;
  /** On press handler */
  onPress: () => void;
  /** Size of the icon */
  size?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  count,
  onPress,
  size = 22,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLiked) {
      // Animate like
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.4,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate count
      Animated.spring(countAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [isLiked]);

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...style,
  };

  const countStyle: TextStyle = {
    fontSize: 14,
    color: isLiked ? colors.error : colors.textMuted,
    marginLeft: 4,
    fontWeight: isLiked ? '600' : '400',
    ...textStyle,
  };

  const iconColor = isLiked ? colors.error : colors.textMuted;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon
          name={isLiked ? 'heart' : 'heart'}
          size={size}
          color={iconColor}
        />
      </Animated.View>
      {count > 0 && (
        <Animated.Text
          style={[
            countStyle,
            {
              transform: [
                {
                  scale: countAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {count}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};

export default LikeButton;