/**
 * Device-only media pickers. No URL pasting.
 */
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type DeviceImageResult = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
};

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!req.granted) {
    Alert.alert(
      'Permission needed',
      'Allow photo library access so you can upload images from this device.'
    );
    return false;
  }
  return true;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const req = await ImagePicker.requestCameraPermissionsAsync();
  if (!req.granted) {
    Alert.alert('Permission needed', 'Allow camera access to take a photo.');
    return false;
  }
  return true;
}

/** Pick one image from the device library (not a remote URL). */
export async function pickImageFromDevice(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<DeviceImageResult | null> {
  if (!(await ensureLibraryPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.85,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `photo_${Date.now()}.jpg`,
    width: asset.width,
    height: asset.height,
  };
}

/** Take a photo with the device camera. */
export async function takePhotoWithDevice(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<DeviceImageResult | null> {
  if (!(await ensureCameraPermission())) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.85,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `camera_${Date.now()}.jpg`,
    width: asset.width,
    height: asset.height,
  };
}

/** Image or video from device library. */
export async function pickMediaFromDevice(kind: 'images' | 'videos' | 'all' = 'images'): Promise<DeviceImageResult | null> {
  if (!(await ensureLibraryPermission())) return null;

  const mediaTypes =
    kind === 'videos'
      ? ImagePicker.MediaTypeOptions.Videos
      : kind === 'all'
        ? ImagePicker.MediaTypeOptions.All
        : ImagePicker.MediaTypeOptions.Images;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    quality: 0.85,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName || `media_${Date.now()}`,
    width: asset.width,
    height: asset.height,
  };
}

/** Let user choose Library or Camera (device only). */
export function promptPickImageFromDevice(
  onPicked: (file: DeviceImageResult) => void,
  options?: { allowsEditing?: boolean; aspect?: [number, number] }
): void {
  Alert.alert('Upload from device', 'Choose a source on this device. Remote URLs are not allowed.', [
    {
      text: 'Photo library',
      onPress: async () => {
        const file = await pickImageFromDevice(options);
        if (file) onPicked(file);
      },
    },
    {
      text: 'Camera',
      onPress: async () => {
        const file = await takePhotoWithDevice(options);
        if (file) onPicked(file);
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export const isRemoteHttpUrl = (value: string) => /^https?:\/\//i.test(value.trim());
