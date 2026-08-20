/**
 * KONEX TournamentCreationForm Component
 * Billion Dollar Code - Production Ready
 * 
 * A form for creating a new tournament
 * 
 * Usage:
 * <TournamentCreationForm
 *   onSubmit={handleSubmit}
 *   isLoading={isLoading}
 * />
 */

import React, { useState } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Input from '../../atoms/Input';
import TextArea from '../../atoms/TextArea';
import Button from '../../atoms/Button';
import Dropdown from '../../molecules/Dropdown';
import DatePicker from '../../molecules/DatePicker';
import TagInput from '../../molecules/TagInput';

// ============================================
// 1. TYPES
// ============================================

export interface TournamentFormData {
  name: string;
  gameMode: string;
  format: string;
  maxSquads: number;
  maxTeams: number;
  date: Date;
  startTime: string;
  region: string;
  entryFee: string;
  prize: string;
  requirements: string[];
  description: string;
}

export interface TournamentCreationFormProps {
  /** On submit handler */
  onSubmit: (data: TournamentFormData) => Promise<void>;
  /** Is loading */
  isLoading?: boolean;
  /** Initial data for editing */
  initialData?: Partial<TournamentFormData>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const TournamentCreationForm: React.FC<TournamentCreationFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<TournamentFormData>({
    name: initialData.name || '',
    gameMode: initialData.gameMode || '',
    format: initialData.format || 'Single Elimination',
    maxSquads: initialData.maxSquads || 16,
    maxTeams: (initialData as any).maxTeams || 16,
    date: initialData.date || new Date(),
    startTime: initialData.startTime || '',
    region: initialData.region || '',
    entryFee: initialData.entryFee || 'Free',
    prize: initialData.prize || '',
    requirements: initialData.requirements || [],
    description: initialData.description || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TournamentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formats = [
    { label: 'Single Elimination', value: 'Single Elimination' },
    { label: 'Double Elimination', value: 'Double Elimination' },
    { label: 'Round Robin', value: 'Round Robin' },
    { label: 'Swiss', value: 'Swiss' },
    { label: 'Group Stage + Knockout', value: 'Group Stage + Knockout' },
  ];

  const maxSquadsOptions = [
    { label: '4', value: 4 },
    { label: '8', value: 8 },
    { label: '16', value: 16 },
    { label: '32', value: 32 },
    { label: '64', value: 64 },
  ];

  const regions = [
    { label: 'North America', value: 'North America' },
    { label: 'South America', value: 'South America' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia', value: 'Asia' },
    { label: 'Africa', value: 'Africa' },
    { label: 'Oceania', value: 'Oceania' },
    { label: 'Global', value: 'Global' },
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TournamentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }
    if (!formData.gameMode.trim()) {
      newErrors.gameMode = 'Game mode is required';
    }
    if (!formData.startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    if (!formData.prize.trim()) {
      newErrors.prize = 'Prize is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
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
    <ScrollView style={containerStyle} keyboardShouldPersistTaps="handled">
      <View style={sectionStyle}>
        <Input
          label="Tournament name"
          value={formData.name}
          onChangeText={(name) => setFormData({ ...formData, name })}
          placeholder="Weekly Ranked Cup"
        />
      </View>
      <View style={sectionStyle}>
        <TextArea
          label="Description"
          value={formData.description}
          onChangeText={(description) => setFormData({ ...formData, description })}
          placeholder="Rules, format, prize info..."
        />
      </View>
      <View style={sectionStyle}>
        <Input
          label="Max teams"
          value={String(formData.maxTeams ?? '')}
          onChangeText={(v) => setFormData({ ...formData, maxTeams: parseInt(v, 10) || 0 })}
          keyboardType="number-pad"
          placeholder="16"
        />
      </View>
      <Button title={isSubmitting || isLoading ? 'Creating...' : 'Create tournament'} onPress={handleSubmit} disabled={isSubmitting || isLoading} />
    </ScrollView>
  );
};

export default TournamentCreationForm;