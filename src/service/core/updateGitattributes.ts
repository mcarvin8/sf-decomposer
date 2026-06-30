'use strict';

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { type ProcessedMeta } from './updateForceignore.js';

const ATTRS = '-diff linguist-generated=true';

function buildPatterns(directoryName: string, metaSuffix: string): string[] {
  if (metaSuffix === 'labels') {
    return [`**/labels/CustomLabels.labels-meta.xml ${ATTRS}`];
  }
  if (metaSuffix === 'bot') {
    return [`**/${directoryName}/*/*.bot-meta.xml ${ATTRS}`, `**/${directoryName}/*/*.botVersion-meta.xml ${ATTRS}`];
  }
  return [`**/${directoryName}/*.${metaSuffix}-meta.xml ${ATTRS}`];
}

export async function updateGitattributesFile(processedMeta: ProcessedMeta[], repoRoot: string): Promise<void> {
  const gitattributesPath = join(repoRoot, '.gitattributes');

  let existingContent = '';
  try {
    existingContent = await readFile(gitattributesPath, 'utf-8');
  } catch {
    // .gitattributes doesn't exist yet; start fresh
  }

  // Stryker disable next-line ArrayDeclaration -- empty-array fallback; ["Stryker was here"] is observationally equivalent since no real pattern matches that sentinel
  const existingLines = existingContent ? existingContent.split('\n') : [];
  const existingSet = new Set(existingLines.map((l) => l.trim()));

  const toAdd: string[] = [];
  for (const { directoryName, metaSuffix } of processedMeta) {
    for (const pattern of buildPatterns(directoryName, metaSuffix)) {
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
  await writeFile(gitattributesPath, content, 'utf-8');
}
