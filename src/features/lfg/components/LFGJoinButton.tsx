/**
 * KONEX LFGJoinButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Button for joining an LFG with state management
 * 
 * Usage:
 * <LFGJoinButton
 *   lfgId={lfgId}
 *   isJoined={isJoined}
 *   onJoin={handleJoin}
 *   onLeave={handleLeave}
 * />
 */

import React, { useState } from 'react';
import { Alert, View, ViewStyle } from 'react-native';
import Button from '../../../components/atoms/Button';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface LFGJoinButtonProps {
  /** LFG ID */
  lfgId: string;
  /** Is the user already joined */
  isJoined: boolean;
  /** Is the user the author */
  isAuthor?: boolean;
  /** Is the LFG full */
  isFull?: boolean;
  /** On join handler */
  onJoin: (lfgId: string) => Promise<void>;
  /** On leave handler */
  onLeave: (lfgId: string) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGJoinButton: React.FC<LFGJoinButtonProps> = ({
  lfgId,
  isJoined,
  isAuthor = false,
  isFull = false,
  onJoin,
  onLeave,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isAuthor) return;

    if (isJoined) {
      Alert.alert(
        'Leave LFG',
        'Are you sure you want to leave this LFG?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await onLeave(lfgId);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      if (isFull) {
        Alert.alert('Full', 'This LFG group is already full.');
        return;
      }
      setIsLoading(true);
      try {
        await onJoin(lfgId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonProps = () => {
    if (isAuthor) {
      return {
        title: 'Your LFG',
        variant: 'neutral' as const,
        disabled: true,
      };
    }

    if (isJoined) {
      return {
        title: 'Joined ✓',
        variant: 'success' as const,
      };
    }

    if (isFull) {
      return {
        title: 'Full',
        variant: 'neutral' as const,
        disabled: true,
      };
    }

    return {
      title: 'Join Party',
      variant: 'primary' as const,
    };
  };

  const buttonProps = getButtonProps();

  return (
    <View style={style} testID={testID}>
      <Button
        title={buttonProps.title}
        variant={buttonProps.variant}
        onPress={handlePress}
        loading={isLoading}
        disabled={buttonProps.disabled || isLoading}
        fullWidth
        size="md"
      />
    </View>
  );
};

export default LFGJoinButton;