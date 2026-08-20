/**
 * KONEX Toast Component
 * Billion Dollar Code - Production Ready
 * 
 * A toast notification component
 * 
 * Usage:
 * <Toast message="Success!" type="success" visible={true} />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Is the toast visible */
  visible?: boolean;
  /** Duration in milliseconds */
  duration?: number;
  /** Position on screen */
  position?: 'top' | 'bottom';
  /** On hide callback */
  onHide?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. VARIANT MAPPING
// ============================================

const TYPE_COLORS: Record<ToastType, { bg: string; icon: string; color: string }> = {
  success: { bg: 'success', icon: 'check-circle', color: '#FFFFFF' },
  error: { bg: 'error', icon: 'alert-circle', color: '#FFFFFF' },
  warning: { bg: 'warning', icon: 'alert-triangle', color: '#FFFFFF' },
  info: { bg: 'info', icon: 'info', color: '#FFFFFF' },
};

// ============================================
// 3. COMPONENT
// ============================================

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible = false,
  duration = 3000,
  position = 'bottom',
  onHide,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const typeColors = TYPE_COLORS[type];
  const bgColor = colors[typeColors.bg as keyof typeof colors] as string;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const containerStyle: ViewStyle = {
    position: 'absolute',
    left: 20,
    right: 20,
    [position]: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: bgColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
    ...style,
  };

  const messageStyle: TextStyle = {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: typeColors.color,
    ...textStyle,
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      testID={testID}
    >
      <Icon name={typeColors.icon} size={24} color={typeColors.color} />
      <Text style={messageStyle}>{message}</Text>
    </Animated.View>
  );
};

export default Toast;