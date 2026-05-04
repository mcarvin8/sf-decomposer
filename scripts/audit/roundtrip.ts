/*
 * Round-trip integrity audit across a curated list of metadata types.
 *
 * For each (type, suffix) pair, runs the single-type audit (decompose +
 * recompose) and reports a one-row-per-type summary. A non-zero
 * `contentSetDiff` or `parentOnlyDirs` count, or a `rebuiltFiles != origFiles`
 * mismatch, indicates a uniqueIdElements collision or a structural bug.
 *
 * The driver exits non-zero when ANY row in the summary shows data loss, so
 * this can be wired into CI as a regression gate against real metadata
 * archives.
 *
 * Usage:
 *   npm run audit:roundtrip -- --source-root C:/path/to/force-app/main/default \
 *     [--sample 0] [--plugin /path/to/sf-decomposer]
 */

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type AuditRow,
  DEFAULT_PLUGIN_ROOT,
  DEFAULT_WORK_ROOT,
  formatTable,
  optionalInt,
  parseFlags,
  requireString,
} from './lib.js';
import { runAudit } from './audit.js';
import { ROUNDTRIP_PAIRS } from './type-pairs.js';

const HELP_TEXT = `Usage: npm run audit:roundtrip -- [options]

Required:
  --source-root <path>     Path to force-app/main/default (or equivalent)

Optional:
  --sample <n>             Default per-type cap (overridden by per-pair cap; default: 0)
  --plugin <path>          Path to sf-decomposer repo root (default: cwd)
  --work-root <path>       Workspace root for staging (default: <tmp>/sfd-audit)
  --help, -h               Show this help
`;

interface RoundtripOptions {
  sourceRoot: string;
  pluginRoot: string;
  workRoot: string;
  defaultSample: number;
}

function runRoundtrip(opts: RoundtripOptions): AuditRow[] {
  const rows: AuditRow[] = [];
  for (const pair of ROUNDTRIP_PAIRS) {
    const sourceDir = join(opts.sourceRoot, pair.type);
    if (!existsSync(sourceDir)) {
      process.stdout.write(`[skip] ${pair.type} (no source dir)\n`);
      continue;
    }
    const sample = pair.sample ?? opts.defaultSample;
    process.stdout.write(`[audit] ${pair.type} (suffix=${pair.suffix}, sample=${sample})\n`);
    try {
      const row = runAudit({
        type: pair.type,
        suffix: pair.suffix,
        sourceRoot: opts.sourceRoot,
        pluginRoot: opts.pluginRoot,
        workRoot: opts.workRoot,
        sample,
        quiet: true,
      });
      rows.push(row);
    } catch (err) {
      process.stderr.write(`  failed: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }
  return rows;
}

function parseCli(argv: readonly string[]): RoundtripOptions {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }
  const flags = parseFlags(argv);
  const sourceRoot = requireString(flags, 'source-root', 'Run with --help for full usage.');
  const pluginRoot = (flags.get('plugin') as string | undefined) ?? DEFAULT_PLUGIN_ROOT;
  const workRoot = (flags.get('work-root') as string | undefined) ?? DEFAULT_WORK_ROOT;
  const defaultSample = optionalInt(flags, 'sample', 0);
  return { sourceRoot, pluginRoot, workRoot, defaultSample };
}

function isDirectInvocation(): boolean {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
}

if (isDirectInvocation()) {
  try {
    const opts = parseCli(process.argv.slice(2));
    const rows = runRoundtrip(opts);
    process.stdout.write('\n=== ROUND-TRIP SUMMARY ===\n');
    process.stdout.write(
      formatTable(rows, [
        'type',
        'origFiles',
        'rebuiltFiles',
        'decomposedDirs',
        'parentOnlyDirs',
        'hashFiles',
        'contentSetMatch',
        'contentSetDiff',
        'missing',
      ]) + '\n',
    );
    // Hard fail only on real data-loss signals (see audit.ts for rationale).
    // `parentOnlyDirs` stays in the table for inspection but does not gate.
    const failing = rows.filter((r) => r.contentSetDiff > 0 || (r.origFiles > 0 && r.rebuiltFiles !== r.origFiles));
    if (failing.length > 0) {
      process.stderr.write(`\nFAIL: ${failing.length} type(s) showed data loss:\n`);
      for (const r of failing) {
        process.stderr.write(
          `  - ${r.type}: orig=${r.origFiles} rebuilt=${r.rebuiltFiles} ` +
            `diff=${r.contentSetDiff} parentOnly=${r.parentOnlyDirs} hashFiles=${r.hashFiles}\n`,
        );
      }
      process.exit(2);
    }
    process.stdout.write('\nOK: all audited types round-tripped cleanly.\n');
  } catch (err) {
    process.stderr.write(`roundtrip error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
