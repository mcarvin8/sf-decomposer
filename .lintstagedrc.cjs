module.exports = {
  '**/*.{ts,js}': ['npx @biomejs/biome check --error-on-warnings --write'],
  // Ignored markdown (CHANGELOG, licenses, messages/) is skipped by biome.json.
  '**/*.md': ['npx @biomejs/biome format --write --no-errors-on-unmatched'],
};
