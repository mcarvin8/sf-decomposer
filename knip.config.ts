export default {
  entry: [
    'src/commands/decomposer/*.ts',
    'src/hooks/*.ts',
    'bin/dev.js',
    'bin/run.js',
    'scripts/**/*.ts',
    '**/*.{nut,test,perf}.ts',
    'vitest*.config.ts',
    '.github/**/*.yml',
  ],
  project: ['**/*.{ts,js}'],
  ignore: ['**/*.{json,yml,yaml}'],
  ignoreExportsUsedInFile: true,
};
