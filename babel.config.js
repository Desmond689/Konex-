module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@api': './src/api',
            '@components': './src/components',
            '@screens': './src/features',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@utils': './src/utils',
            '@config': './src/config',
            '@types': './src/types',
            '@navigation': './src/navigation',
            '@constants': './src/constants',
            '@assets': './src/assets',
            '@styles': './src/styles',
            '@core': './src/core',
            '@lib': './src/lib',
            '@features': './src/features',
            '@providers': './src/providers',
            '@context': './src/context',
          },
        },
      ],
      // MUST be last — required by reanimated or app crashes on startup
      'react-native-reanimated/plugin',
    ],
  };
};
