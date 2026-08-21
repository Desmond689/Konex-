/**
 * EAS/Android build fixes for Expo SDK 51 + Media3 + AGP 8.2
 */
const {
  withGradleProperties,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withSuppressCompileSdk(config) {
  return withGradleProperties(config, (config) => {
    const key = 'android.suppressUnsupportedCompileSdk';
    const props = config.modResults.filter((p) => p.key !== key);
    props.push({ type: 'property', key, value: '35' });
    config.modResults = props;
    return config;
  });
}

function withPermissionsServicePatch(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const filePath = path.join(
        cfg.modRequest.projectRoot,
        'node_modules',
        'expo-modules-core',
        'android',
        'src',
        'main',
        'java',
        'expo',
        'modules',
        'adapters',
        'react',
        'permissions',
        'PermissionsService.kt'
      );

      if (!fs.existsSync(filePath)) {
        console.warn('[withAndroidBuildFixes] PermissionsService.kt not found, skip');
        return cfg;
      }

      let src = fs.readFileSync(filePath, 'utf8');
      const original = src;

      src = src.replace(
        /(?<![\w?.])requestedPermissions\.size\b/g,
        'requestedPermissions?.size ?: 0'
      );
      src = src.replace(
        /(?<![\w?.])permissions\.size\b/g,
        'permissions?.size ?: 0'
      );
      src = src.replace(
        /requestedPermissions\.isEmpty\(\)/g,
        '(requestedPermissions?.isEmpty() ?: true)'
      );
      src = src.replace(
        /permissions\.isEmpty\(\)/g,
        '(permissions?.isEmpty() ?: true)'
      );

      if (src !== original) {
        fs.writeFileSync(filePath, src);
        console.log('[withAndroidBuildFixes] Patched PermissionsService.kt');
      }

      return cfg;
    },
  ]);
}

function withAndroidBuildFixes(config) {
  config = withSuppressCompileSdk(config);
  config = withPermissionsServicePatch(config);
  return config;
}

module.exports = withAndroidBuildFixes;