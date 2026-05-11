#!/usr/bin/env node
// Run Stryker only against `src/**/*.ts` files that changed vs the merge-base
// with the base branch. Cross-platform replacement for the bash pipeline used
// by scolladon/sfdx-git-delta. Skip mutation testing when nothing changed.

import { spawnSync } from 'node:child_process';

const baseBranch = process.env.MUTATION_BASE_BRANCH ?? 'origin/main';

function git(...args) {
  const result = spawnSync('git', args, { encoding: 'utf-8' });
  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').trim();
    throw new Error(`git ${args.join(' ')} failed: ${stderr}`);
  }
  return (result.stdout ?? '').trim();
}

function listChangedSourceFiles() {
  // --diff-filter=AM picks up Added and Modified files; deletions are skipped
  // because there is nothing left to mutate. Renames/copies are reported as
  // adds + deletes by default with --no-renames (omit; default is fine here).
  const output = git('--no-pager', 'diff', '--name-only', '--diff-filter=AM', `--merge-base`, baseBranch, '--', 'src');
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.ts'));
}

function main() {
  let files;
  try {
    files = listChangedSourceFiles();
  } catch (error) {
    console.error(`[incremental-mutation] ${error.message}`);
    console.error(
      `[incremental-mutation] Ensure the base branch "${baseBranch}" is fetched (use 'fetch-depth: 0' in CI).`,
    );
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('[incremental-mutation] No source files changed; skipping mutation testing.');
    return;
  }

  console.log(`[incremental-mutation] Running Stryker against ${files.length} changed file(s):`);
  for (const file of files) console.log(`  - ${file}`);

  const args = ['stryker', 'run', '--mutate', files.join(',')];
  const stryker = spawnSync('npx', args, { stdio: 'inherit', shell: true });
  process.exit(stryker.status ?? 1);
}

main();
