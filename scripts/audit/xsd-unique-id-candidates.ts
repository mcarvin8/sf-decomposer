/*
 * SKETCH / proof-of-concept — not wired into CI, not a replacement for
 * audit:sweep. See the "Why not scrape the doc site" note below before
 * extending this.
 *
 * Parses a local copy of Salesforce's Metadata API XSD (metadata.xsd) and
 * proposes uniqueIdElements candidates for repeating child elements that
 * `src/metadata/uniqueIdElements.ts` doesn't yet cover — i.e. the schema-driven
 * half of the workflow described for the Profile fix in PR #531. Pair this
 * with `npm run audit:sweep` (empirical hash-filename counts against a real
 * metadata archive) before trusting any candidate: the XSD only tells you a
 * field exists and repeats, not that it's actually unique in practice (see
 * the `app`/profileActionOverrides compound-key case, where a single field
 * looked like an id but collided).
 *
 * Why a local file and not a fetched URL: the metadata.xsd is normally
 * obtained via the "Metadata API WSDL and XML Schema" download (Setup, or
 * the Salesforce CLI/Workbench mirrors of it) rather than a stable public
 * URL we can hit unauthenticated. The HTML doc pages
 * (developer.salesforce.com/docs/.../meta_profile.htm) are NOT a viable
 * scrape target either — a plain `curl` against them returns a bot-gated
 * "Oops, something went wrong" error page, not the rendered tables; only
 * WebFetch-style tools (which use a real browser/LLM render step) got
 * through when we checked one page manually. So: download metadata.xsd once,
 * point this script at the local path.
 *
 * Usage:
 *   npm run audit:xsd -- --xsd /path/to/metadata.xsd [--type Profile]
 *
 * Algorithm (regex-based; metadata.xsd is regular enough that a full XML
 * parser isn't needed, matching this harness's dependency-free convention):
 *   1. Extract every <xsd:complexType name="..."> ... </xsd:complexType>
 *      block and its direct <xsd:element name="..." type="..." maxOccurs="..."/>
 *      children.
 *   2. A field is a "repeating child record" if maxOccurs="unbounded" and its
 *      type references another complexType defined in the schema (not a
 *      primitive like xsd:string or an enum).
 *   3. If the child complexType itself carries a `name` or `fullName` field,
 *      it's skipped entirely — the disassembler's default id resolution
 *      (fullName/name) already handles it, so there's no gap to report.
 *      Otherwise, rank its own string-typed fields as unique-id candidates:
 *      an exact/substring match against the parent field name (e.g.
 *      `application` inside `applicationVisibilities`) ranks highest; any
 *      other required (minOccurs != "0") string field is a secondary
 *      candidate; multiple candidates are suggested as a compound key,
 *      widest-first, mirroring the `app`/`profile` compound entries already
 *      in uniqueIdElements.ts.
 *   4. Cross-reference against the current uniqueIdElements.ts (matched by
 *      lowercasing the XSD type name — imperfect for divergent suffixes like
 *      CustomApplication -> `app`; those print as "no key match, verify
 *      manually").
 *
 * Known gaps in this sketch (left as-is; call out before hardening):
 *   - No enum introspection: fields typed as an enum (e.g. TabVisibility)
 *     are excluded from candidates even though they're sometimes the only
 *     other field on a two-field child, which is fine (enums make bad ids).
 *   - No handling of nested repeating grandchildren (e.g.
 *     ProfileCategoryGroupVisibility.dataCategories in newer API versions) —
 *     would need to recurse into candidate child types, not just one level.
 *   - Suffix mapping is a naive lowercase match; the `app`, `md`, and other
 *     divergent (dirName, suffix) pairs in type-pairs.ts aren't applied here.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatTable, parseFlags, requireString } from './lib.js';

/** Path to the source-of-truth file this script cross-references, relative to this script. */
const UNIQUE_ID_ELEMENTS_SOURCE = resolve(fileURLToPath(import.meta.url), '../../../src/metadata/uniqueIdElements.ts');

interface XsdField {
  name: string;
  type: string;
  minOccurs: string;
  maxOccurs: string;
}

interface XsdComplexType {
  name: string;
  fields: XsdField[];
}

interface Candidate {
  parentType: string;
  listField: string;
  childType: string;
  candidateKey: string;
  alreadyCovered: boolean;
  suffixGuess: string;
  /** Whether `suffixGuess` (parentType.toLowerCase()) matched a real key in uniqueIdElements.ts. */
  hasKeyMatch: boolean;
}

const COMPLEX_TYPE_RE = /<xsd:complexType\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/xsd:complexType>/g;
/** Matches a self-closing <xsd:element .../> tag; attributes are extracted separately since their order varies across schema sources. */
const ELEMENT_TAG_RE = /<xsd:element\b([^>]*?)\/>/g;

function getAttr(attrs: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1];
}

/** Primitive/enum-ish type names that can never be a "record" child. */
const PRIMITIVE_TYPES = new Set([
  'string',
  'boolean',
  'int',
  'double',
  'base64Binary',
  'dateTime',
  'date',
  'anyType',
  'picklist',
]);

function parseXsd(xsdText: string): Map<string, XsdComplexType> {
  const types = new Map<string, XsdComplexType>();
  for (const m of xsdText.matchAll(COMPLEX_TYPE_RE)) {
    const name = m[1] as string;
    const body = m[2] as string;
    const fields: XsdField[] = [];
    for (const em of body.matchAll(ELEMENT_TAG_RE)) {
      const attrs = em[1] as string;
      const fieldName = getAttr(attrs, 'name');
      const rawType = getAttr(attrs, 'type');
      if (!fieldName || !rawType) continue;
      fields.push({
        name: fieldName,
        type: rawType.includes(':') ? (rawType.split(':').pop() as string) : rawType,
        minOccurs: getAttr(attrs, 'minOccurs') ?? '1',
        maxOccurs: getAttr(attrs, 'maxOccurs') ?? '1',
      });
    }
    types.set(name, { name, fields });
  }
  return types;
}

const UNIQUE_ID_ENTRY_RE = /^ {4}(\w+):\s*\{$/;
const UNIQUE_ID_ARRAY_RE = /uniqueIdElements:\s*\[([\s\S]*?)\]/;
const QUOTED_STRING_RE = /'([^']+)'/g;

/**
 * Read and regex-parse uniqueIdElements.ts's `key: { uniqueIdElements: [...] }`
 * entries as plain text (rather than importing the module), so this
 * script stays under scripts/tsconfig.json's rootDir and doesn't need a
 * cross-package import. Relies on the file's consistent 4-space top-level
 * indentation (biome-formatted) to find entry boundaries.
 */
function currentUniqueIdIndex(sourcePath: string): Map<string, string[]> {
  const text = readFileSync(sourcePath, 'utf8');
  const lines = text.split('\n');
  const merged = new Map<string, string[]>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const entryMatch = UNIQUE_ID_ENTRY_RE.exec(line);
    if (!entryMatch) continue;

    const key = entryMatch[1] as string;
    const bodyLines: string[] = [];
    for (let j = i + 1; j < lines.length && !/^ {4}\},?$/.test(lines[j] ?? ''); j++) {
      bodyLines.push(lines[j] as string);
    }

    const arrayMatch = UNIQUE_ID_ARRAY_RE.exec(bodyLines.join('\n'));
    if (!arrayMatch) continue;
    const values = Array.from((arrayMatch[1] as string).matchAll(QUOTED_STRING_RE), (m) => m[1] as string);
    merged.set(key.toLowerCase(), values);
  }
  return merged;
}

/** Rank a child complexType's own fields as unique-id candidates for `listFieldName`. */
function rankCandidateFields(child: XsdComplexType, listFieldName: string): string[] {
  const stringFields = child.fields.filter((f) => f.type === 'string');

  const nameMatch = stringFields.find(
    (f) => listFieldName.toLowerCase().includes(f.name.toLowerCase()) && f.name.length > 2,
  );
  if (nameMatch) return [nameMatch.name];

  const required = stringFields.filter((f) => f.minOccurs !== '0');
  if (required.length > 0) return required.map((f) => f.name);

  return stringFields.map((f) => f.name);
}

function findCandidates(types: Map<string, XsdComplexType>, scopeType?: string): Candidate[] {
  const index = currentUniqueIdIndex(UNIQUE_ID_ELEMENTS_SOURCE);
  const out: Candidate[] = [];

  for (const parent of types.values()) {
    if (scopeType && parent.name !== scopeType) continue;

    for (const field of parent.fields) {
      if (field.maxOccurs !== 'unbounded') continue;
      if (PRIMITIVE_TYPES.has(field.type)) continue;

      const child = types.get(field.type);
      if (!child) continue; // referenced type not in this schema file (or an enum)

      // `name`/`fullName` are already the default unique-id fields for every metadata
      // type (see the file header comment in uniqueIdElements.ts). If the child element
      // itself carries either field, the disassembler's default resolution already
      // handles it — flagging any other field on this child as a "candidate" would be
      // noise, not a real gap, regardless of which field rankCandidateFields prefers.
      if (child.fields.some((f) => f.name === 'name' || f.name === 'fullName')) continue;

      const candidateFields = rankCandidateFields(child, field.name);
      if (candidateFields.length === 0) continue;

      const candidateKey = candidateFields.join('+');

      const suffixGuess = parent.name.toLowerCase();
      const existing = index.get(suffixGuess) ?? [];
      const alreadyCovered = candidateFields.every((f) => existing.includes(f)) || existing.includes(candidateKey);
      const hasKeyMatch = index.has(suffixGuess);

      out.push({
        parentType: parent.name,
        listField: field.name,
        childType: child.name,
        candidateKey,
        alreadyCovered,
        suffixGuess: hasKeyMatch ? suffixGuess : `${suffixGuess} (no key match, verify manually)`,
        hasKeyMatch,
      });
    }
  }
  return out;
}

function mdTable(rows: Candidate[]): string {
  const header = '| Parent Type | List Field | Child Type | Candidate Key |\n|---|---|---|---|';
  const body = rows
    .map((r) => `| ${r.parentType} | ${r.listField} | ${r.childType} | \`${r.candidateKey}\` |`)
    .join('\n');
  return rows.length > 0 ? `${header}\n${body}` : `${header}\n| _(none)_ | | | |`;
}

/** Re-derive the same grouped markdown report the audit was originally exported as, so re-running after edits to uniqueIdElements.ts keeps it current. */
function formatMarkdown(candidates: Candidate[], xsdPath: string): string {
  const sorted = [...candidates].sort(
    (a, b) => a.parentType.localeCompare(b.parentType) || a.listField.localeCompare(b.listField),
  );
  const gapsWithKeyMatch = sorted.filter((r) => r.hasKeyMatch && !r.alreadyCovered);
  const noKeyMatch = sorted.filter((r) => !r.hasKeyMatch);
  const alreadyCovered = sorted.filter((r) => r.alreadyCovered);

  return `# XSD-derived uniqueIdElements candidates

Generated by \`npm run audit:xsd -- --xsd ${xsdPath} --md scripts/audit/xsd-unique-id-candidates.md\`.
These are XSD-only candidates: the schema says the field exists and repeats, not that
it's actually unique in production data. Cross-check with \`npm run audit:sweep\` before
adding any of these to \`src/metadata/uniqueIdElements.ts\`.

Total: ${sorted.length} candidates — ${gapsWithKeyMatch.length} true gaps against an existing
key, ${alreadyCovered.length} already covered, ${noKeyMatch.length} with no matching key in
uniqueIdElements.ts today (new type or naming mismatch — verify the real registry suffix
before adding, see \`getRegistryValuesBySuffix.ts\`).

## Gaps against an existing key (${gapsWithKeyMatch.length})

Parent type has an entry in \`uniqueIdElements.ts\` already; this list field isn't covered yet.

${mdTable(gapsWithKeyMatch)}

## No key match — verify real registry suffix first (${noKeyMatch.length})

\`suffixGuess\` is just \`parentType.toLowerCase()\`; the real registry suffix (the key
\`getUniqueIdElements()\` actually looks up) may differ (e.g. \`CustomApplication\` -> \`app\`,
\`CustomMetadata\` -> \`md\`). Confirm the suffix before adding an entry.

${mdTable(noKeyMatch)}

## Already covered (${alreadyCovered.length})

${mdTable(alreadyCovered)}
`;
}

const HELP_TEXT = `Usage: npm run audit:xsd -- --xsd <path> [--type <XsdTypeName>] [--gaps-only] [--md <path>]

Required:
  --xsd <path>          Local path to a downloaded metadata.xsd

Optional:
  --type <XsdTypeName>  Scope to one top-level type (e.g. Profile, PermissionSet)
  --gaps-only           Only print candidates not already covered in uniqueIdElements.ts
  --md <path>           Also write the full candidate list as a grouped markdown report
  --help, -h            Show this help
`;

function isDirectInvocation(): boolean {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
}

if (isDirectInvocation()) {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }
  try {
    const flags = parseFlags(argv);
    const xsdPath = requireString(flags, 'xsd', 'Run with --help for full usage.');
    const scopeType = flags.get('type');
    const gapsOnly = flags.has('gaps-only');
    const mdPath = flags.get('md');

    const xsdText = readFileSync(xsdPath, 'utf8');
    const types = parseXsd(xsdText);
    let candidates = findCandidates(types, typeof scopeType === 'string' ? scopeType : undefined);
    if (gapsOnly) candidates = candidates.filter((c) => !c.alreadyCovered);

    process.stdout.write(`${formatTable(candidates)}\n`);
    process.stdout.write(
      `\n${candidates.length} candidate(s), ${candidates.filter((c) => !c.alreadyCovered).length} gap(s)\n`,
    );

    if (typeof mdPath === 'string') {
      writeFileSync(mdPath, formatMarkdown(candidates, xsdPath));
      process.stdout.write(`\nWrote markdown report to ${mdPath}\n`);
    }
  } catch (err) {
    process.stderr.write(`xsd-unique-id-candidates error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
