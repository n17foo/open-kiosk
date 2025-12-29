// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional exclusions for Electron files
config.resolver.blockList = [
  /electron\/.*/, // Block all files in the electron directory
  /node_modules\/electron\/.*/, // Block electron module
];

// Add additional resolver config for node compatibility
config.resolver.extraNodeModules = {
  // Add node module polyfills here if needed
};

module.exports = config;
