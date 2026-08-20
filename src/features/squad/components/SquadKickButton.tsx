/**
 * KONEX SquadKickButton Component
 * Billion Dollar Code - Production Ready
 * 
 * Button for kicking members from a squad
 * 
 * Usage:
 * <SquadKickButton
 *   squadId={squadId}
 *   userId={userId}
 *   onKick={handleKick}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    View,
    ViewStyle,
    Text,
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Modal from '../../../components/atoms/Modal';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SquadKickButtonProps {
  /** Squad ID */
  squadId: string;
  /** User ID to kick */
  userId: string;
  /** User display name */
  userName: string;
  /** Is the current user an admin or leader */
  canKick: boolean;
  /** Is the target the squad leader */
  isLeader: boolean;
  /** On kick handler */
  onKick: (squadId: string, userId: string, reason?: string) => Promise<void>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadKickButton: React.FC<SquadKickButtonProps> = ({
  squadId,
  userId,
  userName,
  canKick,
  isLeader,
  onKick,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKick = async () => {
    try {
      setIsLoading(true);
      await onKick(squadId, userId, reason || undefined);
      setIsModalVisible(false);
      setReason('');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (isLeader) {
      Alert.alert('Cannot Kick Leader', 'You cannot kick the squad leader.');
      return;
    }
    setIsModalVisible(true);
  };

  if (!canKick) return null;

  return (
    <View style={style} testID={testID}>
      <Button
        title="Kick"
        variant="danger"
        size="sm"
        onPress={handlePress}
      />

      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Kick Member"
        contentStyle={{ maxWidth: 400 }}
      >
        <Text style={{ fontSize: 16, color: colors.text, marginBottom: 8 }}>
          Are you sure you want to kick {userName}?
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
          This action cannot be undone.
        </Text>
        <Input
          label="Reason (Optional)"
          value={reason}
          onChangeText={setReason}
          placeholder="Enter reason for kicking..."
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsModalVisible(false)}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Kick"
            variant="danger"
            onPress={handleKick}
            loading={isLoading}
          />
        </View>
      </Modal>
    </View>
  );
};

export default SquadKickButton;