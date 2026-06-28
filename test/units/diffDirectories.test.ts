'use strict';

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { canonicalJson, diffDirectories, xmlEquivalent } from '../../src/service/verify/diffDirectories.js';

describe('diffDirectories', () => {
  let refDir: string;
  let mockDir: string;

  beforeEach(async () => {
    refDir = await mkdtemp(join(tmpdir(), 'diff-ref-'));
    mockDir = await mkdtemp(join(tmpdir(), 'diff-mock-'));
  });

  afterEach(async () => {
    await rm(refDir, { recursive: true, force: true });
    await rm(mockDir, { recursive: true, force: true });
  });

  it('returns empty drift and reordered for identical trees', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r><x>1</x></r>');
    await writeFile(join(mockDir, 'a.xml'), '<r><x>1</x></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result).toEqual({ drift: [], reordered: [] });
  });

  it('reports sibling-reordered XML as `reordered` (informational), not drift', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r><x>1</x><x>2</x></r>');
    await writeFile(join(mockDir, 'a.xml'), '<r><x>2</x><x>1</x></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual(['a.xml']);
  });

  it('does not double-report a byte-identical file as reordered', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r><x>1</x><x>2</x></r>');
    await writeFile(join(mockDir, 'a.xml'), '<r><x>1</x><x>2</x></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
  });

  it('flags content drift for genuinely different XML', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r><x>1</x></r>');
    await writeFile(join(mockDir, 'a.xml'), '<r><x>2</x></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([{ path: 'a.xml', reason: 'content drift' }]);
    expect(result.reordered).toEqual([]);
  });

  it('flags missing files in the round-trip output', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r/>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([{ path: 'a.xml', reason: 'missing in round-trip output' }]);
    expect(result.reordered).toEqual([]);
  });

  it('ignores files that exist only in the mock tree', async () => {
    await writeFile(join(refDir, 'a.xml'), '<r/>');
    await writeFile(join(mockDir, 'a.xml'), '<r/>');
    await writeFile(join(mockDir, 'extra.json'), '{}');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
  });

  it('byte-compares non-XML files (no semantic-equality fallback)', async () => {
    await writeFile(join(refDir, 'a.json'), '{"k":1}');
    await writeFile(join(mockDir, 'a.json'), '{"k": 1}');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([{ path: 'a.json', reason: 'content drift' }]);
    expect(result.reordered).toEqual([]);
  });

  it('recurses into subdirectories and reports drift with relative paths', async () => {
    await mkdir(join(refDir, 'nested'));
    await mkdir(join(mockDir, 'nested'));
    await writeFile(join(refDir, 'nested', 'a.xml'), '<r><v>1</v></r>');
    await writeFile(join(mockDir, 'nested', 'a.xml'), '<r><v>2</v></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([{ path: 'nested/a.xml', reason: 'content drift' }]);
  });

  it('recurses into subdirectories and reports reorder with relative paths', async () => {
    await mkdir(join(refDir, 'nested'));
    await mkdir(join(mockDir, 'nested'));
    await writeFile(join(refDir, 'nested', 'a.xml'), '<r><v>1</v><v>2</v></r>');
    await writeFile(join(mockDir, 'nested', 'a.xml'), '<r><v>2</v><v>1</v></r>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual(['nested/a.xml']);
  });

  it('returns drift when a referenced subdirectory is missing on the mock side', async () => {
    await mkdir(join(refDir, 'nested'));
    await writeFile(join(refDir, 'nested', 'a.xml'), '<r/>');

    const result = await diffDirectories(refDir, mockDir);
    expect(result.drift).toEqual([{ path: 'nested/a.xml', reason: 'missing in round-trip output' }]);
  });
});

describe('xmlEquivalent', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'xml-equiv-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  async function write(name: string, content: string): Promise<string> {
    const path = join(tmpDir, name);
    await writeFile(path, content);
    return path;
  }

  it('treats identical files as equal', async () => {
    const a = await write('a.xml', '<r><x>1</x></r>');
    const b = await write('b.xml', '<r><x>1</x></r>');
    expect(xmlEquivalent(a, b)).toBe(true);
  });

  it('treats reordered siblings as equal', async () => {
    const a = await write('a.xml', '<r><a>1</a><a>2</a></r>');
    const b = await write('b.xml', '<r><a>2</a><a>1</a></r>');
    expect(xmlEquivalent(a, b)).toBe(true);
  });

  it('treats reordered child tags as equal', async () => {
    const a = await write('a.xml', '<r><a>1</a><b>2</b></r>');
    const b = await write('b.xml', '<r><b>2</b><a>1</a></r>');
    expect(xmlEquivalent(a, b)).toBe(true);
  });

  it('treats different leaf values as unequal', async () => {
    const a = await write('a.xml', '<r><a>1</a></r>');
    const b = await write('b.xml', '<r><a>2</a></r>');
    expect(xmlEquivalent(a, b)).toBe(false);
  });

  it('treats different attribute values as unequal', async () => {
    const a = await write('a.xml', '<r a="1"/>');
    const b = await write('b.xml', '<r a="2"/>');
    expect(xmlEquivalent(a, b)).toBe(false);
  });

  it('treats reordered attributes as equal', async () => {
    const a = await write('a.xml', '<r a="1" b="2"/>');
    const b = await write('b.xml', '<r b="2" a="1"/>');
    expect(xmlEquivalent(a, b)).toBe(true);
  });

  it('treats single vs duplicated child tags as unequal', async () => {
    const a = await write('a.xml', '<r><a>1</a></r>');
    const b = await write('b.xml', '<r><a>1</a><a>1</a></r>');
    expect(xmlEquivalent(a, b)).toBe(false);
  });

  it('returns false when either file is unreadable or invalid XML', async () => {
    const valid = await write('valid.xml', '<r/>');
    const missing = join(tmpDir, 'does-not-exist.xml');
    expect(xmlEquivalent(valid, missing)).toBe(false);
    expect(xmlEquivalent(missing, valid)).toBe(false);
  });

  it('ignores the XML declaration', async () => {
    const a = await write('a.xml', '<?xml version="1.0" encoding="UTF-8"?><r><n>1</n></r>');
    const b = await write('b.xml', '<r><n>1</n></r>');
    expect(xmlEquivalent(a, b)).toBe(true);
  });
});

describe('canonicalJson', () => {
  it('sorts object keys alphabetically', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it('sorts arrays by canonical content', () => {
    expect(canonicalJson([2, 1, 3])).toBe(canonicalJson([1, 2, 3]));
  });

  it('returns scalars as-is', () => {
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson('foo')).toBe('"foo"');
    expect(canonicalJson(42)).toBe('42');
  });

  it('preserves nested object key ordering recursively', () => {
    const a = { outer: { b: 1, a: 2 }, top: 3 };
    const b = { top: 3, outer: { a: 2, b: 1 } };
    expect(canonicalJson(a)).toBe(canonicalJson(b));
  });

  it('produces stable output regardless of array element order containing objects', () => {
    const left = [
      { name: 'A', val: 1 },
      { name: 'B', val: 2 },
    ];
    const right = [
      { val: 2, name: 'B' },
      { val: 1, name: 'A' },
    ];
    expect(canonicalJson(left)).toBe(canonicalJson(right));
  });

  it('uses a strict less-than/greater-than/equal comparator (no ambiguous mid-states)', () => {
    const fwd = canonicalJson([1, 2, 3, 4, 5]);
    const bwd = canonicalJson([5, 4, 3, 2, 1]);
    expect(fwd).toBe(bwd);
    expect(fwd).toBe(JSON.stringify([1, 2, 3, 4, 5]));
  });

  it('returns 0 from the comparator for two elements with identical canonical form', () => {
    const out = JSON.parse(canonicalJson([{ k: 1 }, { k: 1 }])) as unknown[];
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ k: 1 });
    expect(out[1]).toEqual({ k: 1 });
  });
});
