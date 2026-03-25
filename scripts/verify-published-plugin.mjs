#!/usr/bin/env node
/**
 * Smoke test for the published sf-decomposer plugin: copy fixtures, run decompose/recompose
 * via `sf decomposer`, then compare working dirs to fixture baselines (same idea as
 * test/commands/decomposer/decomposer.nut.ts).
 *
 * Run from repo root after: global `sf` + `sf plugins install sf-decomposer`
 * Keep METADATA_UNDER_TEST in sync with test/utils/constants.ts (METADATA_UNDER_TEST).
 *
 * Uses shell: true when spawning `sf` so Windows can resolve the `sf.cmd` shim (avoids ENOENT).
 */

import { strictEqual } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';

const METADATA_UNDER_TEST = [
  'labels',
  'workflow',
  'bot',
  'profile',
  'permissionset',
  'flow',
  'escalationRules',
  'loyaltyProgramSetup',
  'mutingpermissionset',
];

const FORMATS = ['xml', 'json', 'json5', 'yaml'];

const SFDX_PROJECT = {
  packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '58.0',
};

function sf(args) {
  const r = spawnSync('sf', args, { stdio: 'inherit', encoding: 'utf-8', shell: true });
  if (r.error) {
    throw r.error;
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function decomposeArgs(format) {
  return [
    'decomposer',
    'decompose',
    '--postpurge',
    '--prepurge',
    '--format',
    format,
    ...METADATA_UNDER_TEST.flatMap((m) => ['--metadata-type', m]),
  ];
}

function recomposeArgs() {
  return ['decomposer', 'recompose', '--postpurge', ...METADATA_UNDER_TEST.flatMap((m) => ['--metadata-type', m])];
}

async function compareDirectories(referenceDir, mockDir) {
  const entries = await readdir(referenceDir, { withFileTypes: true });
  const tasks = [];

  for (const entry of entries) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      tasks.push(compareDirectories(refEntryPath, mockPath));
    } else {
      tasks.push(
        (async () => {
          const refContent = await readFile(refEntryPath, 'utf-8');
          const mockContent = await readFile(mockPath, 'utf-8');
          strictEqual(refContent, mockContent, `File content is different for ${entry.name}`);
        })()
      );
    }
  }

  await Promise.all(tasks);
}

async function resetWorkdirs(root) {
  const pkg1 = join(root, 'fixtures', 'package-dir-1');
  const pkg2 = join(root, 'fixtures', 'package-dir-2');
  const mock1 = join(root, 'force-app');
  const mock2 = join(root, 'package');

  await rm(mock1, { recursive: true, force: true });
  await rm(mock2, { recursive: true, force: true });
  await cp(pkg1, mock1, { recursive: true });
  await cp(pkg2, mock2, { recursive: true });
  await writeFile(join(root, 'sfdx-project.json'), JSON.stringify(SFDX_PROJECT, null, 2));
}

async function main() {
  const root = cwd();

  for (const format of FORMATS) {
    console.log(`\n--- format: ${format} ---\n`);
    await resetWorkdirs(root);
    sf(decomposeArgs(format));
    sf(recomposeArgs());
    await compareDirectories(join(root, 'fixtures', 'package-dir-1'), join(root, 'force-app'));
    await compareDirectories(join(root, 'fixtures', 'package-dir-2'), join(root, 'package'));
    console.log(`OK: round-trip matches baselines for format ${format}`);
  }

  await rm(join(root, 'force-app'), { recursive: true, force: true });
  await rm(join(root, 'package'), { recursive: true, force: true });
  await rm(join(root, 'sfdx-project.json'), { force: true });
  console.log('\nAll published-plugin verification passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
