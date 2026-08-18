/**
 * KONEX AttachmentPicker Component
 * Billion Dollar Code - Production Ready
 * 
 * A component for picking and previewing attachments in chat
 * 
 * Usage:
 * <AttachmentPicker
 *   onSend={(attachments) => handleSend(attachments)}
 *   maxAttachments={5}
 * />
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTheme } from '../../../hooks/useTheme';
import Card from '../../atoms/Card';
import Icon from '../../atoms/Icon';

// ============================================
// 1. TYPES
// ============================================

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'voice';
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
  duration?: number;
}

export interface AttachmentPickerProps {
  /** On send attachments handler */
  onSend: (attachments: Attachment[]) => void;
  /** Maximum number of attachments */
  maxAttachments?: number;
  /** Maximum file size in MB */
  maxFileSize?: number;
  /** Allowed attachment types */
  allowedTypes?: ('image' | 'video' | 'document' | 'voice')[];
  /** Is sending */
  isSending?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  onSend,
  maxAttachments = 5,
  maxFileSize = 10,
  allowedTypes = ['image', 'video', 'document'],
  isSending = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { requestGallery, requestCamera } = usePermissions();

  const addAttachments = (newAttachments: Attachment[]) => {
    const remaining = maxAttachments - attachments.length;
    const toAdd = newAttachments.slice(0, remaining);
    setAttachments([...attachments, ...toAdd]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if (attachments.length === 0) return;
    onSend(attachments);
    setAttachments([]);
  };

  const pickImage = async () => {
    const hasPermission = await requestGallery();
    if (!hasPermission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your gallery.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxAttachments - attachments.length,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset) => ({
          id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          type: asset.type === 'video' ? 'video' : 'image',
          uri: asset.uri,
          name: asset.fileName || `file_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || undefined,
          duration: asset.duration || undefined,
        }));
        addAttachments(newAttachments);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset) => ({
          id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          type: 'document',
          uri: asset.uri || '',
          name: asset.name || 'document.pdf',
          size: asset.size || 0,
          mimeType: asset.mimeType || undefined,
        }));
        addAttachments(newAttachments);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCamera();
    if (!hasPermission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || undefined,
        };
        addAttachments([newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttachment = ({ item }: { item: Attachment }) => (
    <Card style={{ marginRight: 8, padding: 4, position: 'relative', width: 80, height: 80 }}>
      {item.type === 'image' ? (
        <Image
          source={{ uri: item.uri }}
          style={{ width: '100%', height: '100%', borderRadius: 4 }}
        />
      ) : item.type === 'video' ? (
        <View style={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="play-circle" size={32} color={colors.primary} />
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Video</Text>
        </View>
      ) : (
        <View style={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="file" size={32} color={colors.primary} />
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          backgroundColor: colors.error,
          borderRadius: 12,
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => removeAttachment(item.id)}
      >
        <Icon name="x" size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </Card>
  );

  const containerStyle: ViewStyle = {
    ...style,
  };

  const actionButtonStyle: ViewStyle = {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
    minWidth: 60,
  };

  const actionTextStyle: TextStyle = {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {attachments.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <FlatList
            data={attachments}
            keyExtractor={(item) => item.id}
            renderItem={renderAttachment}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending || attachments.length === 0}
            style={{
              backgroundColor: isSending ? colors.disabled : colors.primary,
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Send ({attachments.length})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {allowedTypes.includes('image') && (
          <TouchableOpacity style={actionButtonStyle} onPress={pickImage}>
            <Icon name="image" size={24} color={colors.primary} />
            <Text style={actionTextStyle}>Gallery</Text>
          </TouchableOpacity>
        )}
        {allowedTypes.includes('image') && (
          <TouchableOpacity style={actionButtonStyle} onPress={takePhoto}>
            <Icon name="camera" size={24} color={colors.primary} />
            <Text style={actionTextStyle}>Camera</Text>
          </TouchableOpacity>
        )}
        {allowedTypes.includes('document') && (
          <TouchableOpacity style={actionButtonStyle} onPress={pickDocument}>
            <Icon name="file" size={24} color={colors.primary} />
            <Text style={actionTextStyle}>Document</Text>
          </TouchableOpacity>
        )}
        {allowedTypes.includes('video') && (
          <TouchableOpacity style={actionButtonStyle} onPress={pickImage}>
            <Icon name="video" size={24} color={colors.primary} />
            <Text style={actionTextStyle}>Video</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AttachmentPicker;