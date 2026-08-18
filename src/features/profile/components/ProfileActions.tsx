/**
 * KONEX ProfileActions Component
 * Billion Dollar Code - Production Ready
 * 
 * Action buttons for a user profile
 * 
 * Usage:
 * <ProfileActions
 *   relationship={relationship}
 *   onFollow={handleFollow}
 *   onMessage={handleMessage}
 * />
 */

import React, { useState } from 'react';
import { Alert, View, ViewStyle } from 'react-native';
import Button from '../../../components/atoms/Button';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export type RelationshipStatus = 
  | 'self' 
  | 'stranger' 
  | 'following' 
  | 'friend' 
  | 'friend_request_sent' 
  | 'friend_request_received';

export interface ProfileActionsProps {
  /** Relationship status with the user */
  relationship: RelationshipStatus;
  /** On follow handler */
  onFollow: () => Promise<void>;
  /** On unfollow handler */
  onUnfollow: () => Promise<void>;
  /** On message handler */
  onMessage: () => void;
  /** On friend request handler */
  onFriendRequest: () => Promise<void>;
  /** On friend request cancel handler */
  onFriendRequestCancel: () => Promise<void>;
  /** On friend request accept handler */
  onFriendRequestAccept: () => Promise<void>;
  /** On friend request decline handler */
  onFriendRequestDecline: () => Promise<void>;
  /** On remove friend handler */
  onRemoveFriend: () => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  relationship,
  onFollow,
  onUnfollow,
  onMessage,
  onFriendRequest,
  onFriendRequestCancel,
  onFriendRequestAccept,
  onFriendRequestDecline,
  onRemoveFriend,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = () => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleAction(onRemoveFriend),
        },
      ]
    );
  };

  const renderActions = () => {
    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      gap: 8,
      ...style,
    };

    switch (relationship) {
      case 'self':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={() => {}}
              fullWidth
            />
          </View>
        );

      case 'stranger':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Follow"
              variant="outline"
              onPress={() => handleAction(onFollow)}
              loading={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              title="Message"
              variant="primary"
              onPress={onMessage}
              style={{ flex: 1 }}
            />
          </View>
        );

      case 'following':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Following ✓"
              variant="success"
              onPress={() => handleAction(onUnfollow)}
              loading={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              title="Message"
              variant="primary"
              onPress={onMessage}
              style={{ flex: 1 }}
            />
          </View>
        );

      case 'friend':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Friends ✓"
              variant="success"
              onPress={handleRemoveFriend}
              loading={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              title="Message"
              variant="primary"
              onPress={onMessage}
              style={{ flex: 1 }}
            />
          </View>
        );

      case 'friend_request_sent':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Request Sent"
              variant="outline"
              onPress={() => handleAction(onFriendRequestCancel)}
              loading={isLoading}
              fullWidth
            />
          </View>
        );

      case 'friend_request_received':
        return (
          <View style={containerStyle} testID={testID}>
            <Button
              title="Accept"
              variant="success"
              onPress={() => handleAction(onFriendRequestAccept)}
              loading={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              title="Decline"
              variant="outline"
              onPress={() => handleAction(onFriendRequestDecline)}
              loading={isLoading}
              style={{ flex: 1 }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return renderActions();
};

export default ProfileActions;