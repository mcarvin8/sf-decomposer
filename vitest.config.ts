import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['test/perf/**', 'node_modules/**'],
    clearMocks: true,
    testTimeout: 600_000,
    hookTimeout: 600_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/**',
        'test/utils/**',
        'coverage/**',
        'lib/**',
        '**/*.nut.ts',
        'src/metadata/uniqueIdElements.ts',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 95,
        statements: 95,
      },
    },
  },
});
