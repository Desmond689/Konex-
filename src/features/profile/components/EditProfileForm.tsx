/**
 * KONEX EditProfileForm Component
 * Billion Dollar Code - Production Ready
 * 
 * A form for editing user profile
 * 
 * Usage:
 * <EditProfileForm
 *   profile={profile}
 *   onSubmit={handleSubmit}
 * />
 */

import React, { useState } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Input from '../../../components/atoms/Input';
import TextArea from '../../../components/atoms/TextArea';
import Button from '../../../components/atoms/Button';
import Dropdown from '../../../components/molecules/Dropdown';
import Avatar from '../../../components/atoms/Avatar';
import ImagePicker from '../../../components/molecules/ImagePicker';

// ============================================
// 1. TYPES
// ============================================

export interface ProfileFormData {
  gamerTag: string;
  username: string;
  bio: string;
  gamingStyle: string;
  skillLevel: string;
  role: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
}

export interface EditProfileFormProps {
  /** Current profile data */
  profile: ProfileFormData;
  /** On submit handler */
  onSubmit: (data: ProfileFormData) => Promise<void>;
  /** On upload avatar handler */
  onUploadAvatar?: (imageUri: string) => Promise<string>;
  /** On upload cover handler */
  onUploadCover?: (imageUri: string) => Promise<string>;
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

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onSubmit,
  onUploadAvatar,
  onUploadCover,
  isLoading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [formData, setFormData] = useState<ProfileFormData>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const gamingStyles = [
    { label: 'Competitive', value: 'Competitive' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Ranked', value: 'Ranked' },
    { label: 'Clan', value: 'Clan' },
    { label: 'Social', value: 'Social' },
  ];

  const skillLevels = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
    { label: 'Pro', value: 'Pro' },
  ];

  const roles = [
    { label: 'Sniper', value: 'Sniper' },
    { label: 'Rusher', value: 'Rusher' },
    { label: 'Support', value: 'Support' },
    { label: 'Flex', value: 'Flex' },
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.gamerTag.trim()) {
      newErrors.gamerTag = 'Gamer tag is required';
    } else if (formData.gamerTag.length < 3) {
      newErrors.gamerTag = 'Gamer tag must be at least 3 characters';
    } else if (formData.gamerTag.length > 15) {
      newErrors.gamerTag = 'Gamer tag must be less than 15 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be less than 160 characters';
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

  const handleAvatarUpload = async (imageUri: string) => {
    if (!onUploadAvatar) return;
    try {
      setIsUploadingAvatar(true);
      const url = await onUploadAvatar(imageUri);
      setFormData({ ...formData, avatarUrl: url });
      Alert.alert('Success', 'Avatar updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (imageUri: string) => {
    if (!onUploadCover) return;
    try {
      setIsUploadingCover(true);
      const url = await onUploadCover(imageUri);
      setFormData({ ...formData, coverImageUrl: url });
      Alert.alert('Success', 'Cover image updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
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
      {/* Avatar Section */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Profile Picture</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar
            source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined}
            name={formData.gamerTag}
            size="xl"
            shape="circle"
          />
          {onUploadAvatar && (
            <ImagePicker
              images={formData.avatarUrl ? [formData.avatarUrl] : []}
              onImagesChange={(images) => {
                if (images.length > 0) {
                  handleAvatarUpload(images[0]);
                }
              }}
              maxCount={1}
              /* device picker built-in */
              isLoading={isUploadingAvatar}
            />
          )}
        </View>
      </View>

      {/* Basic Info */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Basic Information</Text>
        <Input
          label="Gamer Tag"
          value={formData.gamerTag}
          onChangeText={(text) => setFormData({ ...formData, gamerTag: text })}
          placeholder="Enter your gamer tag"
          error={errors.gamerTag}
          required
          style={{ marginBottom: 12 }}
        />
        <Input
          label="Username"
          value={formData.username}
          onChangeText={(text) => setFormData({ ...formData, username: text })}
          placeholder="Enter your username"
          error={errors.username}
          required
          style={{ marginBottom: 12 }}
        />
        <TextArea
          label="Bio"
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          placeholder="Tell us about yourself..."
          maxLength={160}
          showCharCount
          error={errors.bio}
          style={{ marginBottom: 12 }}
        />
      </View>

      {/* Gaming Identity */}
      <View style={sectionStyle}>
        <Text style={sectionTitleStyle}>Gaming Identity</Text>
        <Input
          label="Gamer tag"
          value={formData.gamerTag}
          onChangeText={(gamerTag) => setFormData({ ...formData, gamerTag })}
          placeholder="Your in-game name"
          style={{ marginBottom: 12 }}
        />
        <Input
          label="Favorite games"
          value={formData.favoriteGames}
          onChangeText={(favoriteGames) => setFormData({ ...formData, favoriteGames })}
          placeholder="Valorant, LoL, ..."
          style={{ marginBottom: 12 }}
        />
      </View>

      <Button
        title={isSubmitting ? 'Saving...' : 'Save profile'}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
};

export default EditProfileForm;
