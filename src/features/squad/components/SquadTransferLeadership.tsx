/**
 * KONEX SquadTransferLeadership Component
 * Billion Dollar Code - Production Ready
 * 
 * Modal/component for transferring squad leadership
 * 
 * Usage:
 * <SquadTransferLeadership
 *   squadId={squadId}
 *   members={members}
 *   onTransfer={handleTransfer}
 *   onClose={handleClose}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Modal from '../../../components/atoms/Modal';
import RadioButton from '../../../components/atoms/RadioButton';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SquadMember {
  id: string;
  userId: string;
  gamerTag: string;
  username: string;
  avatarUrl: string | null;
  role: 'Leader' | 'Admin' | 'Member';
  joinedAt: string;
}

export interface SquadTransferLeadershipProps {
  /** Squad ID */
  squadId: string;
  /** List of squad members (excluding current leader) */
  members: SquadMember[];
  /** On transfer handler */
  onTransfer: (newLeaderId: string) => Promise<void>;
  /** On close handler */
  onClose: () => void;
  /** Minimum days in squad required */
  minDaysInSquad?: number;
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

export const SquadTransferLeadership: React.FC<SquadTransferLeadershipProps> = ({
  squadId,
  members,
  onTransfer,
  onClose,
  minDaysInSquad = 7,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async () => {
    if (!selectedUserId) {
      Alert.alert('Error', 'Please select a member to transfer leadership to.');
      return;
    }

    const selectedMember = members.find((m) => m.userId === selectedUserId);
    if (!selectedMember) return;

    // Check if member has been in squad long enough
    const joinedDate = new Date(selectedMember.joinedAt);
    const daysInSquad = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysInSquad < minDaysInSquad) {
      Alert.alert(
        'Insufficient Time',
        `${selectedMember.gamerTag} has only been in the squad for ${daysInSquad} days. Minimum ${minDaysInSquad} days required.`
      );
      return;
    }

    Alert.alert(
      'Transfer Leadership',
      `Are you sure you want to transfer leadership to ${selectedMember.gamerTag}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'default',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await onTransfer(selectedUserId);
              onClose();
              Alert.alert('Success', 'Leadership transferred successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to transfer leadership');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: SquadMember }) => {
    const isSelected = selectedUserId === item.userId;
    const joinedDate = new Date(item.joinedAt);
    const daysInSquad = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
    const isEligible = daysInSquad >= minDaysInSquad;

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          opacity: isEligible ? 1 : 0.5,
        }}
        onPress={() => isEligible && setSelectedUserId(item.userId)}
        disabled={!isEligible}
      >
        <RadioButton
          selected={isSelected}
          onPress={() => isEligible && setSelectedUserId(item.userId)}
          disabled={!isEligible}
        />
        <Avatar
          source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
          name={item.gamerTag}
          size="sm"
          style={{ marginLeft: 8 }}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>
            {item.gamerTag}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            @{item.username} • {item.role}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: isEligible ? colors.success : colors.error }}>
            {isEligible ? `✅ ${daysInSquad}d` : `⏳ ${daysInSquad}/${minDaysInSquad}d`}
          </Text>
          {!isEligible && (
            <Text style={{ fontSize: 10, color: colors.textMuted }}>
              Need {minDaysInSquad} days
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  return (
    <Modal
      visible={true}
      onClose={onClose}
      title="Transfer Leadership"
      contentStyle={{ maxWidth: 400, maxHeight: '80%' }}
      testID={testID}
    >
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
        Select a member to transfer squad leadership to. Member must have been in the squad for at least {minDaysInSquad} days.
      </Text>

      {members.length === 0 ? (
        <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', padding: 20 }}>
          No eligible members to transfer leadership to.
        </Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 300 }}
        />
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={onClose}
          style={{ marginRight: 8 }}
        />
        <Button
          title="Transfer"
          variant="primary"
          onPress={handleTransfer}
          loading={isSubmitting || loading}
          disabled={!selectedUserId}
        />
      </View>
    </Modal>
  );
};

export default SquadTransferLeadership;