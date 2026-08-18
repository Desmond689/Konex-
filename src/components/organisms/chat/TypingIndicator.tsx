/**
 * KONEX TypingIndicator Component
 * Billion Dollar Code - Production Ready
 * 
 * An animated typing indicator for chat
 * 
 * Usage:
 * <TypingIndicator users={['SniperKing', 'TankMaster']} />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface TypingIndicatorProps {
  /** Users currently typing */
  users?: string[];
  /** Maximum users to display */
  maxDisplay?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users = [],
  maxDisplay = 3,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (users.length === 0) return;

    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            delay: 100,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ];

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [users.length]);

  if (users.length === 0) return null;

  const getTypingText = (): string => {
    const displayUsers = users.slice(0, maxDisplay);
    let text = displayUsers.join(', ');

    if (users.length > maxDisplay) {
      text += ` and ${users.length - maxDisplay} others`;
    }

    return text + (users.length === 1 ? ' is' : ' are') + ' typing...';
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...style,
  };

  const textStyleCombined: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    ...textStyle,
  };

  const dotStyle = (animatedValue: Animated.Value): ViewStyle => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    marginHorizontal: 2,
    opacity: animatedValue,
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
      },
    ],
  });

  return (
    <View style={containerStyle} testID={testID}>
      <Text style={textStyleCombined}>{getTypingText()}</Text>
      <View style={{ flexDirection: 'row', marginLeft: 8 }}>
        <Animated.View style={dotStyle(dot1)} />
        <Animated.View style={dotStyle(dot2)} />
        <Animated.View style={dotStyle(dot3)} />
      </View>
    </View>
  );
};

export default TypingIndicator;