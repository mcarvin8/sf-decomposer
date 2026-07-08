import { defineConfig } from 'vitest/config';

// Performance tests are deliberately separated from unit tests and non-unit (NUT)
// tests because they:
//   - operate on multi-megabyte synthetic fixtures (see scripts/gen-perf-fixtures.ts)
//   - take minutes, not seconds, to complete
//   - emit JSON timing artifacts to perf-results/ for trend tracking
//   - should not influence coverage thresholds
//
// Run with: npm run test:perf
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/perf/**/*.perf.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 1_800_000, // 30 min per test - the xlarge profile can take a while
    hookTimeout: 1_800_000,
    clearMocks: true,
    reporters: ['verbose'],
    // Forked (not worker-thread) so `--expose-gc` reliably attaches `global.gc` in the
    // process that runs the tests. test/perf/utils/measure.ts calls it to force a clean
    // heap snapshot before/after each measured block -- without it, memory deltas are
    // contaminated by whatever garbage V8 happened not to have collected yet, which is
    // most of why memory readings were noisy before this.
    pool: 'forks',
    execArgv: ['--expose-gc'],
  },
});
