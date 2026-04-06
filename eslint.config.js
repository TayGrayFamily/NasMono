import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist', '**/dist-server', '**/node_modules'],
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['packages/**/*.{ts,tsx}'],
  })),
  {
    files: ['packages/**/*.{ts,tsx}'],
    ...js.configs.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Frontend/React Config
  {
    files: [
      'packages/game-hub/**/*.{ts,tsx}',
      'packages/home/**/*.{ts,tsx}',
      'packages/just-one/**/*.{ts,tsx}',
    ],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Backend/Node Config
  {
    files: [
      'packages/game-server/**/*.ts',
      'packages/*/server/**/*.ts',
      'packages/*/vite.config.ts',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
    },
  },
];
