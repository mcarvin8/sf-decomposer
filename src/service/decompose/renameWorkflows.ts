/* eslint-disable no-await-in-loop */
'use strict';

import { join } from 'node:path';
import { readdir, rename } from 'node:fs/promises';
import pLimit from 'p-limit';

import { WORKFLOW_SUFFIX_MAPPING, CONCURRENCY_LIMITS } from '../../helpers/constants.js';

export async function renameWorkflows(directory: string): Promise<void> {
  const files = await readdir(directory, { recursive: true });

  // Limit concurrent file rename operations
  const limit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);

  const tasks = files.map((file) =>
    limit(async () => {
      for (const [suffix, newSuffix] of Object.entries(WORKFLOW_SUFFIX_MAPPING)) {
        if (file.includes(suffix)) {
          const oldFilePath = join(directory, file);
          const newFilePath = join(directory, file.replace(suffix, newSuffix));
          await rename(oldFilePath, newFilePath);
          break;
        }
      }
    })
  );

  await Promise.all(tasks);
}
