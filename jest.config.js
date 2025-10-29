// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

export default {
  automock: false,
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '(.+)\\.js': '$1',
    '^lodash-es$': 'lodash',
  },
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  testTimeout: 600000,
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  // Allow transformation of ESM modules in node_modules
  transformIgnorePatterns: ['node_modules/(?!(p-limit|yocto-queue)/)'],
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/test/utils/', '/coverage/'],
};
