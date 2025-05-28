const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;

module.exports = config;