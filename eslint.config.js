const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'web-build/', 'coverage/', 'electron/', '*.config.js', 'babel.config.js'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...prettierConfig.rules,

      // Prettier
      'prettier/prettier': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',

      // Hard rule: no console — use LoggerFactory everywhere
      'no-console': 'error',
    },
  },
  // Legacy platform service files — these will be refactored incrementally.
  // Allow console and any until full migration to LoggerFactory + strict types.
  {
    files: [
      'services/shopify/**/*.ts',
      'services/woocommerce/**/*.ts',
      'services/magento/**/*.ts',
      'services/implementations/**/*.ts',
      'services/cms.ts',
      'services/converters.ts',
      'services/extended-types.ts',
      'services/order-converters.ts',
      'services/payment.ts',
      'services/types.ts',
      'services/interfaces.ts',
      'services/InMemoryKioskService.ts',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Screen / component files — suppress react-native color-literal and inline-style warnings
  {
    files: ['screens/**/*.tsx', 'components/**/*.tsx', 'navigation/**/*.tsx'],
    rules: {
      'react-native/no-color-literals': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },
];
