/**
 * KONEX Modal Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable modal with backdrop and animation
 * 
 * Usage:
 * <Modal visible={visible} onClose={() => setVisible(false)}>
 *   <Text>Modal content</Text>
 * </Modal>
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal as RNModal,
    ModalProps as RNModalProps,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export interface ModalProps extends RNModalProps {
  /** Is the modal visible */
  visible: boolean;
  /** On close handler */
  onClose?: () => void;
  /** Show close button */
  showCloseButton?: boolean;
  /** Animation type */
  animationType?: 'fade' | 'slide' | 'scale' | 'none';
  /** Close on backdrop press */
  closeOnBackdropPress?: boolean;
  /** Custom modal content style */
  contentStyle?: ViewStyle;
  /** Custom backdrop style */
  backdropStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  showCloseButton = true,
  animationType = 'scale',
  closeOnBackdropPress = true,
  contentStyle,
  backdropStyle,
  children,
  transparent = true,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAnimation = () => {
    if (animationType === 'none') return { opacity: 1, transform: [] };
    
    const animations: any = { opacity: fadeAnim };
    
    if (animationType === 'scale') {
      animations.transform = [{ scale: scaleAnim }];
    } else if (animationType === 'slide') {
      animations.transform = [{
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      }];
    }
    
    return animations;
  };

  const backdropStyleCombined: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...backdropStyle,
  };

  const contentStyleCombined: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: '90%',
    position: 'relative',
    ...contentStyle,
  };

  const closeButtonStyle: ViewStyle = {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  };

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType="none"
      testID={testID}
      {...props}
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress && onClose ? onClose : undefined}
      >
        <View style={backdropStyleCombined}>
          <TouchableWithoutFeedback>
            <Animated.View style={[contentStyleCombined, getAnimation()]}>
              {showCloseButton && onClose && (
                <TouchableOpacity style={closeButtonStyle} onPress={onClose}>
                  <Icon name="x" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;