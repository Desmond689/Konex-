/**
 * KONEX EditProfileScreen
 * Billion Dollar Code - Production Ready
 * 
 * Edit profile screen with form validation
 * 
 * Usage:
 * <EditProfileScreen navigation={navigation} />
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    TextStyle,
    View,
    ViewStyle,
    Text,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import TextArea from '../../../components/atoms/TextArea';
import Dropdown from '../../../components/molecules/Dropdown';
import ImagePicker from '../../../components/molecules/ImagePicker';
import { promptPickImageFromDevice } from '../../../utils/pickFromDevice';
import storage from '../../../api/storage';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { trackEvent } from '../../../config/analytics';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useUser } from '../../../hooks/useUser';

// ============================================
// 1. TYPES
// ============================================

export interface EditProfileScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar, uploadCover } = useUser(user?.id || '');

  const [formData, setFormData] = useState({
    gamerTag: '',
    username: '',
    bio: '',
    gamingStyle: 'Casual' as 'Competitive' | 'Casual' | 'Ranked' | 'Clan' | 'Social',
    skillLevel: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro',
    role: 'Flex' as 'Sniper' | 'Rusher' | 'Support' | 'Flex',
    avatarUrl: null as string | null,
    coverImageUrl: null as string | null,
  });

  const [errors, setErrors] = useState({
    gamerTag: '',
    username: '',
    bio: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        gamerTag: profile.gamer_tag || '',
        username: profile.username || '',
        bio: profile.bio || '',
        gamingStyle: profile.gaming_style || 'Casual',
        skillLevel: profile.skill_level || 'Intermediate',
        role: profile.role || 'Flex',
        avatarUrl: profile.avatar_url || null,
        coverImageUrl: profile.cover_image_url || null,
      });
    }
  }, [profile]);

  // Gaming style options
  const gamingStyles = [
    { label: '🎯 Competitive', value: 'Competitive' },
    { label: '🎮 Casual', value: 'Casual' },
    { label: '📈 Ranked', value: 'Ranked' },
    { label: '🛡️ Clan', value: 'Clan' },
    { label: '🤝 Social', value: 'Social' },
  ];

  const skillLevels = [
    { label: '🌱 Beginner', value: 'Beginner' },
    { label: '📈 Intermediate', value: 'Intermediate' },
    { label: '⚡ Advanced', value: 'Advanced' },
    { label: '🏆 Pro', value: 'Pro' },
  ];

  const roles = [
    { label: '🎯 Sniper', value: 'Sniper' },
    { label: '🏃 Rusher', value: 'Rusher' },
    { label: '🛡️ Support', value: 'Support' },
    { label: '🔄 Flex', value: 'Flex' },
  ];

  // ============================================
  // VALIDATION
  // ============================================

  const validate = (): boolean => {
    const newErrors = {
      gamerTag: '',
      username: '',
      bio: '',
    };
    let isValid = true;

    if (!formData.gamerTag.trim()) {
      newErrors.gamerTag = 'Gamer tag is required';
      isValid = false;
    } else if (formData.gamerTag.length < 3) {
      newErrors.gamerTag = 'Gamer tag must be at least 3 characters';
      isValid = false;
    } else if (formData.gamerTag.length > 15) {
      newErrors.gamerTag = 'Gamer tag must be less than 15 characters';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
      isValid = false;
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be less than 160 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      await updateProfile({
        gamer_tag: formData.gamerTag.trim(),
        username: formData.username.trim(),
        bio: formData.bio || null,
        gaming_style: formData.gamingStyle,
        skill_level: formData.skillLevel,
        role: formData.role,
        avatar_url: formData.avatarUrl,
        cover_image_url: formData.coverImageUrl,
      });

      trackEvent('profile_edit', {
        fields: Object.keys(formData),
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (localUri: string) => {
    if (!localUri || localUri.startsWith('http://') || localUri.startsWith('https://')) {
      // Only device local URIs (file:// or content://) allowed as source
      if (localUri.startsWith('http')) {
        Alert.alert('Not allowed', 'Paste URLs are disabled. Choose a photo from this device.');
        return;
      }
    }
    try {
      setIsUploadingAvatar(true);
      let url: string;
      if (uploadAvatar) {
        url = await uploadAvatar(localUri);
      } else {
        const result = await storage.uploadFile(
          { uri: localUri, name: `avatar_${Date.now()}.jpg`, type: 'image/jpeg' },
          { bucket: 'avatars', upsert: true }
        );
        url = result.url;
      }
      setFormData({ ...formData, avatarUrl: url });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar from device');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (localUri: string) => {
    if (!localUri) return;
    if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
      Alert.alert('Not allowed', 'Paste URLs are disabled. Choose a photo from this device.');
      return;
    }
    try {
      setIsUploadingCover(true);
      let url: string;
      if (uploadCover) {
        url = await uploadCover(localUri);
      } else {
        const result = await storage.uploadFile(
          { uri: localUri, name: `cover_${Date.now()}.jpg`, type: 'image/jpeg' },
          { bucket: 'avatars', folder: 'covers', upsert: true }
        );
        url = result.url;
      }
      setFormData({ ...formData, coverImageUrl: url });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload cover from device');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    padding: 16,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  };

  if (isLoading || isSaving) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          {isLoading ? 'Loading profile...' : 'Saving changes...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Edit Profile"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={contentStyle} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={{ marginBottom: 16 }}>
            <Text style={sectionTitleStyle}>Profile Picture</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Avatar
                source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined}
                name={formData.gamerTag}
                size="xl"
                shape="circle"
                borderWidth={3}
                borderColor={colors.surface}
              />
              <ImagePicker
                images={formData.avatarUrl ? [formData.avatarUrl] : []}
                onImagesChange={handleAvatarUpload}
                maxCount={1}
                /* device picker is built into ImagePicker */
                isLoading={isUploadingAvatar}
              />
            </View>
          </View>

          {/* Basic Info */}
          <View style={{ marginBottom: 16 }}>
            <Text style={sectionTitleStyle}>Basic Information</Text>

            <Input
              label="Gamer Tag"
              value={formData.gamerTag}
              onChangeText={(text) => {
                setFormData({ ...formData, gamerTag: text });
                setErrors({ ...errors, gamerTag: '' });
              }}
              placeholder="Enter your gamer tag"
              error={errors.gamerTag}
              required
              style={{ marginBottom: 12 }}
            />

            <Input
              label="Username"
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                setErrors({ ...errors, username: '' });
              }}
              placeholder="Enter your username"
              error={errors.username}
              required
              style={{ marginBottom: 12 }}
            />

            <TextArea
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => {
                setFormData({ ...formData, bio: text });
                setErrors({ ...errors, bio: '' });
              }}
              placeholder="Tell us about yourself..."
              maxLength={160}
              showCharCount
              error={errors.bio}
              style={{ marginBottom: 8 }}
            />
          </View>

          {/* Gaming Identity */}
          <View style={{ marginBottom: 16 }}>
            <Text style={sectionTitleStyle}>Gaming Identity</Text>

            <Dropdown
              label="Gaming Style"
              items={gamingStyles}
              selectedValue={formData.gamingStyle}
              onSelect={(value) => setFormData({ ...formData, gamingStyle: value })}
              containerStyle={{ marginBottom: 12 }}
            />

            <Dropdown
              label="Skill Level"
              items={skillLevels}
              selectedValue={formData.skillLevel}
              onSelect={(value) => setFormData({ ...formData, skillLevel: value })}
              containerStyle={{ marginBottom: 12 }}
            />

            <Dropdown
              label="Role"
              items={roles}
              selectedValue={formData.role}
              onSelect={(value) => setFormData({ ...formData, role: value })}
              containerStyle={{ marginBottom: 12 }}
            />
          </View>

          {/* Cover Image */}
          <View style={{ marginBottom: 16 }}>
            <Text style={sectionTitleStyle}>Cover Image</Text>
            <ImagePicker
              images={formData.coverImageUrl ? [formData.coverImageUrl] : []}
              onImagesChange={handleCoverUpload}
              maxCount={1}
              /* device picker is built into ImagePicker */
              isLoading={isUploadingCover}
            />
          </View>

          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleSubmit}
            loading={isSaving}
            fullWidth
            size="lg"
            style={{ marginBottom: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;