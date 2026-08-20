// @ts-nocheck
/**
 * KONEX usePermissions Hook
 * Billion Dollar Code - Production Ready
 * 
 * Handles permission requests and status
 * 
 * Usage:
 * const { camera, gallery, microphone, requestPermission } = usePermissions();
 */

import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { trackEvent } from '../config/analytics';
import { logger } from '../core/logger/logger.service';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined' | 'limited';
  reason?: string;
}

export interface UsePermissionsReturn {
  camera: PermissionStatus;
  gallery: PermissionStatus;
  microphone: PermissionStatus;
  notifications: PermissionStatus;
  location: PermissionStatus;
  isRequesting: boolean;
  requestCamera: () => Promise<PermissionStatus>;
  requestGallery: () => Promise<PermissionStatus>;
  requestMicrophone: () => Promise<PermissionStatus>;
  requestNotifications: () => Promise<PermissionStatus>;
  requestLocation: () => Promise<PermissionStatus>;
  requestAll: () => Promise<Record<string, PermissionStatus>>;
  openSettings: () => Promise<void>;
  reset: () => void;
}

const initialPermission: PermissionStatus = {
  granted: false,
  canAskAgain: true,
  status: 'undetermined',
};

export const usePermissions = (): UsePermissionsReturn => {
  const [camera, setCamera] = useState<PermissionStatus>(initialPermission);
  const [gallery, setGallery] = useState<PermissionStatus>(initialPermission);
  const [microphone, setMicrophone] = useState<PermissionStatus>(initialPermission);
  const [notifications, setNotifications] = useState<PermissionStatus>(initialPermission);
  const [location, setLocation] = useState<PermissionStatus>(initialPermission);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  // ============================================
  // CHECK PERMISSIONS
  // ============================================

  const checkCameraPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status: status,
      };
    } catch (error) {
      logger.error('❌ Check camera permission error', error);
      return initialPermission;
    }
  }, []);

  const checkGalleryPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
        status: status,
      };
    } catch (error) {
      logger.error('❌ Check gallery permission error', error);
      return initialPermission;
    }
  }, []);

  const checkMicrophonePermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return {
          granted: result,
          canAskAgain: true,
          status: result ? 'granted' : 'denied',
        };
      } else {
        // iOS - using ImagePicker for microphone
        const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
        return {
          granted: status === 'granted',
          canAskAgain,
          status: status,
        };
      }
    } catch (error) {
      logger.error('❌ Check microphone permission error', error);
      return initialPermission;
    }
  }, []);

  const checkNotificationsPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status,
      };
    } catch (error) {
      logger.error('❌ Check notifications permission error', error);
      return initialPermission;
    }
  }, []);

  const checkLocationPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return {
          granted: result,
          canAskAgain: true,
          status: result ? 'granted' : 'denied',
        };
      } else {
        return {
          granted: false,
          canAskAgain: true,
          status: 'undetermined',
        };
      }
    } catch (error) {
      logger.error('❌ Check location permission error', error);
      return initialPermission;
    }
  }, []);

  // ============================================
  // REQUEST PERMISSIONS
  // ============================================

  const requestCamera = useCallback(async (): Promise<PermissionStatus> => {
    try {
      setIsRequesting(true);
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      const result = {
        granted: status === 'granted',
        canAskAgain,
        status: status,
      };
      setCamera(result);

      trackEvent('permission_request', { type: 'camera', status });
      return result;
    } catch (error) {
      logger.error('❌ Request camera permission error', error);
      return initialPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestGallery = useCallback(async (): Promise<PermissionStatus> => {
    try {
      setIsRequesting(true);
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = {
        granted: status === 'granted',
        canAskAgain,
        status: status,
      };
      setGallery(result);

      trackEvent('permission_request', { type: 'gallery', status });
      return result;
    } catch (error) {
      logger.error('❌ Request gallery permission error', error);
      return initialPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestMicrophone = useCallback(async (): Promise<PermissionStatus> => {
    try {
      setIsRequesting(true);
      let result: PermissionStatus;

      if (Platform.OS === 'android') {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        result = {
          granted: status === PermissionsAndroid.RESULTS.GRANTED,
          canAskAgain: status !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          status: status,
        };
      } else {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
        result = {
          granted: status === 'granted',
          canAskAgain,
          status: status,
        };
      }
      setMicrophone(result);

      trackEvent('permission_request', { type: 'microphone', status: result.status });
      return result;
    } catch (error) {
      logger.error('❌ Request microphone permission error', error);
      return initialPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestNotifications = useCallback(async (): Promise<PermissionStatus> => {
    try {
      setIsRequesting(true);
      const { status } = await Notifications.requestPermissionsAsync();
      const result = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status,
      };
      setNotifications(result);

      trackEvent('permission_request', { type: 'notifications', status });
      return result;
    } catch (error) {
      logger.error('❌ Request notifications permission error', error);
      return initialPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<PermissionStatus> => {
    try {
      setIsRequesting(true);
      let result: PermissionStatus;

      if (Platform.OS === 'android') {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        result = {
          granted: status === PermissionsAndroid.RESULTS.GRANTED,
          canAskAgain: status !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          status: status,
        };
      } else {
        result = {
          granted: false,
          canAskAgain: true,
          status: 'undetermined',
        };
      }
      setLocation(result);

      trackEvent('permission_request', { type: 'location', status: result.status });
      return result;
    } catch (error) {
      logger.error('❌ Request location permission error', error);
      return initialPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestAll = useCallback(async (): Promise<Record<string, PermissionStatus>> => {
    const results = {
      camera: await requestCamera(),
      gallery: await requestGallery(),
      microphone: await requestMicrophone(),
      notifications: await requestNotifications(),
      location: await requestLocation(),
    };

    trackEvent('permission_request_all', {
      camera: results.camera.status,
      gallery: results.gallery.status,
      microphone: results.microphone.status,
      notifications: results.notifications.status,
      location: results.location.status,
    });

    return results;
  }, [requestCamera, requestGallery, requestMicrophone, requestNotifications, requestLocation]);

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await Linking.openSettings();
    } catch (error) {
      logger.error('❌ Open settings error', error);
    }
  }, []);

  const reset = useCallback(() => {
    setCamera(initialPermission);
    setGallery(initialPermission);
    setMicrophone(initialPermission);
    setNotifications(initialPermission);
    setLocation(initialPermission);
    setIsRequesting(false);
  }, []);

  // ============================================
  // INITIAL CHECK
  // ============================================

  useEffect(() => {
    const checkAll = async () => {
      const [cameraStatus, galleryStatus, micStatus, notifStatus, locStatus] = await Promise.all([
        checkCameraPermission(),
        checkGalleryPermission(),
        checkMicrophonePermission(),
        checkNotificationsPermission(),
        checkLocationPermission(),
      ]);

      setCamera(cameraStatus);
      setGallery(galleryStatus);
      setMicrophone(micStatus);
      setNotifications(notifStatus);
      setLocation(locStatus);
    };

    checkAll();
  }, []);

  return {
    camera,
    gallery,
    microphone,
    notifications,
    location,
    isRequesting,
    requestCamera,
    requestGallery,
    requestMicrophone,
    requestNotifications,
    requestLocation,
    requestAll,
    openSettings,
    reset,
  };
};

export default usePermissions;