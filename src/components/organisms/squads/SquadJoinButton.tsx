/**
 * KONEX SquadJoinButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Button for joining a squad with state management
 * 
 * Usage:
 * <SquadJoinButton
 *   squadId={squadId}
 *   isMember={isMember}
 *   joinType="open"
 *   onJoin={handleJoin}
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

export interface SquadJoinButtonProps {
  /** Squad ID */
  squadId: string;
  /** Is the user a member */
  isMember: boolean;
  /** Is the user pending approval */
  isPending?: boolean;
  /** Join type of the squad */
  joinType: 'open' | 'approval' | 'inviteOnly';
  /** Is the user the leader */
  isLeader?: boolean;
  /** Is the squad full */
  isFull?: boolean;
  /** On join handler */
  onJoin: (squadId: string) => Promise<void>;
  /** On leave handler */
  onLeave: (squadId: string) => Promise<void>;
  /** On cancel request handler */
  onCancelRequest?: (squadId: string) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadJoinButton: React.FC<SquadJoinButtonProps> = ({
  squadId,
  isMember,
  isPending = false,
  joinType,
  isLeader = false,
  isFull = false,
  onJoin,
  onLeave,
  onCancelRequest,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isMember) {
      if (isLeader) {
        Alert.alert(
          'Transfer Leadership',
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
    } else if (isPending) {
      if (onCancelRequest) {
        Alert.alert(
          'Cancel Request',
          'Are you sure you want to cancel your join request?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Cancel Request',
              style: 'destructive',
              onPress: async () => {
                setIsLoading(true);
                try {
                  await onCancelRequest(squadId);
                } finally {
                  setIsLoading(false);
                }
              },
            },
          ]
        );
      }
    } else {
      if (isFull) {
        Alert.alert('Squad Full', 'This squad has reached the maximum number of members.');
        return;
      }

      if (joinType === 'inviteOnly') {
        Alert.alert('Invite Only', 'This squad is invite-only. You must be invited to join.');
        return;
      }

      setIsLoading(true);
      try {
        await onJoin(squadId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonProps = () => {
    if (isLeader) {
      return {
        title: '👑 Leader',
        variant: 'primary' as const,
        disabled: true,
      };
    }

    if (isMember) {
      return {
        title: 'Joined ✓',
        variant: 'success' as const,
      };
    }

    if (isPending) {
      return {
        title: '⏳ Pending',
        variant: 'warning' as const,
      };
    }

    if (isFull) {
      return {
        title: 'Full',
        variant: 'neutral' as const,
        disabled: true,
      };
    }

    if (joinType === 'inviteOnly') {
      return {
        title: '🔒 Invite Only',
        variant: 'neutral' as const,
        disabled: true,
      };
    }

    if (joinType === 'approval') {
      return {
        title: 'Request to Join',
        variant: 'primary' as const,
      };
    }

    return {
      title: 'Join Squad',
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

export default SquadJoinButton;