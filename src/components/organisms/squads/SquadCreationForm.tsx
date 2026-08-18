/**
 * KONEX SquadCreationForm Component
 * Billion Dollar Code - Production Ready
 * 
 * A form for creating a new squad
 * 
 * Usage:
 * <SquadCreationForm
 *   onSubmit={handleSubmit}
 *   isLoading={isLoading}
 * />
 */

import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../../atoms/Button';
import Input from '../../atoms/Input';
import TextArea from '../../atoms/TextArea';
import Dropdown from '../../molecules/Dropdown';
import ImagePicker from '../../molecules/ImagePicker';

// ============================================
// 1. TYPES
// ============================================

export interface SquadFormData {
  name: string;
  tag: string;
  description: string;
  squadType: 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social';
  joinType: 'open' | 'approval' | 'inviteOnly';
  maxMembers: number;
  iconUrl: string | null;
}

export interface SquadCreationFormProps {
  /** On submit handler */
  onSubmit: (data: SquadFormData) => Promise<void>;
  /** On upload icon handler */
  onUploadIcon?: (imageUri: string) => Promise<string>;
  /** Is loading */
  isLoading?: boolean;
  /** Initial data for editing */
  initialData?: Partial<SquadFormData>;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SquadCreationForm: React.FC<SquadCreationFormProps> = ({
  onSubmit,
  onUploadIcon,
  isLoading = false,
  initialData = {},
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<SquadFormData>({
    name: initialData.name || '',
    tag: initialData.tag || '',
    description: initialData.description || '',
    squadType: initialData.squadType || 'Casual',
    joinType: initialData.joinType || 'open',
    maxMembers: initialData.maxMembers || 20,
    iconUrl: initialData.iconUrl || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SquadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

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

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SquadFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Squad name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Squad name must be at least 3 characters';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Squad name must be less than 30 characters';
    }

    if (formData.tag && formData.tag.length > 5) {
      newErrors.tag = 'Tag must be less than 5 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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

  const handleIconUpload = async (imageUri: string) => {
    if (!onUploadIcon) return;
    try {
      setIsUploadingIcon(true);
      const url = await onUploadIcon(imageUri);
      setFormData({ ...formData, iconUrl: url });
      Alert.alert('Success', 'Icon updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload icon');
    } finally {
      setIsUploadingIcon(false);
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
    <ScrollView style={containerStyle} testID={testID} showsVerticalScrollIndicator={false}>
      {/* Icon Section */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Squad Icon</Text>
        {onUploadIcon && (
          <ImagePicker
            images={formData.iconUrl ? [formData.iconUrl] : []}
            onImagesChange={(images) => {
              if (images.length > 0) {
                handleIconUpload(images[0]);
              }
            }}
            maxCount={1}
            /* device picker built-in */
            isLoading={isUploadingIcon}
          />
        )}
      </View>

      {/* Basic Info */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Basic Information</Text>
        <Input
          label="Squad Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter squad name..."
          error={errors.name}
          required
          style={{ marginBottom: 12 }}
        />
        <Input
          label="Tag (Optional)"
          value={formData.tag}
          onChangeText={(text) => setFormData({ ...formData, tag: text.toUpperCase() })}
          placeholder="e.g., SW"
          error={errors.tag}
          style={{ marginBottom: 12 }}
        />
        <TextArea
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Describe your squad..."
          maxLength={500}
          showCharCount
          error={errors.description}
          style={{ marginBottom: 12 }}
        />
      </View>

      {/* Settings */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Settings</Text>

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
          containerStyle={{ marginBottom: 12 }}
        />
      </View>

      <Button
        title="Create Squad"
        variant="primary"
        onPress={handleSubmit}
        loading={isSubmitting || isLoading}
        fullWidth
        size="lg"
        style={{ marginBottom: 24 }}
      />
    </ScrollView>
  );
};

export default SquadCreationForm;