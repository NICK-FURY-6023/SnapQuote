const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Ensure Metro can resolve all modules on Windows
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
  watchFolders: [],
};

module.exports = mergeConfig(defaultConfig, config);
