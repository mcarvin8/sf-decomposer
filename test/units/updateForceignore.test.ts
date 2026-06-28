'use strict';

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type ProcessedMeta, updateForceignoreFile } from '../../src/service/core/updateForceignore.js';

describe('updateForceignoreFile', () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await mkdtemp(join(tmpdir(), 'forceignore-test-'));
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  async function readForceignore(): Promise<string> {
    return readFile(join(repoRoot, '.forceignore'), 'utf-8');
  }

  async function writeForceignore(content: string): Promise<void> {
    await writeFile(join(repoRoot, '.forceignore'), content, 'utf-8');
  }

  it('creates .forceignore with ignore and allow patterns for a standard type', async () => {
    const processedMeta: ProcessedMeta[] = [
      { directoryName: 'permissionsets', metaSuffix: 'permissionset', format: 'xml' },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    // File created from scratch — must start with a real pattern, not a residual initial-value sentinel
    expect(content.startsWith('**/permissionsets/')).toBe(true);
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/permissionsets/**/*.xml');
    expect(lines).toContain('!**/permissionsets/*.permissionset-meta.xml');
    expect(content.endsWith('\n')).toBe(true);
  });

  it('adds flat ignore and specific allow pattern for labels', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'labels', metaSuffix: 'labels', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const lines = content.split('\n').filter(Boolean);
    // Labels are flat — one level deep only, not recursive
    expect(lines).toContain('**/labels/*.xml');
    expect(lines).not.toContain('**/labels/**/*.xml');
    expect(lines).toContain('!**/labels/CustomLabels.labels-meta.xml');
  });

  it('uses the decomposed format in the ignore pattern', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'yaml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/flows/**/*.yaml');
    // Allow pattern always uses .xml (originals are always Salesforce XML)
    expect(lines).toContain('!**/flows/*.flow-meta.xml');
    expect(lines).not.toContain('**/flows/**/*.xml');
  });

  it('appends new entries to existing .forceignore', async () => {
    await writeForceignore('# existing entry\nsome/path\n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toContain('# existing entry');
    expect(content).toContain('some/path');
    expect(content).toContain('**/flows/**/*.xml');
  });

  it('preserves existing content at the top with no blank line between', async () => {
    await writeForceignore('# sf-decomposer\n*.xml\n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toBe('# sf-decomposer\n*.xml\n**/flows/**/*.xml\n!**/flows/*.flow-meta.xml\n');
  });

  it('deduplicates patterns already present in .forceignore', async () => {
    await writeForceignore('**/permissionsets/**/*.xml\n!**/permissionsets/*.permissionset-meta.xml\n');

    const processedMeta: ProcessedMeta[] = [
      { directoryName: 'permissionsets', metaSuffix: 'permissionset', format: 'xml' },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const ignoreOccurrences = content.split('**/permissionsets/**/*.xml').length - 1;
    const allowOccurrences = content.split('!**/permissionsets/*.permissionset-meta.xml').length - 1;
    expect(ignoreOccurrences).toBe(1);
    expect(allowOccurrences).toBe(1);
  });

  it('deduplicates entries with surrounding whitespace in .forceignore', async () => {
    await writeForceignore('  **/flows/**/*.xml  \n');

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const ignoreOccurrences = content.split('**/flows/**/*.xml').length - 1;
    expect(ignoreOccurrences).toBe(1);
  });

  it('does not write file when all patterns are already present', async () => {
    const existingContent = '**/flows/**/*.xml\n!**/flows/*.flow-meta.xml\n';
    await writeForceignore(existingContent);

    const processedMeta: ProcessedMeta[] = [{ directoryName: 'flows', metaSuffix: 'flow', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    expect(await readForceignore()).toBe(existingContent);
  });

  it('adds bot patterns with component dir depth and two allow entries', async () => {
    const processedMeta: ProcessedMeta[] = [{ directoryName: 'bots', metaSuffix: 'bot', format: 'xml' }];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/bots/**/*.xml');
    expect(lines).toContain('!**/bots/*/*.bot-meta.xml');
    expect(lines).toContain('!**/bots/*/*.botVersion-meta.xml');
  });

  it('handles multiple metadata types in a single call', async () => {
    const processedMeta: ProcessedMeta[] = [
      { directoryName: 'flows', metaSuffix: 'flow', format: 'xml' },
      { directoryName: 'permissionsets', metaSuffix: 'permissionset', format: 'xml' },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('**/flows/**/*.xml');
    expect(lines).toContain('!**/flows/*.flow-meta.xml');
    expect(lines).toContain('**/permissionsets/**/*.xml');
    expect(lines).toContain('!**/permissionsets/*.permissionset-meta.xml');
  });
});
