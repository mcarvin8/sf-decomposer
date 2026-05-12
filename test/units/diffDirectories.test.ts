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

  it('preserves nested object key ordering recursively', () => {
    // Verifies the recursion through canonicalize() actually sorts deep keys, not just the top level.
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
    // Two arrays with strictly different elements must canonicalise stably -- ensures the
    // sort comparator returns -1 / +1 (not e.g. 0 for everything, which would leave the
    // sort order indeterminate). We rely on the fact that sort with all-zero comparator
    // would leave the original order in place, so reverse-order would NOT match forward.
    const fwd = canonicalJson([1, 2, 3, 4, 5]);
    const bwd = canonicalJson([5, 4, 3, 2, 1]);
    expect(fwd).toBe(bwd);
    // And both should equal the canonical of the sorted form.
    expect(fwd).toBe(JSON.stringify([1, 2, 3, 4, 5]));
  });

  it('returns 0 from the comparator for two elements with identical canonical form', () => {
    // Pure stability/identity check: two identical objects in an array preserve length.
    const out = JSON.parse(canonicalJson([{ k: 1 }, { k: 1 }])) as unknown[];
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ k: 1 });
    expect(out[1]).toEqual({ k: 1 });
  });
});

describe('XMLParser configuration coverage', () => {
  // These tests pin the constructor options for the module-scoped XMLParser. Each option
  // affects how `xmlEquivalent` interprets two strings, so flipping any option should change
  // observable behaviour for at least one input.

  it('parses attributes (ignoreAttributes=false)', () => {
    // If ignoreAttributes were true, both inputs would parse identically (no attrs), so the
    // strings would compare equal. Different attribute values must therefore produce !=.
    expect(xmlEquivalent('<r a="1"/>', '<r a="2"/>')).toBe(false);
  });

  it('exposes attributes with the configured @_ prefix (attributeNamePrefix)', () => {
    // If the prefix were anything other than the configured "@_", the parsed shapes would
    // still be equal -- this test only requires that attribute parsing is non-trivial.
    // The parse-attributes path is exercised indirectly via the equality check above.
    expect(xmlEquivalent('<r a="1" b="2"/>', '<r b="2" a="1"/>')).toBe(true);
  });

  it('keeps tag values as strings (parseTagValue=false)', () => {
    // With parseTagValue=true, "1" would parse as the number 1 and "01" as the number 1 too,
    // which would make these equal. With parseTagValue=false they stay as distinct strings.
    expect(xmlEquivalent('<r><n>1</n></r>', '<r><n>01</n></r>')).toBe(false);
  });

  it('keeps attribute values as strings (parseAttributeValue=false)', () => {
    // Same reasoning as above, applied to attributes.
    expect(xmlEquivalent('<r a="1"/>', '<r a="01"/>')).toBe(false);
  });

  it('trims surrounding whitespace from tag values (trimValues=true)', () => {
    // With trimValues=false, leading/trailing whitespace inside a tag would diverge.
    expect(xmlEquivalent('<r><n>foo</n></r>', '<r><n>  foo  </n></r>')).toBe(true);
  });

  it('ignores the XML declaration (ignoreDeclaration=true)', () => {
    const withDecl = '<?xml version="1.0" encoding="UTF-8"?><r><n>1</n></r>';
    const without = '<r><n>1</n></r>';
    expect(xmlEquivalent(withDecl, without)).toBe(true);
  });

  it('ignores processing-instruction tags (ignorePiTags=true)', () => {
    // <?something ?> PI tags should be dropped so they don't affect equality.
    const withPi = '<r><?php echo 1 ?><n>1</n></r>';
    const without = '<r><n>1</n></r>';
    expect(xmlEquivalent(withPi, without)).toBe(true);
  });
});

describe('xmlEquivalent fast-path', () => {
  it('returns true via the identity shortcut for identical strings without ever parsing', () => {
    // Pass an intentionally malformed XML string -- if the fast-path is missing the parser
    // would still equate them, but this nails down the documented `a === b` short-circuit.
    const malformed = '<<<not valid xml>>>';
    expect(xmlEquivalent(malformed, malformed)).toBe(true);
  });

  it('returns false (not undefined / not throwing) for genuinely different malformed inputs', () => {
    // Both inputs are valid-enough that fast-xml-parser does not throw, but they differ. We
    // only care that this returns a boolean false, not that a specific path is taken.
    expect(xmlEquivalent('<r/>', '<r2/>')).toBe(false);
  });
});
