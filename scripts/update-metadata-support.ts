/*
 * Diffs two @salesforce/source-deploy-retrieve metadataRegistry.json snapshots and appends
 * draft rows to METADATA_SUPPORT.md for any metadata type the newer registry adds.
 *
 * Classification is derived only from data the registry actually provides:
 *   - child types (registered under a parent's `children.types`)        -> "Use parent type"
 *   - `object` suffix / adapters in UNSUPPORTED_ADAPTERS                -> "Unsupported" (matches
 *     the hard rejections in src/metadata/getRegistryValuesBySuffix.ts, so this is exact, not a guess)
 *   - everything else                                                   -> "Leaf-only" draft guess,
 *     flagged NEEDS REVIEW, because whether a type has nested repeatable XML elements can only be
 *     confirmed by testing real metadata (see scripts/audit/), not by reading the registry.
 *
 * Usage:
 *   node --import ts-node/esm scripts/update-metadata-support.ts --old <old-registry.json> --new <new-registry.json> [--doc METADATA_SUPPORT.md]
 *
 * Prints a summary (added top-level types / added child types) to stdout for reuse in a PR body.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Keep in sync with UNSUPPORTED_ADAPTERS in src/helpers/constants.ts (not imported directly —
// scripts/tsconfig.json's rootDir keeps this directory self-contained, same as the other scripts here).
const UNSUPPORTED_ADAPTERS: string[] = ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'];

type RegistryChildType = {
  name: string;
  suffix?: string;
};

type RegistryType = {
  name: string;
  suffix?: string;
  strategies?: { adapter?: string };
  children?: { types: Record<string, RegistryChildType> };
};

type Registry = { types: Record<string, RegistryType> };

type Row = {
  name: string;
  suffix: string;
  status: string;
  note: string;
};

function parseArgs(argv: string[]): { old: string; new: string; doc: string } {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const oldPath = get('--old');
  const newPath = get('--new');
  if (!oldPath || !newPath) {
    throw Error(
      'Usage: updateMetadataSupport.ts --old <old-registry.json> --new <new-registry.json> [--doc METADATA_SUPPORT.md]',
    );
  }
  return {
    old: resolve(oldPath),
    new: resolve(newPath),
    doc: resolve(get('--doc') ?? join(__dirname, '..', 'METADATA_SUPPORT.md')),
  };
}

function loadRegistry(path: string): Registry {
  return JSON.parse(readFileSync(path, 'utf8')) as Registry;
}

// Maps a child type's Name (e.g. "BotVersion") to its parent type's Name (e.g. "Bot").
function mapChildToParent(registry: Registry): Map<string, string> {
  const map = new Map<string, string>();
  for (const parent of Object.values(registry.types)) {
    if (!parent.children) continue;
    for (const child of Object.values(parent.children.types)) {
      map.set(child.name, parent.name);
    }
  }
  return map;
}

function classify(type: RegistryType, parentName: string | undefined): { status: string; note: string } {
  if (parentName) {
    return { status: '➡️', note: `Child type — use parent \`${parentName}\`` };
  }
  if (type.suffix === 'object') {
    return { status: '❌', note: 'Unsupported — Custom Objects are explicitly rejected by this plugin' };
  }
  const adapter = type.strategies?.adapter;
  if (adapter && UNSUPPORTED_ADAPTERS.includes(adapter)) {
    return { status: '❌', note: `Unsupported — \`${adapter}\` adapter strategy is explicitly blocked` };
  }
  return {
    status: '⚠️',
    note: 'Leaf-only (draft guess — newly added by SDR; NEEDS REVIEW against the Metadata API schema)',
  };
}

function collectNewRows(
  oldRegistry: Registry,
  newRegistry: Registry,
): { rows: Row[]; addedTop: string[]; addedChildren: Array<{ name: string; parent: string }> } {
  const oldChildToParent = mapChildToParent(oldRegistry);
  const newChildToParent = mapChildToParent(newRegistry);

  const oldTopNames = new Set(Object.values(oldRegistry.types).map((t) => t.name));
  const oldChildNames = new Set(oldChildToParent.keys());

  const rows: Row[] = [];
  const addedTop: string[] = [];
  const addedChildren: Array<{ name: string; parent: string }> = [];

  for (const type of Object.values(newRegistry.types)) {
    if (oldTopNames.has(type.name)) continue;
    const { status, note } = classify(type, undefined);
    rows.push({ name: type.name, suffix: type.suffix ?? '—', status, note });
    addedTop.push(type.name);
  }

  for (const [childName, parentName] of newChildToParent) {
    if (oldChildNames.has(childName) || oldTopNames.has(childName)) continue;
    // Skip children of brand-new parent types; they're implied by the parent's own new row.
    if (addedTop.includes(parentName)) continue;
    const parentType = Object.values(newRegistry.types).find((t) => t.name === parentName);
    const childType = parentType?.children?.types
      ? Object.values(parentType.children.types).find((c) => c.name === childName)
      : undefined;
    const { status, note } = classify(childType ?? { name: childName }, parentName);
    rows.push({ name: childName, suffix: childType?.suffix ?? '—', status, note });
    addedChildren.push({ name: childName, parent: parentName });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return { rows, addedTop, addedChildren };
}

function padTo(value: string, width: number): string {
  return value.length >= width ? value : value + ' '.repeat(width - value.length);
}

function insertRows(doc: string, rows: Row[]): { doc: string; skipped: string[] } {
  if (rows.length === 0) return { doc, skipped: [] };

  const lines = doc.split('\n');
  const headerIdx = lines.findIndex((l) => l.startsWith('| Metadata Type'));
  if (headerIdx === -1) throw Error('Could not find the "| Metadata Type" table header in METADATA_SUPPORT.md');
  const separatorIdx = headerIdx + 1;

  // Column widths come from the separator row's dash runs, so new rows match existing padding.
  const widths = lines[separatorIdx]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim().replace(/^:/, '').length);

  let end = separatorIdx + 1;
  while (end < lines.length && lines[end].startsWith('|')) end++;

  const existing = lines.slice(separatorIdx + 1, end);
  const existingNames = new Set(existing.map((l) => l.split('|')[1].trim()));

  const skipped: string[] = [];
  const toInsert = rows.filter((r) => {
    if (existingNames.has(r.name)) {
      skipped.push(r.name);
      return false;
    }
    return true;
  });

  const newLines = toInsert.map((r) => {
    const suffixCell = r.suffix === '—' ? '—' : '`' + r.suffix + '`';
    return `| ${padTo(r.name, widths[0])} | ${padTo(suffixCell, widths[1])} | ${padTo(r.status, widths[2])} | ${r.note} |`;
  });

  const merged = [...existing, ...newLines].sort((a, b) => {
    const nameOf = (l: string): string => l.split('|')[1].trim();
    return nameOf(a).localeCompare(nameOf(b));
  });

  lines.splice(separatorIdx + 1, end - (separatorIdx + 1), ...merged);
  return { doc: lines.join('\n'), skipped };
}

function main(): void {
  const { old: oldPath, new: newPath, doc: docPath } = parseArgs(process.argv.slice(2));
  const oldRegistry = loadRegistry(oldPath);
  const newRegistry = loadRegistry(newPath);

  const { rows, addedTop, addedChildren } = collectNewRows(oldRegistry, newRegistry);

  if (rows.length === 0) {
    console.log('No new metadata types found; METADATA_SUPPORT.md left unchanged.');
    return;
  }

  const original = readFileSync(docPath, 'utf8');
  const { doc: updated, skipped } = insertRows(original, rows);
  writeFileSync(docPath, updated);

  const addedNames = new Set(rows.map((r) => r.name));
  for (const name of skipped) addedNames.delete(name);

  console.log(`Added ${addedNames.size} draft row(s) to ${docPath}:`);
  for (const name of addedTop) if (addedNames.has(name)) console.log(`  + ${name} (top-level)`);
  for (const { name, parent } of addedChildren)
    if (addedNames.has(name)) console.log(`  + ${name} (child of ${parent})`);
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} type(s) already documented: ${skipped.join(', ')}`);
  }
  console.log('\nAll ⚠️/❌ classifications for brand-new top-level types are best-effort; ❌ rows that cite an');
  console.log('unsupported adapter or the `object` suffix are exact (mirrors getRegistryValuesBySuffix.ts).');
  console.log('⚠️ leaf-only rows are draft guesses and NEED REVIEW before being trusted.');
}

main();
