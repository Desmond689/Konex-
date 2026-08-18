/**
 * KONEX Push Notifications Library
 * Billion Dollar Code - Production Ready
 * 
 * Wrapper for expo-notifications with registration and handling
 * 
 * Usage:
 * import { registerForPushNotifications, sendNotification } from '@lib/pushNotifications';
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { supabase } from '../api/client/supabase.client';
import { logger } from '../core/logger/logger.service';

// ============================================
// 1. TYPES
// ============================================

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

export interface PushNotificationToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
}

// ============================================
// 2. INITIALIZATION
// ============================================

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications
 */
export const registerForPushNotifications = async (
  userId?: string
): Promise<PushNotificationToken | null> => {
  try {
    // Check if device is physical
    if (!Device.isDevice) {
      Alert.alert('Physical Device Required', 'Push notifications require a physical device.');
      return null;
    }

    // Check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Push notifications require permission.');
      return null;
    }

    // Get token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.manifest?.extra?.eas?.projectId;
    
    if (!projectId) {
      logger.warn('⚠️ EAS project ID not found, push notifications disabled');
      return null;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    const pushToken = token.data;

    if (!pushToken) {
      logger.warn('⚠️ No push token received');
      return null;
    }

    const deviceId = await Notifications.getDevicePushTokenAsync();

    // Save token to backend
    if (userId) {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token: pushToken,
          device_id: deviceId.data,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('❌ Failed to save push token', { error });
      }
    }

    logger.info('📱 Push notification registered', { pushToken });

    return {
      token: pushToken,
      deviceId: deviceId.data,
      platform: Platform.OS,
    };
  } catch (error) {
    logger.error('❌ Failed to register for push notifications', { error });
    return null;
  }
};

/**
 * Send a push notification
 */
export const sendNotification = async (data: PushNotificationData): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data.data,
        sound: data.sound || 'default',
        badge: data.badge || 1,
      },
      trigger: null, // Send immediately
    });

    logger.info('📤 Push notification sent', { title: data.title });
  } catch (error) {
    logger.error('❌ Failed to send notification', { error });
  }
};

/**
 * Schedule a notification for a future time
 */
export const scheduleNotification = async (
  data: PushNotificationData,
  date: Date
): Promise<string | null> => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data.data,
        sound: data.sound || 'default',
        badge: data.badge || 1,
      },
      trigger: {
        date,
      },
    });

    logger.info('📅 Notification scheduled', { identifier, date });
    return identifier;
  } catch (error) {
    logger.error('❌ Failed to schedule notification', { error });
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    logger.info('📅 Notification cancelled', { identifier });
  } catch (error) {
    logger.error('❌ Failed to cancel notification', { error });
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('📅 All notifications cancelled');
  } catch (error) {
    logger.error('❌ Failed to cancel all notifications', { error });
  }
};

/**
 * Get notification permission status
 */
export const getNotificationPermissions = async (): Promise<Notifications.NotificationPermissionsStatus> => {
  try {
    return await Notifications.getPermissionsAsync();
  } catch (error) {
    logger.error('❌ Failed to get notification permissions', { error });
    return {
      status: 'undetermined',
      canAskAgain: true,
      expires: 'never',
      granted: false,
    };
  }
};

/**
 * Add notification response listener
 */
export const addNotificationListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

// ============================================
// 3. DEFAULT EXPORT
// ============================================

export default {
  registerForPushNotifications,
  sendNotification,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  getNotificationPermissions,
  addNotificationListener,
  addNotificationReceivedListener,
};