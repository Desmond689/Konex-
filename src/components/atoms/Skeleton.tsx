/**
 * KONEX Skeleton Component
 * Billion Dollar Code - Production Ready
 * 
 * A loading skeleton placeholder for content
 * 
 * Usage:
 * <Skeleton width={200} height={20} borderRadius={4} />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number | string;
  /** Border radius */
  borderRadius?: number;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      colors.surfaceSecondary,
      colors.surfaceTertiary,
      colors.surfaceSecondary,
    ],
  });

  const skeletonStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor,
    ...(style as ViewStyle),
  };

  return <Animated.View style={skeletonStyle} testID={testID} />;
};

export default Skeleton;