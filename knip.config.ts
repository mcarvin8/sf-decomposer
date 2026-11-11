export default {
  entry: [
    'src/commands/decomposer/*.ts',
    'src/action/*.ts',
    'src/hooks/*.ts',
    // sf-decomposer-core's standalone CLI (built by tsconfig.core.json); src/index.ts is
    // already an entry through package.json exports.
    'src/cli/index.ts',
    'bin/dev.js',
    'bin/run.js',
    'scripts/**/*.ts',
    '**/*.{nut,test,perf}.ts',
    // Spawned by path from test/perf/utils/childMeasure.ts, never imported.
    'test/perf/utils/runOp.ts',
    'vitest*.config.ts',
    '.github/**/*.yml',
  ],
  project: ['**/*.{ts,js}'],
  ignore: ['**/*.{json,yml,yaml}'],
  ignoreExportsUsedInFile: true,
};
