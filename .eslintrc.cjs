/**
 * ESLint config for the Shopify React Router app.
 * Uses recommended React, Hooks, a11y, TypeScript, Prettier, and simple-import-sort.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: [
    '!**/.server',
    '!**/.client',
    'extensions/**',
    'build/**',
    '.shopify/**',
    '.react-router/**',
  ],

  extends: ['eslint:recommended', 'prettier'],

  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y', 'simple-import-sort'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
        'import/resolver': {
          typescript: {},
        },
      },
      rules: {
        'react/no-unknown-property': ['error', { ignore: ['variant'] }],
        'react/prop-types': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        eqeqeq: ['error', 'smart'],
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // React and React Router
              ['^react$', '^react-dom$', '^react-router'],
              // Other packages
              ['^@?\\w'],
              // Absolute imports (@ alias)
              ['^@(/.*|$)'],
              // Parent imports
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Same-folder imports
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports
              ['^.+\\.?(css|scss|sass)$'],
            ],
          },
        ],
        'simple-import-sort/exports': 'error',
      },
    },

    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import', 'simple-import-sort', 'no-relative-import-paths'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      settings: {
        'import/internal-regex': '^@/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will'],
          },
        ],
        'import/order': 'off',
        'import/no-duplicates': 'error',
        'no-relative-import-paths/no-relative-import-paths': [
          'error',
          {
            allowSameFolder: true,
            rootDir: 'app',
            prefix: '@',
          },
        ],
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^react$', '^react-dom$', '^react-router'],
              ['^@?\\w'],
              ['^@(/.*|$)'],
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              ['^.+\\.?(css|scss|sass)$'],
            ],
          },
        ],
        'simple-import-sort/exports': 'error',
      },
    },

    {
      files: ['.eslintrc.cjs', 'vite.config.{js,ts}', '.graphqlrc.{js,ts}', '**/*.server.{js,ts}'],
      env: {
        node: true,
      },
    },
  ],
  globals: {
    shopify: 'readonly',
  },
};
