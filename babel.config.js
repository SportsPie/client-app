module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          locales: './locales',
          assets: './src/assets',
          utils: './src/utils',
          components: './src/components',
          styles: './src/styles',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
  overrides: [
    {
      test: './node_modules/ethers',
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: false }],
        ['@babel/plugin-transform-private-methods', { loose: false }],
        [
          '@babel/plugin-transform-private-property-in-object',
          { loose: false },
        ],
        'react-native-reanimated/plugin',
      ],
    },
  ],
};
