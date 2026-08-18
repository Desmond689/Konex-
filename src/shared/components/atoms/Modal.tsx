/**
 * KONEX Modal Component
 * Billion Dollar Code - Production Ready
 * 
 * Reusable modal with overlay, header, and actions
 * 
 * Usage:
 * <Modal visible={visible} onClose={() => setVisible(false)} title="Modal Title">
 *   <Text>Modal content</Text>
 * </Modal>
 */

import React, { ReactNode } from 'react';
import {
    Modal as RNModal,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Icon from './Icon';

// ============================================
// 1. TYPES
// ============================================

export interface ModalProps {
  /** Modal visibility */
  visible: boolean;
  /** On close handler */
  onClose?: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom content style */
  contentStyle?: ViewStyle;
  /** Custom header style */
  headerStyle?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  containerStyle,
  contentStyle,
  headerStyle,
  titleStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const backdropStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...containerStyle,
  };

  const contentContainerStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...contentStyle,
  };

  const headerContainerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    ...headerStyle,
  };

  const titleTextStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    ...titleStyle,
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={backdropStyle}>
          <TouchableWithoutFeedback>
            <View style={contentContainerStyle}>
              {(title || onClose) && (
                <View style={headerContainerStyle}>
                  {title && <Text style={titleTextStyle}>{title}</Text>}
                  {onClose && (
                    <TouchableOpacity onPress={onClose}>
                      <Icon name="x" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;