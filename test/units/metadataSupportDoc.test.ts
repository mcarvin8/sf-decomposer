'use strict';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveMetadataTypeEntry } from '../../src/metadata/getRegistryValuesBySuffix.js';

// Guards docs/METADATA_SUPPORT.md against drifting from the vendored SDR registry: every row's
// "CLI Suffix" must be the registry's exact (case-sensitive) suffix, every registry type must have a
// row, and the support status must agree with what resolveMetadataTypeEntry actually does.

type RegistryEntry = { name: string; suffix?: string; children?: { types: Record<string, RegistryEntry> } };

const registry = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/metadata/registry/metadataRegistry.json'), 'utf-8'),
) as { types: Record<string, RegistryEntry>; suffixes: Record<string, string> };

const registrySuffixByName = new Map<string, string | undefined>();
for (const type of Object.values(registry.types)) registrySuffixByName.set(type.name, type.suffix);
for (const type of Object.values(registry.types)) {
  for (const child of Object.values(type.children?.types ?? {})) {
    if (!registrySuffixByName.has(child.name)) registrySuffixByName.set(child.name, child.suffix);
  }
}

type DocRow = { name: string; suffix: string | undefined; status: string };

function readDocRows(): DocRow[] {
  const lines = readFileSync(resolve(process.cwd(), 'docs/METADATA_SUPPORT.md'), 'utf-8').split(/\r?\n/);
  const header = lines.findIndex((l) => l.startsWith('| Metadata Type'));
  const rows: DocRow[] = [];
  for (let i = header + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    const [name, suffixCell, status] = lines[i]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    rows.push({ name, suffix: suffixCell === '—' ? undefined : suffixCell.replace(/`/g, ''), status });
  }
  return rows;
}

function resolvesTo(suffix: string): string | undefined {
  try {
    return resolveMetadataTypeEntry(suffix).name;
  } catch {
    return undefined;
  }
}

describe('docs/METADATA_SUPPORT.md', () => {
  const rows = readDocRows();

  it('has a row for every registry type and no rows for types outside the registry', () => {
    const docNames = rows.map((r) => r.name);
    expect(docNames.filter((n) => !registrySuffixByName.has(n))).toEqual([]);
    expect([...registrySuffixByName.keys()].filter((n) => !docNames.includes(n))).toEqual([]);
  });

  it('lists the exact registry suffix for every type', () => {
    const mismatches = rows
      .filter((r) => r.suffix !== registrySuffixByName.get(r.name))
      .map((r) => `${r.name}: doc=${r.suffix ?? '—'} registry=${registrySuffixByName.get(r.name) ?? '—'}`);
    expect(mismatches).toEqual([]);
  });

  it('marks a type ✅/🔀 only when its suffix resolves to that type', () => {
    const broken = rows
      .filter((r) => r.status === '✅' || r.status === '🔀')
      .filter((r) => r.suffix === undefined || resolvesTo(r.suffix) !== r.name)
      .map((r) => r.name);
    expect(broken).toEqual([]);
  });

  it('does not mark a type ⚠️ when its suffix is rejected outright (that is ❌)', () => {
    // A shared suffix may resolve to a sibling type; the row's note says so. Only a hard rejection fails here.
    const rejected = rows
      .filter((r) => r.status === '⚠️' && r.suffix !== undefined && resolvesTo(r.suffix) === undefined)
      .map((r) => r.name);
    expect(rejected).toEqual([]);
  });

  it('marks a type ❌ only when its suffix does not resolve to that type', () => {
    const resolvable = rows
      .filter((r) => r.status === '❌' && r.suffix !== undefined && resolvesTo(r.suffix) === r.name)
      .map((r) => r.name);
    expect(resolvable).toEqual([]);
  });
});
