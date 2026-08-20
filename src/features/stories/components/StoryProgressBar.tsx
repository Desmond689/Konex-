/**
 * KONEX StoryProgressBar Component
 * Billion Dollar Code - Production Ready
 * 
 * A progress bar for story viewing
 * 
 * Usage:
 * <StoryProgressBar
 *   progress={0.5}
 *   duration={5000}
 *   onComplete={handleComplete}
 * />
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface StoryProgressBarProps {
  /** Progress value (0-1) */
  progress?: number;
  /** Total duration in milliseconds */
  duration?: number;
  /** Is the story paused */
  isPaused?: boolean;
  /** On complete handler */
  onComplete?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const StoryProgressBar: React.FC<StoryProgressBarProps> = ({
  progress: externalProgress,
  duration = 5000,
  isPaused = false,
  onComplete,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isInternalProgress, setIsInternalProgress] = useState(externalProgress === undefined);
  const progressAnim = useRef(new Animated.Value(externalProgress ?? 0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const containerStyle: ViewStyle = {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
    ...style,
  };

  const barStyle: ViewStyle = {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  };

  useEffect(() => {
    if (externalProgress !== undefined) {
      setIsInternalProgress(false);
      progressAnim.setValue(externalProgress);
      return;
    }

    setIsInternalProgress(true);
    startAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  const startAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    progressAnim.setValue(0);

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });
  };

  React.useEffect(() => {
    if (isPaused) {
      animationRef.current?.stop();
    } else if (progressAnim) {
      startAnimation();
    }
  }, [isPaused]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, style]}>
      <Animated.View style={[styles.fill, { width }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});

export default StoryProgressBar;
