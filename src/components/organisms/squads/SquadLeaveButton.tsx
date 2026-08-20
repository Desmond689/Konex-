/**
 * KONEX SquadLeaveButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Button for leaving a squad
 * 
 * Usage:
 * <SquadLeaveButton
 *   squadId={squadId}
 *   isLeader={isLeader}
 *   onLeave={handleLeave}
 * />
 */

import React, { useState } from 'react';
import { Alert, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';

// ============================================
// 1. TYPES
// ============================================

export interface SquadLeaveButtonProps {
  /** Squad ID */
  squadId: string;
  /** Is the user the squad leader */
  isLeader: boolean;
  /** On leave handler */
  onLeave: (squadId: string) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadLeaveButton: React.FC<SquadLeaveButtonProps> = ({
  squadId,
  isLeader,
  onLeave,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    if (isLeader) {
      Alert.alert(
        'Transfer Leadership Required',
        'You are the squad leader. You must transfer leadership before leaving.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Leave Squad',
      'Are you sure you want to leave this squad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onLeave(squadId);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={style} testID={testID}>
      <Button
        title="Leave Squad"
        variant="danger"
        onPress={handlePress}
        loading={isLoading}
        fullWidth
      />
    </View>
  );
};

export default SquadLeaveButton;