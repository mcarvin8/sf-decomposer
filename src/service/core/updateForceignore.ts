'use strict';

import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

export type ProcessedMeta = {
  directoryName: string;
  metaSuffix: string;
  strictDirectoryName: boolean;
  format: string;
};

function buildPatterns(directoryName: string, metaSuffix: string, format: string): string[] {
  if (metaSuffix === 'labels') {
    // Labels decompose to flat files in the labels dir — one level deep is enough.
    // Allow only the original monolithic file; all individual label files stay ignored.
    return [`**/${directoryName}/*.${format}`, `!**/${directoryName}/CustomLabels.labels-meta.xml`];
  }
  // General case: ignore everything nested inside the type dir (decomposed pieces),
  // then re-allow the original -meta.xml at the root level of that dir.
  return [`**/${directoryName}/**/*.${format}`, `!**/${directoryName}/*.${metaSuffix}-meta.xml`];
}

export async function updateForceignoreFile(processedMeta: ProcessedMeta[], repoRoot: string): Promise<void> {
  const forceignorePath = join(repoRoot, '.forceignore');

  let existingContent = '';
  try {
    existingContent = await readFile(forceignorePath, 'utf-8');
  } catch {
    // .forceignore doesn't exist yet; start fresh
  }

  // Stryker disable next-line ArrayDeclaration -- empty-array fallback; ["Stryker was here"] is observationally equivalent since no real pattern matches that sentinel
  const existingLines = existingContent ? existingContent.split('\n') : [];
  const existingSet = new Set(existingLines.map((l) => l.trim()));

  const toAdd: string[] = [];
  for (const { directoryName, metaSuffix, strictDirectoryName, format } of processedMeta) {
    // Component container dirs for strict types (e.g. bots/MyBot/) are valid SF DX source.
    // The decomposed pieces inside are handled by the component's main XML; skip them.
    if (strictDirectoryName) continue;

    for (const pattern of buildPatterns(directoryName, metaSuffix, format)) {
      if (!existingSet.has(pattern)) {
        toAdd.push(pattern);
        existingSet.add(pattern);
      }
    }
  }

  if (toAdd.length === 0) return;

  const trimmedContent = existingContent.trimEnd();
  const content = (trimmedContent ? trimmedContent + '\n' : '') + toAdd.join('\n') + '\n';
  // Stryker disable next-line StringLiteral -- encoding sentinel "" is not a meaningful substitution; Node behaviour with invalid encoding is environment-specific
  await writeFile(forceignorePath, content, 'utf-8');
}
