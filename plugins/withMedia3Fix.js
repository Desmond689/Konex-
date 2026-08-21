const { withAppBuildGradle } = require('@expo/config-plugins');

const withMedia3Fix = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents += `
// Force Media3 version compatible with compileSdk 34
configurations.all {
    resolutionStrategy {
        force 'androidx.media3:media3-common:1.4.1'
        force 'androidx.media3:media3-exoplayer:1.4.1'
        force 'androidx.media3:media3-exoplayer-dash:1.4.1'
        force 'androidx.media3:media3-exoplayer-hls:1.4.1'
        force 'androidx.media3:media3-exoplayer-smoothstreaming:1.4.1'
        force 'androidx.media3:media3-datasource:1.4.1'
        force 'androidx.media3:media3-datasource-okhttp:1.4.1'
        force 'androidx.media3:media3-extractor:1.4.1'
        force 'androidx.media3:media3-container:1.4.1'
        force 'androidx.media3:media3-decoder:1.4.1'
        force 'androidx.media3:media3-database:1.4.1'
        force 'androidx.media3:media3-ui:1.4.1'
        force 'androidx.media3:media3-session:1.4.1'
    }
}
`;
    }
    return config;
  });
};

module.exports = withMedia3Fix;