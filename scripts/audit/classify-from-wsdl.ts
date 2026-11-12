/*
 * Classifies every registry metadata type as leaf-only or decomposable using the Metadata API
 * WSDL, and reports where docs/METADATA_SUPPORT.md disagrees.
 *
 * The disassembler writes each nested (non-leaf) child of the root element to its own file and
 * keeps the leaf (text-only) children together; a file with no nested children is skipped as
 * leaf-only. So from the schema:
 *   - no child element typed as a complexType (only xsd primitives / enum simpleTypes)
 *       -> leaf-only. This is certain: a file can't contain nesting its schema doesn't declare.
 *   - at least one complexType child -> decomposable candidate. Real files may omit those
 *       elements, so confirm with the audit harness (`npm run audit`) before marking ✅.
 *
 * Child fields are resolved through the `<xsd:extension base=...>` chain (most types extend
 * `Metadata`), using the parser shared with xsd-unique-id-candidates.ts.
 *
 * Usage:
 *   npm run audit:classify -- [--wsdl scripts/audit/metadata.wsdl] [--md <report.md>] [--all]
 *
 * By default prints only rows where the WSDL disagrees with the doc or can't classify the type.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFlags } from './lib.js';
import {
  effectiveFields,
  PRIMITIVE_TYPES,
  parseXsd,
  type XsdComplexType,
  type XsdField,
} from './xsd-unique-id-candidates.js';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const REGISTRY_PATH = resolve(REPO_ROOT, 'src/metadata/registry/metadataRegistry.json');
const DOC_PATH = resolve(REPO_ROOT, 'docs/METADATA_SUPPORT.md');

type RegistryType = {
  name: string;
  suffix?: string;
  children?: { types: Record<string, { name: string }> };
};

type Verdict = 'leaf-only' | 'decomposable' | 'not in WSDL';

type Row = {
  type: string;
  suffix: string;
  doc: string;
  wsdl: Verdict;
  nested: string;
  finding: string;
};

/** Effective child fields whose type is a complexType with at least one field of its own. */
function nestedFields(
  type: XsdComplexType,
  types: Map<string, XsdComplexType>,
  cache: Map<string, XsdField[]>,
): XsdField[] {
  return effectiveFields(type, types, cache).filter((f) => {
    if (PRIMITIVE_TYPES.has(f.type)) return false;
    const child = types.get(f.type);
    return child !== undefined && effectiveFields(child, types, cache).length > 0;
  });
}

function readDocStatuses(): Map<string, string> {
  const lines = readFileSync(DOC_PATH, 'utf8').split(/\r?\n/);
  const header = lines.findIndex((l) => l.startsWith('| Metadata Type'));
  const out = new Map<string, string>();
  for (let i = header + 2; i < lines.length && lines[i]?.startsWith('|'); i++) {
    const [name, , status] = (lines[i] as string)
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (name && status) out.set(name, status);
  }
  return out;
}

function findingFor(doc: string, wsdl: Verdict): string {
  if (doc === '❌' || doc === '➡️') return '';
  if (wsdl === 'not in WSDL') return 'unverified — type missing from this WSDL';
  if (doc === '⚠️' && wsdl === 'decomposable') return 'doc says leaf-only; schema has nested elements';
  if ((doc === '✅' || doc === '🔀') && wsdl === 'leaf-only') return 'doc says decomposable; schema is leaf-only';
  return '';
}

function classify(wsdlPath: string): { rows: Row[]; settings: Row[]; version: string } {
  const wsdlText = readFileSync(wsdlPath, 'utf8');
  const version = /Metadata API version ([\d.]+)/.exec(wsdlText)?.[1] ?? 'unknown';
  const types = parseXsd(wsdlText);
  const cache = new Map<string, XsdField[]>();
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as { types: Record<string, RegistryType> };
  const docStatus = readDocStatuses();

  const verdictOf = (name: string): { wsdl: Verdict; nested: string } => {
    const ct = types.get(name);
    if (!ct) return { wsdl: 'not in WSDL', nested: '' };
    const nested = nestedFields(ct, types, cache);
    return {
      wsdl: nested.length > 0 ? 'decomposable' : 'leaf-only',
      nested: nested.map((f) => (f.maxOccurs === 'unbounded' ? `${f.name}[]` : f.name)).join(', '),
    };
  };

  const rows: Row[] = Object.values(registry.types)
    .map((t) => {
      const doc = docStatus.get(t.name) ?? '?';
      const { wsdl, nested } = verdictOf(t.name);
      return { type: t.name, suffix: t.suffix ?? '—', doc, wsdl, nested, finding: findingFor(doc, wsdl) };
    })
    .sort((a, b) => a.type.localeCompare(b.type));

  // Per-feature org settings (AccountSettings, SecuritySettings, ...) aren't registry types; their
  // files live in settings/ and are all handled by `-m settings`. Report which ones nest.
  const registryNames = new Set(Object.values(registry.types).map((t) => t.name));
  const settings: Row[] = [...types.values()]
    .filter((t) => t.name.endsWith('Settings') && !registryNames.has(t.name) && t.baseType === 'Metadata')
    .map((t) => {
      const { wsdl, nested } = verdictOf(t.name);
      return { type: t.name, suffix: 'settings', doc: '', wsdl, nested, finding: '' };
    })
    .sort((a, b) => a.type.localeCompare(b.type));

  return { rows, settings, version };
}

function mdTable(rows: Row[], withDoc = true): string {
  const head = withDoc
    ? '| Type | Suffix | Doc | WSDL | Nested elements | Finding |\n|---|---|---|---|---|---|'
    : '| Settings type | WSDL | Nested elements |\n|---|---|---|';
  const body = rows.map((r) =>
    withDoc
      ? `| ${r.type} | \`${r.suffix}\` | ${r.doc} | ${r.wsdl} | ${r.nested} | ${r.finding} |`
      : `| ${r.type} | ${r.wsdl} | ${r.nested} |`,
  );
  return [head, ...body].join('\n');
}

const HELP_TEXT = `Usage: npm run audit:classify -- [--wsdl <path>] [--md <path>] [--all]

  --wsdl <path>  Metadata API WSDL (default: scripts/audit/metadata.wsdl)
  --md <path>    Also write a markdown report
  --all          Print every type, not only disagreements
  --help, -h     Show this help
`;

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  process.stdout.write(HELP_TEXT);
  process.exit(0);
}

const flags = parseFlags(argv);
const wsdlFlag = flags.get('wsdl');
const wsdlPath = typeof wsdlFlag === 'string' ? wsdlFlag : resolve(REPO_ROOT, 'scripts/audit/metadata.wsdl');
const { rows, settings, version } = classify(wsdlPath);

const findings = rows.filter((r) => r.finding);
const shown = flags.has('all') ? rows : findings;
const count = (pred: (r: Row) => boolean): number => rows.filter(pred).length;

process.stdout.write(`${mdTable(shown)}\n\n`);
process.stdout.write(
  `WSDL v${version}: ${count((r) => r.wsdl === 'decomposable')} decomposable, ${count((r) => r.wsdl === 'leaf-only')} leaf-only, ` +
    `${count((r) => r.wsdl === 'not in WSDL')} not in WSDL (of ${rows.length} registry types).\n` +
    `${count((r) => r.finding.startsWith('doc says leaf-only'))} ⚠️ rows have nested elements; ` +
    `${count((r) => r.finding.startsWith('doc says decomposable'))} ✅/🔀 rows are schema leaf-only; ` +
    `${count((r) => r.finding.startsWith('unverified'))} doc rows can't be checked against this WSDL.\n` +
    `Settings files under -m settings: ${settings.filter((s) => s.wsdl === 'decomposable').length} of ${settings.length} have nested elements.\n`,
);

const mdFlag = flags.get('md');
if (typeof mdFlag === 'string') {
  writeFileSync(
    mdFlag,
    `# WSDL classification (Metadata API v${version})\n\nGenerated by \`npm run audit:classify -- --md ${mdFlag}\`.\n\n` +
      `## Disagreements with METADATA_SUPPORT.md (${findings.length})\n\n${mdTable(findings)}\n\n` +
      `## All registry types (${rows.length})\n\n${mdTable(rows)}\n\n` +
      `## Org settings handled by \`-m settings\` (${settings.length})\n\n${mdTable(settings, false)}\n`,
  );
  process.stdout.write(`Wrote ${mdFlag}\n`);
}
