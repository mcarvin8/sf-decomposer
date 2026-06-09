'use strict';

import { join, relative } from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';

export type ProcessedMeta = {
  metadataPaths: string[];
  metaSuffix: string;
  strictDirectoryName: boolean;
};

type PathTask = { metadataPath: string; metaSuffix: string };

type PathResult = { type: 'labels'; pattern: string } | { type: 'dirs'; rels: string[] };

async function resolvePathEntries(task: PathTask, repoRoot: string): Promise<PathResult> {
  const { metadataPath, metaSuffix } = task;
  if (metaSuffix === 'labels') {
    // Decomposed label output is flat *.label-meta.xml files, not subdirectories.
    // Without opting into Salesforce's beta label decomposition in sfdx-project.json,
    // the CLI won't recognize them as source — ignore them via a glob pattern.
    const rel = relative(repoRoot, metadataPath).replace(/\\/g, '/');
    return { type: 'labels', pattern: `${rel}/*.label-meta.xml` };
  }
  const entries = await readdir(metadataPath, { withFileTypes: true });
  const rels = entries
    .filter((e) => e.isDirectory())
    .map((entry) => relative(repoRoot, join(metadataPath, entry.name)).replace(/\\/g, '/'));
  return { type: 'dirs', rels };
}

export async function updateForceignoreFile(processedMeta: ProcessedMeta[], repoRoot: string): Promise<void> {
  const forceignorePath = join(repoRoot, '.forceignore');

  let existingContent = '';
  try {
    existingContent = await readFile(forceignorePath, 'utf-8');
  } catch {
    // .forceignore doesn't exist yet; start fresh
  }

  const existingLines = existingContent ? existingContent.split('\n') : [];
  const existingSet = new Set(existingLines.map((l) => l.trim()));

  const tasks: PathTask[] = processedMeta
    .filter(({ strictDirectoryName }) => !strictDirectoryName)
    // Component container dirs for strict types (e.g. bots/MyBot/) are valid SF DX source.
    // The decomposed pieces inside are handled by the component's main XML; skip them.
    .flatMap(({ metadataPaths, metaSuffix }) => metadataPaths.map((metadataPath) => ({ metadataPath, metaSuffix })));

  const results = await Promise.allSettled(tasks.map((task) => resolvePathEntries(task, repoRoot)));

  const toAdd: string[] = [];
  for (const result of results) {
    if (result.status === 'rejected') continue;
    if (result.value.type === 'labels') {
      const { pattern } = result.value;
      if (!existingSet.has(pattern)) {
        toAdd.push(pattern);
        existingSet.add(pattern);
      }
    } else {
      for (const rel of result.value.rels) {
        if (!existingSet.has(rel) && !existingSet.has(`${rel}/`)) {
          toAdd.push(rel);
          existingSet.add(rel);
        }
      }
    }
  }

  if (toAdd.length === 0) return;

  const trimmedContent = existingContent.trimEnd();
  const content = (trimmedContent ? trimmedContent + '\n' : '') + toAdd.join('\n') + '\n';
  await writeFile(forceignorePath, content, 'utf-8');
}
