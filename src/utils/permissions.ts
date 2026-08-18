import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function requestCameraPermission(): Promise<boolean> {
  const cur = await ImagePicker.getCameraPermissionsAsync();
  if (cur.granted) return true;
  const req = await ImagePicker.requestCameraPermissionsAsync();
  if (!req.granted) {
    Alert.alert('Permission needed', 'Camera access is required.');
  }
  return req.granted;
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const cur = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (cur.granted) return true;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!req.granted) {
    Alert.alert('Permission needed', 'Photo library access is required.');
  }
  return req.granted;
}

export async function requestNotificationPermission(): Promise<boolean> {
  // Expo notifications optional — return false until expo-notifications is configured
  return false;
}
