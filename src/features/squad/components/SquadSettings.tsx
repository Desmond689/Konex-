/**
 * KONEX SquadSettings Component
 * Billion Dollar Code - Production Ready
 * 
 * Settings and management options for a squad
 * 
 * Usage:
 * <SquadSettings
 *   squad={squad}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Card from '../../../components/atoms/Card';
import Input from '../../../components/atoms/Input';
import TextArea from '../../../components/atoms/TextArea';
import Dropdown from '../../../components/molecules/Dropdown';
import ListItem from '../../../components/molecules/ListItem';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface SquadSettingsData {
  id: string;
  name: string;
  tag: string | null;
  description: string | null;
  squadType: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  joinType: 'open' | 'approval' | 'inviteOnly';
  maxMembers: number;
  iconUrl: string | null;
}

export interface SquadSettingsProps {
  /** Squad data */
  squad: SquadSettingsData;
  /** On update handler */
  onUpdate: (data: Partial<SquadSettingsData>) => Promise<void>;
  /** On delete handler */
  onDelete: () => Promise<void>;
  /** On transfer leadership handler */
  onTransferLeadership?: () => void;
  /** Is the current user the leader */
  isLeader: boolean;
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

export const SquadSettings: React.FC<SquadSettingsProps> = ({
  squad,
  onUpdate,
  onDelete,
  onTransferLeadership,
  isLeader,
  loading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<Partial<SquadSettingsData>>({
    name: squad.name,
    tag: squad.tag,
    description: squad.description,
    squadType: squad.squadType,
    joinType: squad.joinType,
    maxMembers: squad.maxMembers,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const squadTypes = [
    { label: 'Competitive', value: 'Competitive' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Ranked', value: 'Ranked' },
    { label: 'Clan', value: 'Clan' },
    { label: 'Social', value: 'Social' },
  ];

  const joinTypes = [
    { label: 'Open (anyone can join)', value: 'open' },
    { label: 'Approval Required', value: 'approval' },
    { label: 'Invite Only', value: 'inviteOnly' },
  ];

  const maxMembersOptions = Array.from({ length: 9 }, (_, i) => ({
    label: `${(i + 2) * 2}`,
    value: (i + 2) * 2,
  }));

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate(formData);
      Alert.alert('Success', 'Squad settings updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update squad settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Squad',
      'Are you sure you want to delete this squad? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete();
              Alert.alert('Success', 'Squad deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete squad');
            }
          },
        },
      ]
    );
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: 16,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  };

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      {/* General Settings - Only for leaders */}
      {isLeader && (
        <Card style={sectionStyle}>
          <Text style={sectionTitleStyle}>General Settings</Text>
          <Input
            label="Squad Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter squad name..."
            style={{ marginBottom: 12 }}
          />
          <Input
            label="Tag"
            value={formData.tag || ''}
            onChangeText={(text) => setFormData({ ...formData, tag: text.toUpperCase() })}
            placeholder="e.g., SW"
            style={{ marginBottom: 12 }}
          />
          <TextArea
            label="Description"
            value={formData.description || ''}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe your squad..."
            maxLength={500}
            showCharCount
            style={{ marginBottom: 12 }}
          />
          <Dropdown
            label="Squad Type"
            items={squadTypes}
            selectedValue={formData.squadType}
            onSelect={(value) => setFormData({ ...formData, squadType: value })}
            containerStyle={{ marginBottom: 12 }}
          />
          <Dropdown
            label="Join Type"
            items={joinTypes}
            selectedValue={formData.joinType}
            onSelect={(value) => setFormData({ ...formData, joinType: value })}
            containerStyle={{ marginBottom: 12 }}
          />
          <Dropdown
            label="Max Members"
            items={maxMembersOptions}
            selectedValue={formData.maxMembers}
            onSelect={(value) => setFormData({ ...formData, maxMembers: value })}
          />
          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleUpdate}
            loading={isSubmitting || loading}
            fullWidth
            style={{ marginTop: 16 }}
          />
        </Card>
      )}

      {/* Management - Only for leaders */}
      {isLeader && (
        <Card style={sectionStyle}>
          <Text style={sectionTitleStyle}>Management</Text>
          {onTransferLeadership && (
            <ListItem
              title="Transfer Leadership"
              subtitle="Assign a new squad leader"
              leftIcon="user-check"
              rightIcon="chevron-right"
              onPress={onTransferLeadership}
            />
          )}
          <ListItem
            title="Delete Squad"
            subtitle="Permanently delete this squad"
            leftIcon="trash-2"
            rightIcon="chevron-right"
            onPress={handleDelete}
            style={{ borderBottomWidth: 0 }}
          />
        </Card>
      )}

      {/* Squad Info */}
      <Card style={sectionStyle}>
        <Text style={sectionTitleStyle}>Squad Information</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Squad ID</Text>
          <Text style={{ fontSize: 14, color: colors.text }}>{squad.id.slice(0, 12)}...</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Member Count</Text>
          <Text style={{ fontSize: 14, color: colors.text }}>{squad.maxMembers}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Created</Text>
          <Text style={{ fontSize: 14, color: colors.text }}>
            {new Date(squad.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

export default SquadSettings;