import rnConfig from '@react-native/eslint-config/flat';

export default [
  { ignores: ['coverage/', 'node_modules/', 'android/', 'ios/'] },
  ...rnConfig,
  {
    rules: {
      // Dynamic safe-area insets are applied inline on purpose.
      'react-native/no-inline-styles': 'off',
    },
  },
];
