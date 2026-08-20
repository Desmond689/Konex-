// src/config/env.config.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ============================================
// 1. ENVIRONMENT VARIABLES
// ============================================

const ENV = Constants.expoConfig?.extra || {};

export const SUPABASE_URL = ENV.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = ENV.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const SENTRY_DSN = ENV.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN || '';
export const ONE_SIGNAL_APP_ID = ENV.oneSignalAppId || process.env.EXPO_PUBLIC_ONE_SIGNAL_APP_ID || '';
export const APP_ENVIRONMENT = ENV.environment || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
export const APP_NAME = Constants.expoConfig?.name || 'KONEX';
export const APP_SCHEME = 'konex';

// ============================================
// 2. ENVIRONMENT FLAGS
// ============================================

export const IS_PRODUCTION = APP_ENVIRONMENT === 'production';
export const IS_STAGING = APP_ENVIRONMENT === 'staging';
export const IS_DEVELOPMENT = APP_ENVIRONMENT === 'development';
export const IS_TEST = APP_ENVIRONMENT === 'test';

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';
export const IS_WEB = Platform.OS === 'web';

// ============================================
// 3. FEATURE FLAGS
// ============================================

export const FEATURES = {
  enableTournaments: true,
  enableStories: true,
  enableLFG: true,
  enableBadges: true,
  enableRealtime: true,
  enablePushNotifications: !IS_DEVELOPMENT && !!ONE_SIGNAL_APP_ID,
  enableAnalytics: IS_PRODUCTION,
  enableSentry: IS_PRODUCTION && !!SENTRY_DSN,
  enableDeepLinking: true,
  enableSocialLogin: false,
};

// ============================================
// 4. VALIDATION
// ============================================

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Never throw at module load — that force-quits the APK on open.
  console.warn('⚠️ Missing Supabase environment variables — auth/API disabled until configured');
}

// ============================================
// 5. CONFIG LOGGING
// ============================================

if (IS_DEVELOPMENT) {
  console.log('🔧 KONEX Configuration:', {
    environment: APP_ENVIRONMENT,
    version: APP_VERSION,
    platform: Platform.OS,
    supabaseUrl: SUPABASE_URL ? '✅ Set' : '❌ Missing',
    supabaseAnonKey: SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    features: FEATURES,
  });
}