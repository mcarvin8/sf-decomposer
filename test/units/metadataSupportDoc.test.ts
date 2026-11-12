'use strict';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveMetadataTypeEntry, typesSharingSuffix } from '../../src/metadata/getRegistryValuesBySuffix.js';

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

type DocRow = { name: string; suffix: string | undefined; status: string; note: string };

const docLines = readFileSync(resolve(process.cwd(), 'docs/METADATA_SUPPORT.md'), 'utf-8').split(/\r?\n/);

function tableCells(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

function readDocRows(): DocRow[] {
  const header = docLines.findIndex((l) => l.startsWith('| Metadata Type'));
  const rows: DocRow[] = [];
  for (let i = header + 2; i < docLines.length && docLines[i].startsWith('|'); i++) {
    const [name, suffixCell, status, note] = tableCells(docLines[i]);
    rows.push({ name, suffix: suffixCell === '—' ? undefined : suffixCell.replace(/`/g, ''), status, note });
  }
  return rows;
}

/** Reads the "At a glance" table as label -> { count, share } (bold markers stripped). */
function readGlance(): Map<string, { count: number; share: string }> {
  const header = docLines.findIndex((l) => l.startsWith('| Status '));
  const out = new Map<string, { count: number; share: string }>();
  for (let i = header + 2; i < docLines.length && docLines[i].startsWith('|'); i++) {
    const [label, count, share] = tableCells(docLines[i]).map((c) => c.replace(/\*\*/g, ''));
    out.set(label, { count: Number(count), share });
  }
  return out;
}

function resolvesTo(suffix: string): string | undefined {
  try {
    return resolveMetadataTypeEntry(suffix).name;
  } catch {
    return undefined;
  }
}

/**
 * Whether `-m` can select this row's type: by its suffix, or by its exact type name when the type
 * loses a shared suffix (e.g. CustomSite, whose `site` resolves to SiteDotCom).
 */
function isSelectable(r: DocRow): boolean {
  if (r.suffix === undefined) return false;
  if (resolvesTo(r.suffix) === r.name) return true;
  return Boolean(typesSharingSuffix(r.suffix)?.others.includes(r.name)) && resolvesTo(r.name) === r.name;
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

  it('marks a type ✅/🔀 only when -m can select it', () => {
    const broken = rows
      .filter((r) => r.status === '✅' || r.status === '🔀')
      .filter((r) => !isSelectable(r))
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

  it('keeps the "At a glance" counts in sync with the table', () => {
    const count = (pred: (r: DocRow) => boolean): number => rows.filter(pred).length;
    const untested = (r: DocRow): boolean => r.note.includes('not yet round-trip tested');
    const confirmedLeaf = (r: DocRow): boolean => /confirmed by v\d+ WSDL/.test(r.note);
    const tested = count((r) => r.status === '✅' && !untested(r));
    const special = count((r) => r.status === '🔀');
    const schemaOnly = count((r) => r.status === '✅' && untested(r));
    const glance = readGlance();
    const wrongShares = [...glance]
      .filter(
        ([label, { count, share }]) =>
          label !== 'Total registry types' && share !== `${Math.round((count / rows.length) * 100)}%`,
      )
      .map(([label]) => label);
    expect(wrongShares).toEqual([]);
    expect(Object.fromEntries([...glance].map(([label, { count }]) => [label, count]))).toEqual({
      '✅ Decomposable — round-trip tested': tested,
      '🔀 Decomposable with special behavior': special,
      '✅ Decomposable — nested elements per schema, not yet round-trip tested': schemaOnly,
      'Decomposable total': tested + special + schemaOnly,
      '⚠️ Leaf-only — confirmed by schema': count((r) => r.status === '⚠️' && confirmedLeaf(r)),
      '⚠️ Leaf-only — unverified guess': count((r) => r.status === '⚠️' && !confirmedLeaf(r)),
      '❌ Unsupported': count((r) => r.status === '❌'),
      '➡️ Child type — use parent': count((r) => r.status === '➡️'),
      'Total registry types': rows.length,
    });
  });

  it('marks a type ❌ only when -m cannot select it', () => {
    const resolvable = rows.filter((r) => r.status === '❌' && isSelectable(r)).map((r) => r.name);
    expect(resolvable).toEqual([]);
  });
});
