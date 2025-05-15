import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
  },
  ...(await tseslint.config({
    extends: [
      'eslint:recommended',
      'plugin:@next/next/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
  })),
];
