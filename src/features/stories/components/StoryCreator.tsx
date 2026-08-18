/**
 * KONEX StoryCreator Component
 * Billion Dollar Code - Production Ready
 * 
 * A component for creating a new story with media picker
 * 
 * Usage:
 * <StoryCreator
 *   onCreateStory={handleCreateStory}
 *   isLoading={isLoading}
 * />
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Avatar from '../../../components/atoms/Avatar';
import Button from '../../../components/atoms/Button';
import Icon from '../../../components/atoms/Icon';
import Input from '../../../components/atoms/Input';
import Modal from '../../../components/atoms/Modal';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface StoryCreatorProps {
  /** On create story handler */
  onCreateStory: (mediaUri: string, type: 'image' | 'video', text?: string) => Promise<void>;
  /** User's gamer tag */
  gamerTag: string;
  /** User's avatar URL */
  avatarUrl?: string | null;
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

export const StoryCreator: React.FC<StoryCreatorProps> = ({
  onCreateStory,
  gamerTag,
  avatarUrl,
  isLoading = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestCamera, requestGallery } = usePermissions();

  const handlePickImage = async () => {
    const hasPermission = await requestGallery();
    if (!hasPermission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your gallery.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCamera();
    if (!hasPermission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickVideo = async () => {
    const hasPermission = await requestGallery();
    if (!hasPermission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your gallery.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType('video');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleSubmit = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select an image or video');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateStory(selectedMedia, mediaType, text || undefined);
      setIsModalVisible(false);
      setSelectedMedia(null);
      setText('');
      Alert.alert('Success', 'Story posted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: ViewStyle = {
    ...style,
  };

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  };

  const buttonTextStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  };

  const previewStyle: ViewStyle = {
    alignItems: 'center',
    paddingVertical: 16,
  };

  const previewMediaStyle: ViewStyle = {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const previewImageStyle: ViewStyle = {
    width: '100%',
    height: '100%',
  };

  const previewTextStyle: TextStyle = {
    fontSize: 14,
    color: colors.textMuted,
  };

  return (
    <View style={containerStyle} testID={testID}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={() => setIsModalVisible(true)}
        disabled={isLoading}
      >
        <Icon name="plus" size={20} color="#FFFFFF" />
        <Text style={buttonTextStyle}>Create Story</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Create Story"
        contentStyle={{ maxWidth: 400 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Avatar
            source={avatarUrl ? { uri: avatarUrl } : undefined}
            name={gamerTag}
            size="md"
            shape="circle"
          />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 10 }}>
            {gamerTag}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 6 }}>
            • Posting to story
          </Text>
        </View>

        {/* Media Picker Options */}
        {!selectedMedia && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 16,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handlePickImage}
            >
              <Icon name="image" size={24} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 16,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handleTakePhoto}
            >
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 16,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handlePickVideo}
            >
              <Icon name="video" size={24} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Preview */}
        {selectedMedia && (
          <View style={previewStyle}>
            <View style={previewMediaStyle}>
              {mediaType === 'image' ? (
                <Image source={{ uri: selectedMedia }} style={previewImageStyle} resizeMode="cover" />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Icon name="play-circle" size={48} color={colors.primary} />
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>Video selected</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => setSelectedMedia(null)}
            >
              <Text style={{ fontSize: 12, color: colors.error }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Text Input */}
        <Input
          placeholder="Add text to your story..."
          value={text}
          onChangeText={setText}
          maxLength={100}
          style={{ marginTop: 8 }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsModalVisible(false)}
            style={{ marginRight: 8 }}
          />
          <Button
            title="Share to Story"
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting || isLoading}
            disabled={!selectedMedia}
          />
        </View>
      </Modal>
    </View>
  );
};

export default StoryCreator;