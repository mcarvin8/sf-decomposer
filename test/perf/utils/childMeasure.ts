'use strict';

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type OpResult = {
  elapsedMs: number;
  rssBeforeBytes: number;
  peakRssBytes: number;
  // Primary memory metric: peak resident memory the operation added on top of
  // the child's steady pre-work footprint. Includes native (Rust/napi)
  // allocations, which JS heapUsed cannot see.
  peakRssDeltaBytes: number;
};

const RESULT_MARKER = '__PERF_RESULT__';
const RUN_OP_PATH = join(dirname(fileURLToPath(import.meta.url)), 'runOp.ts');
// Resolve the tsx loader to an absolute URL from THIS repo's node_modules: the
// child runs with cwd set to a temp fixture copy, where a bare `--import tsx`
// would not resolve.
const TSX_LOADER_URL = pathToFileURL(createRequire(import.meta.url).resolve('tsx')).href;

/**
 * Run one decompose/recompose in a fresh Node process, with `cwd` as the
 * project root and the implementation imported from `srcRoot`/src.
 */
export function runOpInChild(
  srcRoot: string,
  op: 'decompose' | 'recompose',
  options: Record<string, unknown>,
  cwd: string,
): Promise<OpResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      ['--expose-gc', '--import', TSX_LOADER_URL, RUN_OP_PATH, srcRoot, op, JSON.stringify(options)],
      { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      const line = stdout.split('\n').find((l) => l.startsWith(RESULT_MARKER));
      if (code !== 0 || !line) {
        reject(
          new Error(
            `perf child (${op}, src=${srcRoot}) exited with code ${code} and ${line ? 'a' : 'no'} result line.\n` +
              `stderr:\n${stderr.slice(-4000)}`,
          ),
        );
        return;
      }
      // Forward Rust WARN/ERROR lines (RUST_LOG) so they still reach the action log.
      if (stderr.trim()) process.stderr.write(stderr);
      resolvePromise(JSON.parse(line.slice(RESULT_MARKER.length)) as OpResult);
    });
  });
}
