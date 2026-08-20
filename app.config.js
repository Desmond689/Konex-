require('dotenv').config();

const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expo = appJson.expo || {};

  const basePlugins = (expo.plugins || []).filter((p) => {
    if (p === 'expo-build-properties') return false;
    if (Array.isArray(p) && p[0] === 'expo-build-properties') return false;
    if (typeof p === 'string' && p.includes('withAndroidBuildFixes')) return false;
    return true;
  });

  return {
    ...config,
    ...expo,
    plugins: [
      ...basePlugins,
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,   // ← changed from 35 to 34
            targetSdkVersion: 34,
            minSdkVersion: 23,
            kotlinVersion: '1.9.23',
          },
        },
      ],
    ],
    extra: {
      ...(config && config.extra ? config.extra : {}),
      ...(expo.extra || {}),
      eas: {
        projectId: '98e59225-51dc-4c70-95dd-7293dee1b118',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    },
  };
};