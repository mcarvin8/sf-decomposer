'use strict';

import * as core from '@actions/core';

import { runDecompose } from './decompose.js';
import { runRecompose } from './recompose.js';
import { runVerify } from './verify.js';

export async function run(): Promise<void> {
  try {
    const mode = core.getInput('mode', { required: true });

    if (mode === 'decompose') {
      await runDecompose();
    } else if (mode === 'recompose') {
      await runRecompose();
    } else if (mode === 'verify') {
      await runVerify();
    } else {
      core.setFailed(`Invalid mode "${mode}". Expected "decompose", "recompose", or "verify".`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}
