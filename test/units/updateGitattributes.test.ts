'use strict';

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type ProcessedMeta } from '../../src/service/core/updateForceignore.js';
import { updateGitattributesFile } from '../../src/service/core/updateGitattributes.js';

describe('updateGitattributesFile', () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await mkdtemp(join(tmpdir(), 'gitattributes-test-'));
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  async function readGitattributes(): Promise<string> {
    return readFile(join(repoRoot, '.gitattributes'), 'utf-8');
  }

  async function writeGitattributes(content: string): Promise<void> {
    await writeFile(join(repoRoot, '.gitattributes'), content, 'utf-8');
  }

  it('creates .gitattributes with root file pattern for a standard type', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/flows/*.flow-meta.xml -diff linguist-generated=true');
    expect(content.endsWith('\n')).toBe(true);
  });

  it('adds single root file pattern for labels', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'labels', metaSuffix: 'labels', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/labels/CustomLabels.labels-meta.xml -diff linguist-generated=true');
    expect(lines).toHaveLength(1);
  });

  it('adds two root file patterns for bot', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'bots', metaSuffix: 'bot', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/bots/*/*.bot-meta.xml -diff linguist-generated=true');
    expect(lines).toContain('**/bots/*/*.botVersion-meta.xml -diff linguist-generated=true');
  });

  it('ignores format field — root patterns always use -meta.xml', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'yaml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/flows/*.flow-meta.xml -diff linguist-generated=true');
    expect(lines).not.toContain('**/flows/*.flow-meta.yaml -diff linguist-generated=true');
  });

  it('appends new entries to existing .gitattributes', async () => {
    await writeGitattributes('# existing\n*.json text\n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    expect(content).toContain('# existing');
    expect(content).toContain('*.json text');
    expect(content).toContain('**/flows/*.flow-meta.xml -diff linguist-generated=true');
  });

  it('preserves existing content with no blank line between', async () => {
    await writeGitattributes('# sf-decomposer\n*.json text\n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    expect(content).toBe('# sf-decomposer\n*.json text\n**/flows/*.flow-meta.xml -diff linguist-generated=true\n');
  });

  it('deduplicates patterns already present in .gitattributes', async () => {
    await writeGitattributes('**/flows/*.flow-meta.xml -diff linguist-generated=true\n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const occurrences = content.split('**/flows/*.flow-meta.xml -diff linguist-generated=true').length - 1;
    expect(occurrences).toBe(1);
  });

  it('deduplicates entries with surrounding whitespace', async () => {
    await writeGitattributes('  **/flows/*.flow-meta.xml -diff linguist-generated=true  \n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const occurrences = content.split('**/flows/*.flow-meta.xml -diff linguist-generated=true').length - 1;
    expect(occurrences).toBe(1);
  });

  it('does not write file when all patterns are already present', async () => {
    const existingContent = '**/flows/*.flow-meta.xml -diff linguist-generated=true\n';
    await writeGitattributes(existingContent);

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateGitattributesFile(processedMeta, repoRoot);

    expect(await readGitattributes()).toBe(existingContent);
  });

  it('handles multiple metadata types in a single call', async () => {
    const processedMeta: ProcessedMeta[] = [
      { directoryName: 'flows', metaSuffix: 'flow', format: 'xml' },
      { directoryName: 'permissionsets', metaSuffix: 'permissionset', format: 'xml' },
    ];
    await updateGitattributesFile(processedMeta, repoRoot);

    const content = await readGitattributes();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/flows/*.flow-meta.xml -diff linguist-generated=true');
    expect(lines).toContain('**/permissionsets/*.permissionset-meta.xml -diff linguist-generated=true');
  });
});
