const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  watchFolders: [],
  resolver: {
    blockList: [
      // Exclude build artifacts and CMake directories
      /.*\.cxx\/.*/,
      /.*\/android\/app\/\.cxx\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);