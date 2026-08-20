/**
 * KONEX ProgressBar Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable progress bar
 * 
 * Usage:
 * <ProgressBar progress={0.75} />
 */

import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface ProgressBarProps {
  /** Progress value (0-1) */
  progress: number;
  /** Height of the progress bar */
  height?: number;
  /** Color of the progress */
  progressColor?: string;
  /** Background color of the progress bar */
  backgroundColor?: string;
  /** Show percentage text */
  showPercentage?: boolean;
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

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  progressColor,
  backgroundColor,
  showPercentage = false,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  const barColor = progressColor || colors.primary;
  const bgColor = backgroundColor || colors.surfaceSecondary;

  const containerStyle: ViewStyle = {
    width: '100%',
    backgroundColor: bgColor,
    borderRadius: height / 2,
    overflow: 'hidden',
    ...style,
  };

  const progressStyle: ViewStyle = {
    width: `${percentage}%`,
    height,
    backgroundColor: barColor,
    borderRadius: height / 2,
  };

  const textStyleCombined: TextStyle = {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    ...textStyle,
  };

  return (
    <View>
      <View style={containerStyle} testID={testID}>
        <View style={progressStyle} />
      </View>
      {showPercentage && <Text style={textStyleCombined}>{percentage}%</Text>}
    </View>
  );
};

export default ProgressBar;