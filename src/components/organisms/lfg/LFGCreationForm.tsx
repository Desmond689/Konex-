/**
 * KONEX LFGCreationForm Component
 * Billion Dollar Code - Production Ready
 * 
 * A form for creating LFG posts
 * 
 * Usage:
 * <LFGCreationForm
 *   onSubmit={handleSubmit}
 *   isLoading={isLoading}
 * />
 */

import React, { useState } from 'react';
import {
    ScrollView,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Input from '../../atoms/Input';
import Label from '../../atoms/Label';
import Switch from '../../atoms/Switch';
import TextArea from '../../atoms/TextArea';
import Dropdown from '../../molecules/Dropdown';

// ============================================
// 1. TYPES
// ============================================

export interface LFGCreationFormData {
  gameMode: string;
  playersNeeded: number;
  currentPartySize: number;
  rankRequirement: string | null;
  micRequired: boolean;
  message: string;
}

export interface LFGCreationFormProps {
  /** On submit handler */
  onSubmit: (data: LFGCreationFormData) => Promise<void>;
  /** Initial data for editing */
  initialData?: Partial<LFGCreationFormData>;
  /** Is loading */
  isLoading?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const LFGCreationForm: React.FC<LFGCreationFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<LFGCreationFormData>({
    gameMode: initialData.gameMode || '',
    playersNeeded: initialData.playersNeeded || 4,
    currentPartySize: initialData.currentPartySize || 1,
    rankRequirement: initialData.rankRequirement || null,
    micRequired: initialData.micRequired || false,
    message: initialData.message || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LFGCreationFormData, string>>>({});

  const gameModes = [
    { label: 'Ranked MP', value: 'Ranked MP' },
    { label: 'Battle Royale', value: 'Battle Royale' },
    { label: 'Zombies', value: 'Zombies' },
    { label: 'Scrims', value: 'Scrims' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Clan Wars', value: 'Clan Wars' },
  ];

  const rankRequirements = [
    { label: 'Any', value: 'Any' },
    { label: 'Bronze', value: 'Bronze' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Platinum', value: 'Platinum' },
    { label: 'Diamond', value: 'Diamond' },
    { label: 'Master', value: 'Master' },
    { label: 'Grand Master', value: 'Grand Master' },
    { label: 'Legendary', value: 'Legendary' },
  ];

  const playerCounts = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 2}`,
    value: i + 2,
  }));

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LFGCreationFormData, string>> = {};

    if (!formData.gameMode) {
      newErrors.gameMode = 'Game mode is required';
    }
    if (formData.playersNeeded < 2) {
      newErrors.playersNeeded = 'Need at least 2 players';
    }
    if (formData.currentPartySize > formData.playersNeeded) {
      newErrors.currentPartySize = 'Party size cannot exceed players needed';
    }
    if (formData.message && formData.message.length > 200) {
      newErrors.message = 'Message must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  return (
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      <Input
        label="Game Mode"
        value={formData.gameMode}
        onChangeText={(text) => setFormData({ ...formData, gameMode: text })}
        placeholder="Enter game mode..."
        error={errors.gameMode}
        required
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Dropdown
            label="Players Needed"
            items={playerCounts}
            selectedValue={formData.playersNeeded}
            onSelect={(value) => setFormData({ ...formData, playersNeeded: value })}
            error={errors.playersNeeded}
            containerStyle={{ marginBottom: 12 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Current Party Size"
            value={String(formData.currentPartySize)}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setFormData({ ...formData, currentPartySize: Math.max(1, Math.min(value, formData.playersNeeded)) });
            }}
            keyboardType="numeric"
            error={errors.currentPartySize}
            style={{ marginBottom: 12 }}
          />
        </View>
      </View>

      <Dropdown
        label="Rank Requirement"
        items={rankRequirements}
        selectedValue={formData.rankRequirement}
        onSelect={(value) => setFormData({ ...formData, rankRequirement: value })}
        containerStyle={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Label text="Mic Required" style={{ marginRight: 12 }} />
        <Switch
          value={formData.micRequired}
          onValueChange={(value) => setFormData({ ...formData, micRequired: value })}
        />
      </View>

      <TextArea
        label="Message"
        value={formData.message}
        onChangeText={(text) => setFormData({ ...formData, message: text })}
        placeholder="Describe your LFG request..."
        numberOfLines={3}
        maxLength={200}
        showCharCount
        error={errors.message}
        style={{ marginBottom: 16 }}
      />

      <Button
        title="Post LFG"
        variant="primary"
        onPress={handleSubmit}
        loading={isLoading}
        fullWidth
        size="lg"
      />
    </ScrollView>
  );
};

export default LFGCreationForm;