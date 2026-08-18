/**
 * KONEX ImagePicker Library
 * Billion Dollar Code - Production Ready
 * 
 * Wrapper for expo-image-picker with permissions and compression
 * 
 * Usage:
 * import { pickImage, takePhoto, pickVideo } from '@lib/imagePicker';
 */

import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface ImagePickerOptions {
  /** Max width for compression */
  maxWidth?: number;
  /** Max height for compression */
  maxHeight?: number;
  /** Image quality (0-1) */
  quality?: number;
  /** Allowed file types */
  mediaTypes?: ImagePicker.MediaTypeOptions;
  /** Allows editing */
  allowsEditing?: boolean;
  /** Aspect ratio for cropping */
  aspect?: [number, number];
}

export interface PickedImage {
  /** Local URI */
  uri: string;
  /** File name */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** MIME type */
  mimeType?: string;
  /** Base64 data (if requested) */
  base64?: string;
}

// ============================================
// 2. PERMISSIONS
// ============================================

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to take photos.'
      );
      return false;
    }
    return true;
  } catch (error) {
    logger.error('❌ Failed to request camera permission', { error });
    return false;
  }
};

/**
 * Request gallery permissions
 */
export const requestGalleryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your gallery to select images.'
      );
      return false;
    }
    return true;
  } catch (error) {
    logger.error('❌ Failed to request gallery permission', { error });
    return false;
  }
};

// ============================================
// 3. IMAGE PICKING
// ============================================

/**
 * Pick an image from gallery
 */
export const pickImage = async (options: ImagePickerOptions = {}): Promise<PickedImage | null> => {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) return null;

  const {
    maxWidth = 1080,
    maxHeight = 1920,
    quality = 0.8,
    mediaTypes = ImagePicker.MediaTypeOptions.Images,
    allowsEditing = true,
    aspect = [4, 3],
  } = options;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing,
      aspect,
      quality,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let uri = asset.uri;

    // Compress image if needed
    if (asset.width && asset.height && (asset.width > maxWidth || asset.height > maxHeight)) {
      const manipulated = await manipulateAsync(
        uri,
        [
          {
            resize: {
              width: Math.min(asset.width, maxWidth),
              height: Math.min(asset.height, maxHeight),
            },
          },
        ],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );
      uri = manipulated.uri;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);

    return {
      uri,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: fileInfo.size,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType || 'image/jpeg',
    };
  } catch (error) {
    logger.error('❌ Failed to pick image', { error });
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
};

/**
 * Take a photo with camera
 */
export const takePhoto = async (options: ImagePickerOptions = {}): Promise<PickedImage | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const {
    maxWidth = 1080,
    maxHeight = 1920,
    quality = 0.8,
    allowsEditing = true,
    aspect = [4, 3],
  } = options;

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing,
      aspect,
      quality,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let uri = asset.uri;

    // Compress image if needed
    if (asset.width && asset.height && (asset.width > maxWidth || asset.height > maxHeight)) {
      const manipulated = await manipulateAsync(
        uri,
        [
          {
            resize: {
              width: Math.min(asset.width, maxWidth),
              height: Math.min(asset.height, maxHeight),
            },
          },
        ],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );
      uri = manipulated.uri;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);

    return {
      uri,
      fileName: `photo_${Date.now()}.jpg`,
      fileSize: fileInfo.size,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType || 'image/jpeg',
    };
  } catch (error) {
    logger.error('❌ Failed to take photo', { error });
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
};

/**
 * Pick a video from gallery
 */
export const pickVideo = async (options: ImagePickerOptions = {}): Promise<PickedImage | null> => {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) return null;

  const { mediaTypes = ImagePicker.MediaTypeOptions.Videos } = options;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);

    return {
      uri: asset.uri,
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
      fileSize: fileInfo.size,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType || 'video/mp4',
    };
  } catch (error) {
    logger.error('❌ Failed to pick video', { error });
    Alert.alert('Error', 'Failed to pick video');
    return null;
  }
};

/**
 * Get image as base64
 */
export const getImageBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    logger.error('❌ Failed to get image base64', { error });
    return null;
  }
};

// ============================================
// 4. DEFAULT EXPORT
// ============================================

export default {
  pickImage,
  takePhoto,
  pickVideo,
  getImageBase64,
  requestCameraPermission,
  requestGalleryPermission,
};