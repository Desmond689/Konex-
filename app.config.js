/**
 * Dynamic Expo config for KONEX.
 *
 * Loads environment variables from .env
 * and merges them with the static configuration in app.json.
 */

require('dotenv').config();

const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expo = appJson.expo || {};

  return {
    ...config,
    ...expo,

    plugins: [
      ...(expo.plugins || []),

      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            kotlinVersion: "1.9.23",
            minSdkVersion: 23,
          },
        },
      ],
    ],

    extra: {
      ...(config?.extra || {}),
      ...(expo.extra || {}),

      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL || '',

      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

      sentryDsn:
        process.env.EXPO_PUBLIC_SENTRY_DSN || '',

      oneSignalAppId:
        process.env.EXPO_PUBLIC_ONE_SIGNAL_APP_ID || '',

      segmentWriteKey:
        process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',

      environment:
        process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',

      appVersion:
        process.env.EXPO_PUBLIC_APP_VERSION ||
        expo.version ||
        '1.0.0',

      appName:
        process.env.EXPO_PUBLIC_APP_NAME ||
        expo.name ||
        'KONEX',

      appScheme:
        process.env.EXPO_PUBLIC_APP_SCHEME ||
        expo.scheme ||
        'konex',
    },
  };
};