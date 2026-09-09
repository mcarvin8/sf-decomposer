'use strict';

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DisassembleXMLFileHandler, ReassembleXMLFileHandler } from 'config-disassembler';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

// Property-based fuzzing of the decompose/recompose round trip against
// arbitrary nested XML shapes, complementing the curated fixtures in
// decomposer.test.ts. Curated fixtures only catch regressions in shapes we
// already thought to write down (see the CDATA/indentation investigation
// that led to this file); a fuzzer explores shapes nobody hand-authored.
//
// Two properties are checked, matching the same tolerance model as the perf
// suite's byte-retention + idempotence guards (test/perf/README.md):
//   1. No content loss: every non-whitespace leaf value in the generated
//      document must still appear verbatim after one round trip.
//   2. Idempotence: a second round trip must produce byte-identical output
//      to the first. The first round trip is allowed to reformat (e.g.
//      normalize CDATA indentation) - only the *second* is required to be
//      stable, exactly as documented for the perf suite.
//
// Deliberately NOT asserting original-bytes-equal-first-round-trip-bytes:
// that's a stricter bar than this project holds itself to anywhere else,
// and an early draft of this test built on config-disassembler's own
// verifyXmlRoundtrip() helper (which does compare against the original)
// flagged benign first-pass reformatting as "drift" for tightly-packed
// CDATA. That's a real gap in that helper's canonicalization, not a data
// loss bug in the actual disassemble/reassemble pipeline. This test
// intentionally checks the two properties this project actually promises
// instead.

const MAX_DEPTH = 3;
const TAGS = ['alpha', 'beta', 'gamma', 'wrapper', 'group', 'entry', 'node'] as const;

type FuzzNode =
  | { kind: 'text'; value: string }
  | { kind: 'cdata'; value: string }
  | { kind: 'comment'; value: string }
  | { kind: 'element'; tag: string; children: FuzzNode[] };

// XML 1.0 forbids most C0 control characters. Built from char codes at
// runtime (rather than \u escapes in a regex literal) so no raw control
// bytes ever need to appear in this source file.
const ILLEGAL_XML_CHAR_CODES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
];
const ILLEGAL_XML_CHARS_PATTERN = new RegExp(
  `[${ILLEGAL_XML_CHAR_CODES.map((code) => String.fromCharCode(code)).join('')}]`,
  'g',
);

const stripIllegalControlChars = (raw: string): string => raw.replace(ILLEGAL_XML_CHARS_PATTERN, '');

const sanitizeText = (raw: string): string => stripIllegalControlChars(raw).replace(/[<&>]/g, ' ');

const sanitizeCdata = (raw: string): string => stripIllegalControlChars(raw).replace(/]]>/g, '] ]>');

const sanitizeComment = (raw: string): string => {
  const s = stripIllegalControlChars(raw).replace(/--/g, '- -');
  return s.endsWith('-') ? `${s} ` : s;
};

const tagArb = fc.constantFrom(...TAGS);
const textLeafArb = fc.string({ maxLength: 24 }).map((v): FuzzNode => ({ kind: 'text', value: sanitizeText(v) }));
const cdataLeafArb = fc.string({ maxLength: 24 }).map((v): FuzzNode => ({ kind: 'cdata', value: sanitizeCdata(v) }));
const commentLeafArb = fc
  .string({ maxLength: 24 })
  .map((v): FuzzNode => ({ kind: 'comment', value: sanitizeComment(v) }));

function nodeArb(depth: number): fc.Arbitrary<FuzzNode> {
  const leaves = [textLeafArb, cdataLeafArb, commentLeafArb];
  if (depth >= MAX_DEPTH) {
    return fc.oneof(...leaves);
  }
  return fc.oneof(
    { weight: 3, arbitrary: textLeafArb },
    { weight: 1, arbitrary: cdataLeafArb },
    { weight: 1, arbitrary: commentLeafArb },
    {
      weight: 2,
      arbitrary: fc
        .record({ tag: tagArb, children: fc.array(nodeArb(depth + 1), { maxLength: 3 }) })
        .map((r): FuzzNode => ({ kind: 'element', ...r })),
    },
  );
}

// Each item is the child-node list wrapped in a synthetic, sequential
// <fullName> at serialization time - keeps naming collision-free so we're
// fuzzing content/structure, not the separate unique-id-fallback behavior.
const documentArb = fc.array(fc.array(nodeArb(1), { minLength: 1, maxLength: 4 }), { minLength: 2, maxLength: 5 });

function serializeNode(node: FuzzNode): string {
  switch (node.kind) {
    case 'text':
      return node.value;
    case 'cdata':
      return `<![CDATA[${node.value}]]>`;
    case 'comment':
      return `<!--${node.value}-->`;
    case 'element':
      return `<${node.tag}>${node.children.map(serializeNode).join('')}</${node.tag}>`;
  }
}

function buildDocument(items: FuzzNode[][]): string {
  const itemsXml = items
    .map((children, i) => `<item><fullName>Item${i}</fullName>${children.map(serializeNode).join('')}</item>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<FuzzRoot xmlns="http://soap.sforce.com/2006/04/metadata">${itemsXml}</FuzzRoot>`;
}

function collectLeafValues(nodes: FuzzNode[], out: string[]): void {
  for (const node of nodes) {
    if (node.kind === 'element') {
      collectLeafValues(node.children, out);
    } else if (node.value.trim().length > 0) {
      // Whitespace-only leaves are excluded: whether insignificant whitespace
      // survives verbatim is exactly the ambiguous, tool-normalized case this
      // suite already knows not to pin down byte-for-byte (see file header).
      out.push(node.value);
    }
  }
}

async function roundTripOnce(dir: string, filePath: string): Promise<string> {
  const disassembler = new DisassembleXMLFileHandler();
  await disassembler.disassemble({
    filePath,
    strategy: 'unique-id',
    uniqueIdElements: 'fullName',
    prePurge: true,
    postPurge: true,
    format: 'xml',
  });

  const reassembler = new ReassembleXMLFileHandler();
  await reassembler.reassemble({
    filePath: join(dir, 'Fuzz'),
    fileExtension: 'fuzz-meta.xml',
    postPurge: true,
  });

  return readFile(filePath, 'utf-8');
}

describe('xml decompose/recompose fuzz', () => {
  it('preserves every leaf value and stabilizes after one round trip, across arbitrary nested XML shapes', async () => {
    await fc.assert(
      fc.asyncProperty(documentArb, async (items) => {
        const xml = buildDocument(items);
        const leafValues: string[] = [];
        for (const children of items) collectLeafValues(children, leafValues);

        const dir = await mkdtemp(join(tmpdir(), 'xml-fuzz-'));
        const filePath = join(dir, 'Fuzz.fuzz-meta.xml');
        try {
          await writeFile(filePath, xml, 'utf-8');

          const pass1 = await roundTripOnce(dir, filePath);
          for (const value of leafValues) {
            expect(pass1.includes(value), `leaf value ${JSON.stringify(value)} missing after round trip`).toBe(true);
          }

          const pass2 = await roundTripOnce(dir, filePath);
          expect(pass2, 'second round trip must be byte-identical to the first (idempotence)').toBe(pass1);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      }),
      { numRuns: 25 },
    );
  });
});
