import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const vitestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  vi: 'readonly',
  test: 'readonly',
};

export default [
  {
    ignores: ['**/*.cjs', 'scripts/', 'lib/'],
  },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      header: 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: vitestGlobals,
    },
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
];
