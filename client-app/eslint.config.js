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
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
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
      // instead. Also disallow calling the pure auth predicate helpers
      // directly from components — prefer the hook wrappers (use*).
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
        },
        {
          selector: "CallExpression[callee.name='userHasRegionId']",
          message:
            'Do not call userHasRegionId(auth, ...) inside components — use useUserHasRegionId(...) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasMunicipalityId']",
          message:
            'Do not call userHasMunicipalityId(auth, ...) inside components — use useUserHasMunicipalityId(...) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasDepartmentId']",
          message:
            'Do not call userHasDepartmentId(auth, ...) inside components — use useUserHasDepartmentId(...) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasAccessToRegion']",
          message:
            'Do not call userHasAccessToRegion(auth, ...) inside components — use useUserHasAccessToRegion(...) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasAccessToMunicipalityState']",
          message:
            'Do not call userHasAccessToMunicipalityState(auth, ...) inside components — use useUserHasAccessToMunicipalityState(...) instead.'
        },
        {
          selector: "CallExpression[callee.name='userHasAccessToDepartmentState']",
          message:
            'Do not call userHasAccessToDepartmentState(auth, ...) inside components — use useUserHasAccessToDepartmentState(...) instead.'
        }
      ]
    }
  }
];
