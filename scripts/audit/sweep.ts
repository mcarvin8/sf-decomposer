/*
 * Decompose-only sweep across a curated list of metadata types.
 *
 * For each (type, suffix) pair, stages a capped sample, runs decompose, and
 * tallies SHA-256 hash filenames per inner directory. Used to surface
 * uniqueIdElements coverage opportunities at scale: a high HashFiles count
 * for a given type means its repeating child elements are falling back to
 * content hashes for filenames, which is correct but suboptimal for human
 * readability and source-control diffs.
 *
 * Usage:
 *   npm run audit:sweep -- --source-root C:/path/to/force-app/main/default \
 *     [--sample 30] [--plugin /path/to/sf-decomposer]
 */

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type SweepRow,
  DEFAULT_PLUGIN_ROOT,
  DEFAULT_WORK_ROOT,
  countHashFiles,
  formatTable,
  listSubdirs,
  listXmlFilesRecursive,
  optionalInt,
  parseFlags,
  requireString,
  runCli,
  stageProject,
  topHashDirs,
} from './lib.js';
import { SWEEP_PAIRS } from './type-pairs.js';

const HELP_TEXT = `Usage: npm run audit:sweep -- [options]

Required:
  --source-root <path>     Path to force-app/main/default (or equivalent)

Optional:
  --sample <n>             Per-type input file cap (default: 30)
  --plugin <path>          Path to sf-decomposer repo root (default: cwd)
  --work-root <path>       Workspace root for staging (default: <tmp>/sfd-audit)
  --help, -h               Show this help
`;

interface SweepOptions {
  sourceRoot: string;
  pluginRoot: string;
  workRoot: string;
  sample: number;
}

function runSweep(opts: SweepOptions): SweepRow[] {
  const rows: SweepRow[] = [];

  for (const pair of SWEEP_PAIRS) {
    const sourceDir = join(opts.sourceRoot, pair.type);
    if (!existsSync(sourceDir)) continue;

    const workDir = join(opts.workRoot, `sweep-${pair.type}`);
    const { destDir, stagedCount } = stageProject({
      workDir,
      sourceDir,
      typeDirName: pair.type,
      sample: opts.sample,
    });

    const decomposeResult = runCli({
      pluginRoot: opts.pluginRoot,
      cwd: workDir,
      argv: ['decomposer', 'decompose', '-m', pair.suffix],
      logFile: join(workDir, 'decompose.log'),
    });

    const allXml = listXmlFilesRecursive(destDir);
    const hashFiles = countHashFiles(allXml);
    const top = topHashDirs(allXml, 3);
    const allDirs = listSubdirs(destDir);
    const parentOnlyDirs = allDirs.filter((d) => !d.name.includes('.')).length;

    const row: SweepRow = {
      type: pair.type,
      suffix: pair.suffix,
      staged: stagedCount,
      decomposedDirs: allDirs.length,
      parentOnlyDirs,
      hashFiles,
      topHashDirs: top,
      exit: decomposeResult.status ?? -1,
    };
    rows.push(row);

    process.stdout.write(
      `[done] ${pair.type.padEnd(22)} staged=${String(stagedCount).padEnd(3)} ` +
        `hashes=${String(hashFiles).padEnd(4)} top=${top}\n`,
    );
  }

  return rows;
}

function parseCli(argv: readonly string[]): SweepOptions {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }
  const flags = parseFlags(argv);
  const sourceRoot = requireString(flags, 'source-root', 'Run with --help for full usage.');
  const pluginRoot = (flags.get('plugin') as string | undefined) ?? DEFAULT_PLUGIN_ROOT;
  const workRoot = (flags.get('work-root') as string | undefined) ?? DEFAULT_WORK_ROOT;
  const sample = optionalInt(flags, 'sample', 30);
  return { sourceRoot, pluginRoot, workRoot, sample };
}

function isDirectInvocation(): boolean {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
}

if (isDirectInvocation()) {
  try {
    const opts = parseCli(process.argv.slice(2));
    const rows = runSweep(opts).sort((a, b) => b.hashFiles - a.hashFiles);
    process.stdout.write('\n=== HASH-FILENAME SWEEP ===\n');
    process.stdout.write(
      formatTable(rows, [
        'type',
        'suffix',
        'staged',
        'decomposedDirs',
        'parentOnlyDirs',
        'hashFiles',
        'topHashDirs',
        'exit',
      ]) + '\n',
    );
  } catch (err) {
    process.stderr.write(`sweep error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}
