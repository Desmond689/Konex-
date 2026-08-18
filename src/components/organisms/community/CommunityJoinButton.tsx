/**
 * KONEX CommunityJoinButton Component
 * Billion Dollar Code - Production Ready
 * 
 * A button for joining or leaving a community
 * 
 * Usage:
 * <CommunityJoinButton
 *   isMember={isMember}
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

export interface CommunityJoinButtonProps {
  /** Is the user a member */
  isMember: boolean;
  /** On join handler */
  onJoin: () => Promise<void>;
  /** On leave handler */
  onLeave: () => Promise<void>;
  /** Is loading */
  loading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const CommunityJoinButton: React.FC<CommunityJoinButtonProps> = ({
  isMember,
  onJoin,
  onLeave,
  loading: externalLoading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isMember) {
      Alert.alert(
        'Leave Community',
        'Are you sure you want to leave this community?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await onLeave();
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      setIsLoading(true);
      try {
        await onJoin();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const buttonStyle: ViewStyle = {
    ...style,
  };

  return (
    <View style={buttonStyle} testID={testID}>
      <Button
        title={isMember ? 'Joined ✓' : 'Join Community'}
        variant={isMember ? 'success' : 'primary'}
        onPress={handlePress}
        loading={isLoading || externalLoading}
        fullWidth
        size="md"
      />
    </View>
  );
};

export default CommunityJoinButton;