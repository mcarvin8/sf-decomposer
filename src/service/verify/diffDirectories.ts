'use strict';

import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { parseXml } from 'config-disassembler';

import { VerifyDrift } from '../../helpers/types.js';

export type DirDiffResult = {
  /** Files whose contents are semantically different (real drift). */
  drift: VerifyDrift[];
  /**
   * Files where the only delta is sibling/attribute ordering. Surfaced for awareness — these are
   * NOT failures, since Salesforce metadata is generally order-agnostic and `config-disassembler`
   * does not preserve original sibling order.
   */
  reordered: string[];
};

/**
 * Recursively diff two directory trees. Files in the reference tree are compared against the
 * mock tree; files that exist only in the mock tree are intentionally ignored, so the helper is
 * safe to use against round-trip output that contains transient sidecars (e.g.
 * `.config-disassembler.json`) which the original tree never had.
 *
 * For `.xml` files, comparison is **structural and order-insensitive**: sibling elements with the
 * same tag name can appear in any order without registering as drift. Files that are byte-different
 * but semantically equal are returned in `reordered` so the caller can surface the difference.
 */
export async function diffDirectories(referenceDir: string, mockDir: string, prefix = ''): Promise<DirDiffResult> {
  const out: DirDiffResult = { drift: [], reordered: [] };

  let entries;
  try {
    entries = await readdir(referenceDir, { withFileTypes: true });
    // Stryker disable next-line BlockStatement
  } catch {
    /* istanbul ignore next -- @preserve: caller already filters to existing directories */
    return out;
  }

  for (const entry of entries) {
    const refPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const nested = await diffDirectories(refPath, mockPath, relPath);
      out.drift.push(...nested.drift);
      out.reordered.push(...nested.reordered);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const mockExists = await fileExists(mockPath);
    if (!mockExists) {
      out.drift.push({ path: relPath, reason: 'missing in round-trip output' });
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const [ref, mock] = await Promise.all([readFile(refPath, 'utf-8'), readFile(mockPath, 'utf-8')]);
    if (ref === mock) continue;

    if (isXmlFile(entry.name)) {
      // Byte-different but maybe semantically identical — e.g. siblings reordered on round trip.
      if (xmlEquivalent(refPath, mockPath)) {
        out.reordered.push(relPath);
      } else {
        out.drift.push({ path: relPath, reason: 'content drift' });
      }
    } else {
      out.drift.push({ path: relPath, reason: 'content drift' });
    }
  }

  return out;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    // The only caller negates this with `!`, so an empty catch (implicit `undefined`) would be
    // behaviorally identical to `return false` here -- this is an intentionally equivalent mutant.
    return false;
  }
}

function isXmlFile(fileName: string): boolean {
  return extname(fileName).toLowerCase() === '.xml';
}

/**
 * Compare two XML files for structural equality, ignoring sibling order and attribute order.
 * Falls back to `false` if either side fails to parse, so genuinely malformed output still
 * surfaces as drift through the caller.
 */
export function xmlEquivalent(refPath: string, mockPath: string): boolean {
  const parsedA = parseXml(refPath) as unknown;
  const parsedB = parseXml(mockPath) as unknown;
  // Stryker disable next-line ConditionalExpression,LogicalOperator: canonicalJson(null) can never
  // collide with the canonical JSON of a real parsed XML value, so weakening this guard (e.g. `||`
  // to `&&`, or dropping one operand) is unobservable except when BOTH sides are null -- which the
  // "both invalid" test below still pins to `false`.
  if (parsedA === null || parsedB === null) return false;
  return canonicalJson(parsedA) === canonicalJson(parsedB);
}

/**
 * Convert any JSON value into a stable string representation: object keys are sorted, and arrays
 * are sorted by the canonical-JSON of each element. Two values produce the same canonical string
 * iff they are deeply equal up to sibling order.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const normalized = value.map(canonicalize);
    normalized.sort((left, right) => {
      const ls = JSON.stringify(left);
      const rs = JSON.stringify(right);
      // Stryker disable next-line EqualityOperator,ConditionalExpression
      if (ls < rs) return -1;
      // Stryker disable next-line EqualityOperator,ConditionalExpression
      if (ls > rs) return 1;
      return 0;
    });
    return normalized;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    out[key] = canonicalize(record[key]);
  }
  return out;
}
