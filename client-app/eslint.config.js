import typescriptEslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react': react,
      'react-hooks': reactHooks,
      'prettier': prettier
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-console': 'error',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error'
    }
  }
  ,
  // Additional strict rules for React component files (.tsx)
  {
    // Apply to component files but exclude the auth context implementation
    // and the AuthGuard which intentionally call the pure helpers.
    files: ['src/**/*.tsx', '!src/context/**', '!src/components/AuthGuard.tsx'],
    rules: {
      // Disallow direct access to auth.user.roles in components. Use
      // `useUserHasAnyRole`, `useUserHasAllRoles`, or `useCurrentUserRoles`
      // instead.
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='auth'][property.name='user'] > MemberExpression[property.name='roles']",
          message:
            'Direct access to auth.user.roles is forbidden in components. Use the auth hooks from @/context/AuthContext instead (e.g. useUserHasAnyRole).'
        },
        {
          selector: "CallExpression[callee.name='userHasAnyRole']",
          message:
            'Do not call userHasAnyRole(auth, ...) inside components — use useUserHasAnyRole([...]) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasAllRoles']",
          message:
            'Do not call userHasAllRoles(auth, ...) inside components — use useUserHasAllRoles([...]) instead.'
        }
      ]
    }
  }
];