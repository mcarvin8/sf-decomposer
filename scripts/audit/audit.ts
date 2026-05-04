/*
 * Single-type round-trip audit.
 *
 * Stages a (capped) sample of files for one metadata type into a fresh SFDX
 * project, runs decompose then recompose via the local CLI entrypoint, and
 * reports a one-row summary that catches:
 *
 *   - file-count mismatches      (orig vs rebuilt)
 *   - <name>-multiset mismatches (per-file data loss)
 *   - SHA-256 hash filenames     (uniqueIdElements coverage opportunity)
 *   - parent-only output dirs    (dotted-fullName merge bug)
 *
 * Usage:
 *   npm run audit -- \
 *     --type quickActions \
 *     --suffix quickAction \
 *     --source-root C:/path/to/force-app/main/default \
 *     [--sample 50] \
 *     [--unique-id-elements value] \
 *     [--plugin /path/to/sf-decomposer]
 *
 * The script exits non-zero only when the source dir is missing or the CLI
 * failed to produce any output dirs at all. Hash filenames and content-set
 * mismatches are surfaced via the returned row, not via exit code, so this
 * harness can be wrapped in a sweeping driver (see roundtrip.ts).
 */

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type AuditRow,
  DEFAULT_PLUGIN_ROOT,
  DEFAULT_WORK_ROOT,
  countHashFiles,
  formatTable,
  listFlatXml,
  listSubdirs,
  listXmlFilesRecursive,
  nameMultisetMatches,
  optionalInt,
  parseFlags,
  requireString,
  runCli,
  stageProject,
} from './lib.js';

const HELP_HINT = 'Run with --help for full usage.';

const HELP_TEXT = `Usage: npm run audit -- [options]

Required:
  --type <dirName>           Source directory name (e.g. quickActions, applications)
  --suffix <metadataSuffix>  CLI -m value (e.g. quickAction, app, md)
  --source-root <path>       Path to force-app/main/default (or equivalent)

Optional:
  --sample <n>               Cap input file count (default: 0 = no cap)
  --unique-id-elements <s>   Override uniqueIdElements for this run
  --plugin <path>            Path to sf-decomposer repo root (default: cwd)
  --work-root <path>         Workspace root for staging (default: <tmp>/sfd-audit)
  --quiet                    Suppress per-file CLI logs
  --help, -h                 Show this help
`;

export interface AuditOptions {
  type: string;
  suffix: string;
  sourceRoot: string;
  pluginRoot: string;
  workRoot: string;
  sample: number;
  uniqueIdElements?: string;
  quiet: boolean;
}

export function runAudit(opts: AuditOptions): AuditRow {
  const sourceDir = join(opts.sourceRoot, opts.type);
  if (!existsSync(sourceDir)) {
    throw new Error(`No source dir for type "${opts.type}": ${sourceDir}`);
  }

  const workDir = join(opts.workRoot, opts.type);
  const { destDir, stagedCount } = stageProject({
    workDir,
    sourceDir,
    typeDirName: opts.type,
    sample: opts.sample,
  });

  if (!opts.quiet) {
    process.stdout.write(`[${opts.type}] staged ${stagedCount} files\n`);
  }

  const decomposeArgv = ['decomposer', 'decompose', '-m', opts.suffix, '--postpurge'];
  if (opts.uniqueIdElements) decomposeArgv.push('-u', opts.uniqueIdElements);

  const decomposeResult = runCli({
    pluginRoot: opts.pluginRoot,
    cwd: workDir,
    argv: decomposeArgv,
    logFile: join(workDir, 'decompose.log'),
  });
  // Exit code 1 is non-fatal: config-disassembler logs at ERROR for leaf-only
  // files it correctly skips. We only care whether output dirs were produced.

  const allDirs = listSubdirs(destDir);
  // Heuristic: in dotted-fullName types (approvalProcess, customMetadata,
  // quickAction), per-component output dirs contain a `.`. The pre-0.4.4
  // merge bug produced parent-only dirs (no dot) by collapsing siblings.
  const perComponentDirs = allDirs.filter((d) => d.name.includes('.')).length;
  const parentOnlyDirs = allDirs.length - perComponentDirs;

  const allXml = listXmlFilesRecursive(destDir);
  const hashFiles = countHashFiles(allXml);

  const recomposeResult = runCli({
    pluginRoot: opts.pluginRoot,
    cwd: workDir,
    argv: ['decomposer', 'recompose', '-m', opts.suffix, '--postpurge'],
    logFile: join(workDir, 'recompose.log'),
  });

  const rebuilt = listFlatXml(destDir);
  let contentMatch = 0;
  let contentDiff = 0;
  let missing = 0;
  for (const r of rebuilt) {
    const orig = join(sourceDir, basename(r));
    if (!existsSync(orig)) {
      missing++;
      continue;
    }
    if (nameMultisetMatches(orig, r)) contentMatch++;
    else contentDiff++;
  }

  return {
    type: opts.type,
    suffix: opts.suffix,
    origFiles: stagedCount,
    rebuiltFiles: rebuilt.length,
    decomposedDirs: allDirs.length,
    perComponentDirs,
    parentOnlyDirs,
    hashFiles,
    contentSetMatch: contentMatch,
    contentSetDiff: contentDiff,
    missing,
    exitDecompose: decomposeResult.status ?? -1,
    exitRecompose: recomposeResult.status ?? -1,
  };
}

function basename(p: string): string {
  const idx = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return idx === -1 ? p : p.slice(idx + 1);
}

function parseCli(argv: readonly string[]): AuditOptions {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }
  const flags = parseFlags(argv);
  const type = requireString(flags, 'type', HELP_HINT);
  const suffix = requireString(flags, 'suffix', HELP_HINT);
  const sourceRoot = requireString(flags, 'source-root', HELP_HINT);
  const pluginRoot = (flags.get('plugin') as string | undefined) ?? DEFAULT_PLUGIN_ROOT;
  const workRoot = (flags.get('work-root') as string | undefined) ?? DEFAULT_WORK_ROOT;
  const sample = optionalInt(flags, 'sample', 0);
  const uniqueIdElements = flags.get('unique-id-elements');
  return {
    type,
    suffix,
    sourceRoot,
    pluginRoot,
    workRoot,
    sample,
    uniqueIdElements: typeof uniqueIdElements === 'string' ? uniqueIdElements : undefined,
    quiet: flags.has('quiet'),
  };
}

function isDirectInvocation(): boolean {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
}

if (isDirectInvocation()) {
  try {
    const opts = parseCli(process.argv.slice(2));
    const row = runAudit(opts);
    process.stdout.write('\n' + formatTable([row]) + '\n');
    // Hard fail only on real data-loss signals: a per-file <name> multiset
    // mismatch, or a rebuilt-file count that disagrees with the staged
    // count. `parentOnlyDirs` is intentionally informational: types whose
    // fullNames legitimately contain no dot (e.g. quickActions on Global,
    // most non-dotted types) report parentOnlyDirs > 0 by design.
    if (row.contentSetDiff > 0 || (row.origFiles > 0 && row.rebuiltFiles !== row.origFiles)) {
      process.exitCode = 2;
    }
  } catch (err) {
    process.stderr.write(`audit error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
