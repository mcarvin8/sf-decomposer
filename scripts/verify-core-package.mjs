#!/usr/bin/env node
// Guards the sf-decomposer-core package after `npm run build:core`:
// - its only runtime dependency is config-disassembler, pinned to the same version as the
//   sf-decomposer plugin (so a Dependabot bump of the root can't leave core behind),
// - its version matches the plugin's,
// - its build contains no CLI plugin, hook or GitHub Action code,
// - nothing in the build imports a package other than Node.js built-ins and config-disassembler,
// - the standalone CLI entry point keeps its shebang and the metadata registry is bundled.
// Fails with a list of problems so a change that couples core to oclif, the Salesforce
// libraries or @actions/core is caught before publish.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const pkgDir = 'packages/core';
const libDir = join(pkgDir, 'lib');
const allowedImports = new Set(['config-disassembler']);
const problems = [];

const root = JSON.parse(readFileSync('package.json', 'utf-8'));
const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8'));

if (pkg.version !== root.version) {
  problems.push(`version ${pkg.version} does not match the plugin's ${root.version}`);
}
const deps = Object.keys(pkg.dependencies ?? {});
if (deps.length !== 1 || deps[0] !== 'config-disassembler') {
  problems.push(`dependencies must be exactly config-disassembler, found: ${deps.join(', ') || '(none)'}`);
} else if (pkg.dependencies['config-disassembler'] !== root.dependencies['config-disassembler']) {
  problems.push(
    `config-disassembler ${pkg.dependencies['config-disassembler']} does not match the plugin's ${root.dependencies['config-disassembler']}`,
  );
}
for (const field of ['peerDependencies', 'optionalDependencies']) {
  if (pkg[field] && Object.keys(pkg[field]).length > 0) {
    problems.push(`package.json declares ${field}: ${Object.keys(pkg[field]).join(', ')}`);
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

let files;
try {
  files = walk(libDir);
} catch {
  problems.push(`${libDir} is missing - run "npm run build:core" first`);
  files = [];
}

for (const dir of ['commands', 'hooks', 'action']) {
  if (files.some((f) => relative(libDir, f).split(/[\\/]/)[0] === dir)) {
    problems.push(`build contains plugin-only directory lib/${dir}`);
  }
}

const importPattern = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
for (const file of files.filter((f) => f.endsWith('.js'))) {
  for (const [, specifier] of readFileSync(file, 'utf-8').matchAll(importPattern)) {
    if (!specifier.startsWith('.') && !specifier.startsWith('node:') && !allowedImports.has(specifier)) {
      problems.push(`${relative(pkgDir, file)} imports "${specifier}"`);
    }
  }
}

const binPath = join(pkgDir, pkg.bin?.['sf-decomposer'] ?? '');
if (!existsSync(binPath)) {
  problems.push(`bin "sf-decomposer" points at missing file ${binPath}`);
} else if (!readFileSync(binPath, 'utf-8').startsWith('#!/usr/bin/env node')) {
  problems.push(`${binPath} does not start with a node shebang`);
}
if (!existsSync(join(libDir, 'metadata', 'registry', 'metadataRegistry.json'))) {
  problems.push('lib/metadata/registry/metadataRegistry.json is missing from the build');
}
for (const file of ['LICENSE.md', 'THIRD_PARTY_NOTICES.md']) {
  if (!existsSync(join(pkgDir, file))) problems.push(`${file} was not copied into ${pkgDir}`);
}

if (problems.length > 0) {
  console.error(`sf-decomposer-core check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`sf-decomposer-core OK: ${files.length} files, only runtime dependency is config-disassembler`);
