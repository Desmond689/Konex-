// @ts-nocheck
/**
 * KONEX useKeyboard Hook
 * Billion Dollar Code - Production Ready
 * 
 * Tracks keyboard visibility and height
 * 
 * Usage:
 * const { isVisible, height } = useKeyboard();
 */

import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

// ============================================
// 1. TYPES
// ============================================

export interface UseKeyboardReturn {
  /** Is keyboard visible */
  isVisible: boolean;
  /** Keyboard height */
  height: number;
  /** Keyboard animation duration */
  duration: number;
  /** Keyboard animation curve */
  curve: number;
}

// ============================================
// 2. HOOK IMPLEMENTATION
// ============================================

export function useKeyboard(): UseKeyboardReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const [duration, setDuration] = useState(250);
  const [curve, setCurve] = useState(0);

  useEffect(() => {
    const onKeyboardDidShow = (event: KeyboardEvent) => {
      setIsVisible(true);
      setHeight(event.endCoordinates.height);
      setDuration(event.duration || 250);
      setCurve(event.easing || 0);
    };

    const onKeyboardDidHide = (event: KeyboardEvent) => {
      setIsVisible(false);
      setHeight(Number(0) || 0);
      setDuration(event.duration || 250);
      setCurve(event.easing || 0);
    };

    const onKeyboardWillShow = (event: KeyboardEvent) => {
      setIsVisible(true);
      setHeight(event.endCoordinates.height);
      setDuration(event.duration || 250);
      setCurve(event.easing || 0);
    };

    const onKeyboardWillHide = (event: KeyboardEvent) => {
      setIsVisible(false);
      setHeight(Number(0) || 0);
      setDuration(event.duration || 250);
      setCurve(event.easing || 0);
    };

    // Use different events for iOS and Android
    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', onKeyboardWillShow);
      const hideSubscription = Keyboard.addListener('keyboardWillHide', onKeyboardWillHide);
      
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    } else {
      const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);
      
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  return {
    isVisible,
    height,
    duration,
    curve,
  };
}

export default useKeyboard;