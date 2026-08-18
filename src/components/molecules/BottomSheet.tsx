/**
 * KONEX BottomSheet Component
 * Billion Dollar Code - Production Ready
 * 
 * A customizable bottom sheet component with drag and snap points
 * 
 * Usage:
 * <BottomSheet
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   snapPoints={['50%', '100%']}
 * >
 *   <Text>Bottom Sheet Content</Text>
 * </BottomSheet>
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    TouchableWithoutFeedback,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// 1. TYPES
// ============================================

export interface BottomSheetProps {
  /** Is the bottom sheet visible */
  visible: boolean;
  /** On close handler */
  onClose: () => void;
  /** Snap points as percentages (e.g., ['50%', '100%']) */
  snapPoints?: string[];
  /** Initial snap index */
  initialSnap?: number;
  /** Enable dragging */
  draggable?: boolean;
  /** Close on backdrop press */
  closeOnBackdropPress?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Children content */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  snapPoints = ['50%', '100%'],
  initialSnap = 0,
  draggable = true,
  closeOnBackdropPress = true,
  style,
  children,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const currentSnapIndex = useRef(initialSnap);

  // Parse snap points
  const parsedSnapPoints = snapPoints.map((point) => {
    const value = parseFloat(point);
    return point.includes('%') ? (value / 100) * SCREEN_HEIGHT : value;
  });

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => draggable,
      onMoveShouldSetPanResponder: () => draggable,
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy;
        if (newY > 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = gestureState.dy;
        const velocity = gestureState.vy;

        // Determine which snap point to go to
        let targetSnap = currentSnapIndex.current;
        const currentPos = translateY._value;

        if (velocity > 0.5 || currentPos > SCREEN_HEIGHT * 0.3) {
          // Close the sheet
          handleClose();
          return;
        }

        // Find closest snap point
        let minDistance = Infinity;
        parsedSnapPoints.forEach((point, index) => {
          const distance = Math.abs(currentPos - point);
          if (distance < minDistance) {
            minDistance = distance;
            targetSnap = index;
          }
        });

        snapToIndex(targetSnap);
      },
    })
  ).current;

  // Snap to specific index
  const snapToIndex = (index: number) => {
    const targetY = parsedSnapPoints[index] || 0;
    currentSnapIndex.current = index;

    Animated.spring(translateY, {
      toValue: targetY,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  // Open the bottom sheet
  const openSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: parsedSnapPoints[currentSnapIndex.current] || 0,
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
  };

  // Close the bottom sheet
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      handleClose();
    }
  }, [visible]);

  const backdropStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  };

  const sheetStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: 100,
    maxHeight: SCREEN_HEIGHT - 40,
    ...style,
  };

  const handleStyle: ViewStyle = {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      testID={testID}
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress ? handleClose : undefined}
      >
        <Animated.View style={[backdropStyle, { opacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                sheetStyle,
                {
                  transform: [{ translateY }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {draggable && <View style={handleStyle} />}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheet;