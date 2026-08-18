/**
 * KONEX useKeyboard Hook
 * Billion Dollar Code - Production Ready
 * 
 * Tracks keyboard visibility and height
 * 
 * Usage:
 * const { isKeyboardVisible, keyboardHeight, keyboardAnimation } = useKeyboard();
 */

import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';
import { logger } from '../core/logger/logger.service';

export interface KeyboardAnimation {
  duration: number;
  easing: string;
  startHeight: number;
  endHeight: number;
}

export interface UseKeyboardReturn {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  keyboardAnimation: KeyboardAnimation | null;
  keyboardEvent: KeyboardEvent | null;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [keyboardAnimation, setKeyboardAnimation] = useState<KeyboardAnimation | null>(null);
  const [keyboardEvent, setKeyboardEvent] = useState<KeyboardEvent | null>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', (event: KeyboardEvent) => {
      const height = event.endCoordinates?.height || 0;
      setIsKeyboardVisible(true);
      setKeyboardHeight(height);
      setKeyboardEvent(event);
      
      setKeyboardAnimation({
        duration: event.duration || 250,
        easing: event.easing || 'keyboard',
        startHeight: event.startCoordinates?.height || 0,
        endHeight: height,
      });

      logger.debug('⌨️ Keyboard showed', { height });
    });

    const showDidSubscription = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates?.height || 0);
      setKeyboardEvent(event);
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', (event: KeyboardEvent) => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      setKeyboardEvent(event);
      
      setKeyboardAnimation({
        duration: event.duration || 250,
        easing: event.easing || 'keyboard',
        startHeight: event.startCoordinates?.height || 0,
        endHeight: 0,
      });

      logger.debug('⌨️ Keyboard hid', { height: event.startCoordinates?.height });
    });

    const hideDidSubscription = Keyboard.addListener('keyboardDidHide', (event: KeyboardEvent) => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      setKeyboardEvent(event);
    });

    return () => {
      showSubscription.remove();
      showDidSubscription.remove();
      hideSubscription.remove();
      hideDidSubscription.remove();
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
    keyboardAnimation,
    keyboardEvent,
  };
};

export default useKeyboard;