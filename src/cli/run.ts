'use strict';

import { access, readFile } from 'node:fs/promises';
import { ParseArgsConfig, parseArgs } from 'node:util';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import { verifyMetadataTypes } from '../core/verifyMetadataTypes.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../helpers/constants.js';
import {
  isMissingMetadataOrManifest,
  resolveDecomposeOptions,
  resolveRecomposeOptions,
  resolveVerifyOptions,
} from '../helpers/runOptions.js';

/** Where the CLI writes. Injected so tests can capture output. */
export type CliIo = {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
};

/** Thrown for bad command-line input; printed without a stack trace. */
class CliUsageError extends Error {}

type Options = NonNullable<ParseArgsConfig['options']>;

const COMMON_OPTIONS: Options = {
  'metadata-type': { type: 'string', short: 'm', multiple: true },
  manifest: { type: 'string', short: 'x' },
  'ignore-package-directory': { type: 'string', short: 'i', multiple: true },
  config: { type: 'boolean', short: 'c', default: false },
  json: { type: 'boolean', default: false },
  help: { type: 'boolean', short: 'h', default: false },
};

const SHAPE_OPTIONS: Options = {
  format: { type: 'string', short: 'f' },
  strategy: { type: 'string', short: 's' },
  'decompose-nested-permissions': { type: 'boolean', short: 'p', default: false },
};

const COMMAND_OPTIONS: Record<string, Options> = {
  decompose: {
    ...COMMON_OPTIONS,
    ...SHAPE_OPTIONS,
    prepurge: { type: 'boolean', default: false },
    postpurge: { type: 'boolean', default: false },
    'update-forceignore': { type: 'boolean', default: false },
    'update-gitattributes': { type: 'boolean', default: false },
  },
  recompose: {
    ...COMMON_OPTIONS,
    postpurge: { type: 'boolean', default: false },
  },
  verify: {
    ...COMMON_OPTIONS,
    ...SHAPE_OPTIONS,
  },
};

const COMMON_HELP = `  -m, --metadata-type <suffix>          Metadata suffix to process, e.g. flow, labels, permissionset
                                        (repeatable). Required unless --manifest or --config sets it.
  -x, --manifest <path>                 Only process components listed in this package.xml
  -i, --ignore-package-directory <dir>  Skip this package directory (repeatable)
  -c, --config                          Load settings from .sfdecomposer.config.json in the project root;
                                        explicit flags win over config values
      --json                            Print the result as JSON on stdout (logs go to stderr)
  -h, --help                            Show this help`;

const SHAPE_HELP = `  -f, --format <format>                 Decomposed file format: ${DECOMPOSED_FILE_TYPES.join(', ')} (default: xml)
  -s, --strategy <strategy>             ${DECOMPOSED_STRATEGIES.join(' or ')} (default: unique-id)
  -p, --decompose-nested-permissions    With grouped-by-tag, also split permission set object/field permissions`;

const HELP: Record<string, string> = {
  decompose: `Usage: sf-decomposer decompose [options]

Decompose large Salesforce metadata XML files into smaller files. Run it after retrieving metadata.

${COMMON_HELP}
${SHAPE_HELP}
      --prepurge                        Remove existing decomposed files first
      --postpurge                       Remove the original files after decomposing
      --update-forceignore              Add decomposed file patterns to .forceignore
      --update-gitattributes            Add root metadata file patterns to .gitattributes`,
  recompose: `Usage: sf-decomposer recompose [options]

Recompose decomposed files into deployment-ready metadata files. Run it before deploying.

${COMMON_HELP}
      --postpurge                       Remove the decomposed files after recomposing`,
  verify: `Usage: sf-decomposer verify [options]

Check that decompose followed by recompose preserves your metadata, in a temporary directory.
Never changes your files. Exits 1 if any file drifts.

${COMMON_HELP}
${SHAPE_HELP}`,
};

export const MAIN_HELP = `Usage: sf-decomposer <command> [options]

Decompose and recompose Salesforce metadata without the Salesforce CLI.
Run it inside a Salesforce DX project (a folder with sfdx-project.json, or below one).

Commands:
  decompose   Split large metadata files into smaller files
  recompose   Rebuild deployment-ready metadata files from decomposed files
  verify      Round-trip check that decompose + recompose preserves your metadata

Options:
  -h, --help     Show help (use "sf-decomposer <command> --help" for a command's options)
  -v, --version  Print the installed version`;

async function readVersion(): Promise<string> {
  // lib/cli/run.js -> package root; the same layout holds for both published packages.
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf-8')) as {
    version: string;
  };
  return pkg.version;
}

function pickOne(name: string, value: unknown, allowed: string[]): string | undefined {
  if (value === undefined) return undefined;
  const text = String(value);
  if (!allowed.includes(text)) {
    throw new CliUsageError(`Invalid --${name} "${text}". Expected one of: ${allowed.join(', ')}.`);
  }
  return text;
}

async function checkManifestExists(manifest: string | undefined): Promise<void> {
  if (manifest === undefined) return;
  try {
    await access(manifest);
  } catch (err) {
    throw new CliUsageError(`Manifest file not found: ${manifest}`, { cause: err });
  }
}

const MISSING_TYPES_MESSAGE =
  'Either --metadata-type (-m) or --manifest (-x) must be provided, or use --config (-c) with a config file that specifies metadataSuffixes or manifest.';

async function runCommand(
  command: string,
  values: Record<string, unknown>,
  log: (msg: string) => void,
  warn: (msg: string) => void,
): Promise<{ result: unknown; failed: boolean }> {
  const common = {
    metadataTypes: values['metadata-type'] as string[] | undefined,
    manifest: values['manifest'] as string | undefined,
    ignoreDirs: values['ignore-package-directory'] as string[] | undefined,
    config: values['config'] === true,
    warn,
  };
  await checkManifestExists(common.manifest);

  if (command === 'recompose') {
    const options = await resolveRecomposeOptions({ ...common, postpurge: values['postpurge'] === true });
    if (isMissingMetadataOrManifest(options)) throw new CliUsageError(MISSING_TYPES_MESSAGE);
    return { result: await recomposeMetadataTypes({ ...options, log }), failed: false };
  }

  const shape = {
    format: pickOne('format', values['format'], DECOMPOSED_FILE_TYPES),
    strategy: pickOne('strategy', values['strategy'], DECOMPOSED_STRATEGIES),
    decomposeNestedPerms: values['decompose-nested-permissions'] === true,
  };

  if (command === 'decompose') {
    const options = await resolveDecomposeOptions({
      ...common,
      ...shape,
      prepurge: values['prepurge'] === true,
      postpurge: values['postpurge'] === true,
      updateForceignore: values['update-forceignore'] === true,
      updateGitattributes: values['update-gitattributes'] === true,
    });
    if (isMissingMetadataOrManifest(options)) throw new CliUsageError(MISSING_TYPES_MESSAGE);
    return { result: await decomposeMetadataTypes({ ...options, log }), failed: false };
  }

  const options = await resolveVerifyOptions({ ...common, ...shape });
  if (isMissingMetadataOrManifest(options)) throw new CliUsageError(MISSING_TYPES_MESSAGE);
  const result = await verifyMetadataTypes({ ...options, log });
  for (const file of result.reordered) {
    log(`Reordered only (not a failure): ${file}`);
  }
  for (const { path, reason } of result.drift) {
    warn(`${path}: ${reason}`);
  }
  if (result.drift.length > 0) {
    warn(`Round-trip verify failed: ${result.drift.length} file(s) drifted.`);
  }
  return { result, failed: result.drift.length > 0 };
}

/**
 * Run the standalone CLI with `argv` (without the node and script paths). Returns the process
 * exit code: 0 on success, 1 on bad input, an error, or verify drift.
 */
export async function run(argv: string[], io: CliIo): Promise<number> {
  const [command, ...rest] = argv;

  try {
    if (command === undefined || command === '-h' || command === '--help') {
      io.stdout(`${MAIN_HELP}\n`);
      return command === undefined ? 1 : 0;
    }
    if (command === '-v' || command === '--version') {
      io.stdout(`${await readVersion()}\n`);
      return 0;
    }
    const options = COMMAND_OPTIONS[command];
    if (!options) {
      throw new CliUsageError(`Unknown command "${command}". Expected decompose, recompose, or verify.`);
    }

    let values: Record<string, unknown>;
    try {
      ({ values } = parseArgs({ args: rest, options, strict: true, allowPositionals: false }));
    } catch (err) {
      throw new CliUsageError(err instanceof Error ? err.message : String(err), { cause: err });
    }
    if (values['help'] === true) {
      io.stdout(`${HELP[command]}\n`);
      return 0;
    }

    const json = values['json'] === true;
    const log = (msg: string): void => (json ? io.stderr(`${msg}\n`) : io.stdout(`${msg}\n`));
    const warn = (msg: string): void => io.stderr(`Warning: ${msg}\n`);

    const { result, failed } = await runCommand(command, values, log, warn);
    if (json) io.stdout(`${JSON.stringify(result, null, 2)}\n`);
    return failed ? 1 : 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    io.stderr(err instanceof CliUsageError ? `${message}\n` : `Error: ${message}\n`);
    return 1;
  }
}
