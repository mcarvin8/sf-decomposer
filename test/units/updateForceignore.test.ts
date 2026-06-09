'use strict';

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { updateForceignoreFile, type ProcessedMeta } from '../../src/service/core/updateForceignore.js';

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

  async function makeComponentDir(metadataPath: string, name: string): Promise<void> {
    await mkdir(join(metadataPath, name), { recursive: true });
  }

  it('creates .forceignore with component subdirs when file does not exist', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await makeComponentDir(metadataPath, 'HR_Admin');
    await makeComponentDir(metadataPath, 'Dev_Admin');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    // File created from scratch — must start with a real path, not a residual initial-value sentinel
    expect(content.startsWith('force-app/main/default/permissionsets/')).toBe(true);
    // Each entry must be its own line, not concatenated together
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('force-app/main/default/permissionsets/HR_Admin');
    expect(lines).toContain('force-app/main/default/permissionsets/Dev_Admin');
    expect(content.endsWith('\n')).toBe(true);
  });

  it('appends new entries to existing .forceignore', async () => {
    await writeForceignore('# existing entry\nsome/path\n');

    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'flows');
    await makeComponentDir(metadataPath, 'My_Flow');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'flow', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toContain('# existing entry');
    expect(content).toContain('some/path');
    expect(content).toContain('force-app/main/default/flows/My_Flow');
  });

  it('preserves existing content at the top and ends with a newline after appending', async () => {
    await writeForceignore('# sf-decomposer\n*.xml\n');

    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'flows');
    await makeComponentDir(metadataPath, 'My_Flow');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'flow', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    // Exact match: existing content preserved, new entry on its own line, no blank line between, file ends with newline
    expect(content).toBe('# sf-decomposer\n*.xml\nforce-app/main/default/flows/My_Flow\n');
  });

  it('deduplicates entries already present in .forceignore', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await makeComponentDir(metadataPath, 'HR_Admin');
    await writeForceignore('force-app/main/default/permissionsets/HR_Admin\n');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const occurrences = content.split('force-app/main/default/permissionsets/HR_Admin').length - 1;
    expect(occurrences).toBe(1);
  });

  it('deduplicates entries with surrounding whitespace in .forceignore', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await makeComponentDir(metadataPath, 'HR_Admin');
    // Entry has leading/trailing whitespace — trim() must normalize it for dedup to work
    await writeForceignore('  force-app/main/default/permissionsets/HR_Admin  \n');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const hrAdminLines = content.split('\n').filter((l) => l.includes('HR_Admin'));
    expect(hrAdminLines.length).toBe(1);
  });

  it('deduplicates trailing-slash variant already present in .forceignore', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await makeComponentDir(metadataPath, 'HR_Admin');
    await writeForceignore('force-app/main/default/permissionsets/HR_Admin/\n');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const hrAdminLines = content.split('\n').filter((l) => l.includes('HR_Admin'));
    expect(hrAdminLines.length).toBe(1);
  });

  it('does not write file when all entries are already present', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'flows');
    await makeComponentDir(metadataPath, 'My_Flow');

    const existingContent = 'force-app/main/default/flows/My_Flow\n';
    await writeForceignore(existingContent);

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'flow', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toBe(existingContent);
  });

  it('only adds directories, not files, inside a metadata path', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await mkdir(metadataPath, { recursive: true });
    await makeComponentDir(metadataPath, 'HR_Admin');
    await writeFile(join(metadataPath, 'HR_Admin.permissionset-meta.xml'), '<PermissionSet/>');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toContain('force-app/main/default/permissionsets/HR_Admin');
    expect(content).not.toContain('HR_Admin.permissionset-meta.xml');
  });

  it('adds glob pattern for labels type instead of scanning subdirs', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'labels');
    await mkdir(metadataPath, { recursive: true });
    await writeFile(join(metadataPath, 'MyLabel.label-meta.xml'), '<CustomLabel/>');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'labels', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    expect(content).toContain('force-app/main/default/labels/*.label-meta.xml');
    expect(content).not.toContain('MyLabel');
  });

  it('deduplicates labels glob pattern when already present', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'labels');
    await mkdir(metadataPath, { recursive: true });
    const pattern = 'force-app/main/default/labels/*.label-meta.xml';
    await writeForceignore(`${pattern}\n`);

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'labels', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    const occurrences = content.split(pattern).length - 1;
    expect(occurrences).toBe(1);
  });

  it('skips strict-directory types without creating .forceignore', async () => {
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'bots');
    await makeComponentDir(metadataPath, 'MyBot');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [metadataPath], metaSuffix: 'bot', strictDirectoryName: true },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    await expect(readForceignore()).rejects.toThrow();
  });

  it('continues gracefully when a metadataPath does not exist', async () => {
    const nonExistentPath = join(repoRoot, 'force-app', 'main', 'default', 'missing');
    const metadataPath = join(repoRoot, 'force-app', 'main', 'default', 'flows');
    await makeComponentDir(metadataPath, 'My_Flow');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [nonExistentPath, metadataPath], metaSuffix: 'flow', strictDirectoryName: false },
    ];

    await expect(updateForceignoreFile(processedMeta, repoRoot)).resolves.not.toThrow();
    const content = await readForceignore();
    expect(content).toContain('force-app/main/default/flows/My_Flow');
  });

  it('handles multiple metadata types in a single call', async () => {
    const flowPath = join(repoRoot, 'force-app', 'main', 'default', 'flows');
    const permPath = join(repoRoot, 'force-app', 'main', 'default', 'permissionsets');
    await makeComponentDir(flowPath, 'My_Flow');
    await makeComponentDir(permPath, 'HR_Admin');

    const processedMeta: ProcessedMeta[] = [
      { metadataPaths: [flowPath], metaSuffix: 'flow', strictDirectoryName: false },
      { metadataPaths: [permPath], metaSuffix: 'permissionset', strictDirectoryName: false },
    ];
    await updateForceignoreFile(processedMeta, repoRoot);

    const content = await readForceignore();
    // Each entry must be its own line (not concatenated together)
    const lines = content.split('\n').filter(Boolean);
    expect(lines).toContain('force-app/main/default/flows/My_Flow');
    expect(lines).toContain('force-app/main/default/permissionsets/HR_Admin');
  });
});
