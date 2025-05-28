const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional module resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'db'];

// Enable Node.js modules
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    tslib: require.resolve('tslib'),
};

module.exports = config;