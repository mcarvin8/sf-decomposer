'use strict';

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { diffDirectories, xmlEquivalent, canonicalJson } from '../../src/service/verify/diffDirectories.js';

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
    // Identical files should never appear in either bucket.
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
  it('treats identical strings as equal without parsing', () => {
    expect(xmlEquivalent('<r/>', '<r/>')).toBe(true);
  });

  it('treats reordered siblings as equal', () => {
    expect(xmlEquivalent('<r><a>1</a><a>2</a></r>', '<r><a>2</a><a>1</a></r>')).toBe(true);
  });

  it('treats reordered child tags as equal', () => {
    expect(xmlEquivalent('<r><a>1</a><b>2</b></r>', '<r><b>2</b><a>1</a></r>')).toBe(true);
  });

  it('treats different leaf values as unequal', () => {
    expect(xmlEquivalent('<r><a>1</a></r>', '<r><a>2</a></r>')).toBe(false);
  });

  it('treats different attribute values as unequal', () => {
    expect(xmlEquivalent('<r a="1"/>', '<r a="2"/>')).toBe(false);
  });

  it('treats reordered attributes as equal', () => {
    expect(xmlEquivalent('<r a="1" b="2"/>', '<r b="2" a="1"/>')).toBe(true);
  });

  it('treats single vs duplicated child tags as unequal', () => {
    expect(xmlEquivalent('<r><a>1</a></r>', '<r><a>1</a><a>1</a></r>')).toBe(false);
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
});
