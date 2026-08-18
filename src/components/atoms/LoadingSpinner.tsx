/**
 * KONEX LoadingSpinner Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable loading spinner with overlay support
 * 
 * Usage:
 * <LoadingSpinner size="large" color="primary" />
 * <LoadingSpinner overlay={true} />
 */

import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface LoadingSpinnerProps extends ActivityIndicatorProps {
  /** Show overlay background */
  overlay?: boolean;
  /** Overlay background color */
  overlayColor?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  overlay = false,
  overlayColor,
  containerStyle,
  size = 'large',
  color,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const spinnerColor = color || colors.primary;

  const containerStyleCombined: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...containerStyle,
  };

  const overlayStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: overlayColor || 'rgba(0,0,0,0.3)',
    zIndex: 999,
  };

  const spinnerElement = (
    <ActivityIndicator
      size={size}
      color={spinnerColor}
      testID={testID}
      {...props}
    />
  );

  if (overlay) {
    return (
      <View style={[overlayStyle, containerStyle]}>
        {spinnerElement}
      </View>
    );
  }

  return <View style={containerStyleCombined}>{spinnerElement}</View>;
};

export default LoadingSpinner;