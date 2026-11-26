module.exports = {
  '**/*.{ts,js}': ['biome check --error-on-warnings --write'],
  // Ignored markdown (CHANGELOG, licenses, messages/) is skipped by biome.json.
  '**/*.md': ['biome format --write --no-errors-on-unmatched'],
};
