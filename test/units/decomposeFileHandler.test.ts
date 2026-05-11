import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

import { ResolvedDecomposeTypeOptions } from '../../src/helpers/configOverrides.js';
import { DecomposerOverride } from '../../src/helpers/types.js';

// ---- Mocks ---------------------------------------------------------------
//
// We mock the downstream Rust-backed disassembler so we can assert *which*
// arguments the dispatcher hands it. The dispatcher is pure routing logic;
// what it does or does not call is the only thing worth testing.
//
// `vi.hoisted` is required because `vi.mock` factories run *before* the
// surrounding `import`s, so the spies they reference must be hoisted too.

const { disassembleSpy, prePurgeLabelsSpy, moveAndRenameLabelsSpy, renameWorkflowsSpy } = vi.hoisted(() => ({
  disassembleSpy: vi.fn(),
  prePurgeLabelsSpy: vi.fn(async () => undefined),
  moveAndRenameLabelsSpy: vi.fn(async () => undefined),
  renameWorkflowsSpy: vi.fn(async () => undefined),
}));

vi.mock('config-disassembler', () => ({
  DisassembleXMLFileHandler: class {
    public disassemble = disassembleSpy;
  },
}));

// Mock the small post-processing helpers so we can assert call counts and args
// without needing real CustomLabels.labels-meta.xml or workflow XML files.
vi.mock('../../src/service/decompose/customLabels.js', () => ({
  prePurgeLabels: prePurgeLabelsSpy,
  moveAndRenameLabels: moveAndRenameLabelsSpy,
}));

vi.mock('../../src/service/decompose/renameWorkflows.js', () => ({
  renameWorkflows: renameWorkflowsSpy,
}));

// Imported after the mocks above so they apply to the system under test.
const { decomposeFileHandler } = await import('../../src/service/decompose/decomposeFileHandler.js');

// ---- Test helpers --------------------------------------------------------

const TMP_ROOT = join('test', 'tmp', 'decompose-handler');

function makeTypeOptions(over: Partial<ResolvedDecomposeTypeOptions> = {}): ResolvedDecomposeTypeOptions {
  return {
    format: 'xml',
    strategy: 'unique-id',
    decomposeNestedPerms: false,
    prepurge: false,
    postpurge: false,
    ...over,
  };
}

function makeAttrs(
  over: Partial<{
    metadataPaths: string[];
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    uniqueIdElements: string;
  }> = {},
): {
  metadataPaths: string[];
  metaSuffix: string;
  strictDirectoryName: boolean;
  folderType: string;
  uniqueIdElements: string;
} {
  return {
    metadataPaths: [],
    metaSuffix: 'object',
    strictDirectoryName: false,
    folderType: '',
    uniqueIdElements: '',
    ...over,
  };
}

function lastCall(spy: Mock): Record<string, unknown> {
  return spy.mock.calls[spy.mock.calls.length - 1][0] as Record<string, unknown>;
}

describe('decomposeFileHandler', () => {
  beforeEach(async () => {
    disassembleSpy.mockReset();
    prePurgeLabelsSpy.mockClear();
    moveAndRenameLabelsSpy.mockClear();
    renameWorkflowsSpy.mockClear();
    await mkdir(TMP_ROOT, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_ROOT, { recursive: true, force: true });
  });

  // -- manifest-vs-standard gate (kills `manifestXmlPaths.size > 0` mutants) --

  describe('manifest entry guard', () => {
    it('routes through the standard path when manifestXmlPaths is undefined', async () => {
      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [], metaSuffix: 'object' }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        undefined,
      );
      // No metadataPaths, no manifest -> dispatcher does nothing.
      expect(disassembleSpy).not.toHaveBeenCalled();
    });

    it('routes through the standard path when manifestXmlPaths is an empty Set', async () => {
      await decomposeFileHandler(
        makeAttrs({ metadataPaths: ['force-app/main/default/objects'] }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        new Set<string>(),
      );
      // Standard path runs disassemble against metadataPaths[0].
      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).filePath).toBe('force-app/main/default/objects');
    });

    it('routes through the manifest path when manifestXmlPaths has at least one entry', async () => {
      await decomposeFileHandler(
        makeAttrs({ metadataPaths: ['SHOULD_BE_IGNORED'] }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        new Set(['force-app/main/default/objects/Account.object-meta.xml']),
      );
      // Manifest path runs disassemble against the manifest xmlPath, not metadataPaths.
      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).filePath).toBe('force-app/main/default/objects/Account.object-meta.xml');
    });
  });

  // -- non-manifest dispatch -----------------------------------------------

  describe('non-manifest dispatch', () => {
    it('runs labels through prePurgeLabels + disassemble + moveAndRenameLabels when prepurge=true', async () => {
      const pkgDir = join(TMP_ROOT, 'force-app', 'main', 'default', 'labels');
      await mkdir(pkgDir, { recursive: true });
      await writeFile(join(pkgDir, 'CustomLabels.labels-meta.xml'), '<x/>');

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'labels' }),
        makeTypeOptions({ prepurge: true }),
        '.gitignore',
      );

      expect(prePurgeLabelsSpy).toHaveBeenCalledTimes(1);
      expect(prePurgeLabelsSpy).toHaveBeenCalledWith(pkgDir);
      expect(moveAndRenameLabelsSpy).toHaveBeenCalledTimes(1);
      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      // The handler must override prepurge to false for labels so the
      // disassembler does not delete the directory we're about to move
      // files out of.
      expect(lastCall(disassembleSpy).prePurge).toBe(false);
    });

    it('skips prePurgeLabels for labels when prepurge=false but still calls disassemble + moveAndRenameLabels', async () => {
      const pkgDir = join(TMP_ROOT, 'labels-no-purge');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'labels' }),
        makeTypeOptions({ prepurge: false }),
        '.gitignore',
      );

      expect(prePurgeLabelsSpy).not.toHaveBeenCalled();
      expect(moveAndRenameLabelsSpy).toHaveBeenCalledTimes(1);
      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).prePurge).toBe(false);
    });

    it('calls renameWorkflows after disassembly when metaSuffix is workflow', async () => {
      const pkgDir = join(TMP_ROOT, 'workflows');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'workflow' }),
        makeTypeOptions(),
        '.gitignore',
      );

      expect(renameWorkflowsSpy).toHaveBeenCalledTimes(1);
      expect(renameWorkflowsSpy).toHaveBeenCalledWith(pkgDir);
    });

    it('does not call renameWorkflows when metaSuffix is not workflow', async () => {
      const pkgDir = join(TMP_ROOT, 'objects');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }),
        makeTypeOptions(),
        '.gitignore',
      );

      expect(renameWorkflowsSpy).not.toHaveBeenCalled();
    });

    it('walks subdirectories and disassembles each when strictDirectoryName=true', async () => {
      const pkgDir = join(TMP_ROOT, 'bots');
      await mkdir(join(pkgDir, 'BotA'), { recursive: true });
      await mkdir(join(pkgDir, 'BotB'), { recursive: true });
      await writeFile(join(pkgDir, 'README.txt'), 'not a dir');

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'bot', strictDirectoryName: true }),
        makeTypeOptions(),
        '.gitignore',
      );

      // Two subdirectories -> two disassemble calls; the regular file is filtered out.
      expect(disassembleSpy).toHaveBeenCalledTimes(2);
      const calledPaths = disassembleSpy.mock.calls.map((c) => (c[0] as { filePath: string }).filePath).sort();
      expect(calledPaths).toEqual([join(pkgDir, 'BotA'), join(pkgDir, 'BotB')]);
    });

    it('walks subdirectories when folderType is non-empty even if strictDirectoryName=false', async () => {
      const pkgDir = join(TMP_ROOT, 'reports');
      await mkdir(join(pkgDir, 'FolderA'), { recursive: true });

      await decomposeFileHandler(
        makeAttrs({
          metadataPaths: [pkgDir],
          metaSuffix: 'report',
          strictDirectoryName: false,
          folderType: 'ReportFolder',
        }),
        makeTypeOptions(),
        '.gitignore',
      );

      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).filePath).toBe(join(pkgDir, 'FolderA'));
    });
  });

  // -- splitTags / decomposeNestedPerms resolution -------------------------

  describe('splitTags resolution under grouped-by-tag', () => {
    it('injects the permission-set default when decomposeNestedPerms=true and metaSuffix=permissionset', async () => {
      const pkgDir = join(TMP_ROOT, 'ps');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'permissionset' }),
        makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: true }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBe('objectPermissions:split:object,fieldPermissions:group:field');
    });

    it('injects the same default for mutingpermissionset', async () => {
      const pkgDir = join(TMP_ROOT, 'mps');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'mutingpermissionset' }),
        makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: true }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBe('objectPermissions:split:object,fieldPermissions:group:field');
    });

    it('does NOT inject the default for a non-permissionset suffix', async () => {
      const pkgDir = join(TMP_ROOT, 'profiles');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'profile' }),
        makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: true }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBeUndefined();
    });

    it('does NOT inject the default when decomposeNestedPerms=false', async () => {
      const pkgDir = join(TMP_ROOT, 'ps-no-nest');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'permissionset' }),
        makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: false }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBeUndefined();
    });

    it('does NOT pass splitTags when strategy is unique-id, even with decomposeNestedPerms=true', async () => {
      const pkgDir = join(TMP_ROOT, 'ps-uid');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'permissionset' }),
        makeTypeOptions({ strategy: 'unique-id', decomposeNestedPerms: true }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBeUndefined();
    });

    it('prefers an explicit splitTags option over the permission-set default', async () => {
      const pkgDir = join(TMP_ROOT, 'ps-explicit');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'permissionset' }),
        makeTypeOptions({
          strategy: 'grouped-by-tag',
          decomposeNestedPerms: true,
          splitTags: 'objectPermissions:group:object',
        }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).splitTags).toBe('objectPermissions:group:object');
    });
  });

  // -- hard strategy rules -------------------------------------------------

  describe('hard strategy rules', () => {
    it('forces labels to unique-id even when grouped-by-tag is requested', async () => {
      const pkgDir = join(TMP_ROOT, 'labels-hard');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'labels' }),
        makeTypeOptions({ strategy: 'grouped-by-tag' }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).strategy).toBe('unique-id');
    });

    it('forces loyaltyProgramSetup to unique-id even when grouped-by-tag is requested', async () => {
      const pkgDir = join(TMP_ROOT, 'lps');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'loyaltyProgramSetup' }),
        makeTypeOptions({ strategy: 'grouped-by-tag' }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).strategy).toBe('unique-id');
    });

    it('leaves a non-special metadata type on grouped-by-tag', async () => {
      const pkgDir = join(TMP_ROOT, 'plain-gbt');
      await mkdir(pkgDir, { recursive: true });

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'profile' }),
        makeTypeOptions({ strategy: 'grouped-by-tag' }),
        '.gitignore',
      );

      expect(lastCall(disassembleSpy).strategy).toBe('grouped-by-tag');
    });
  });

  // -- per-file (component overrides) --------------------------------------

  describe('per-file handler', () => {
    it('only processes files with the matching meta-meta.xml suffix and skips subdirectories', async () => {
      const pkgDir = join(TMP_ROOT, 'objects-with-overrides');
      await mkdir(pkgDir, { recursive: true });
      await writeFile(join(pkgDir, 'Account.object-meta.xml'), '<x/>');
      await writeFile(join(pkgDir, 'Account.txt'), 'not-meta');
      await mkdir(join(pkgDir, 'Lookalike-meta.xml'), { recursive: true });

      const overrides: DecomposerOverride[] = [{ components: ['object:Account'], strategy: 'grouped-by-tag' }];

      await decomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }),
        makeTypeOptions(),
        '.gitignore',
        overrides,
      );

      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).filePath).toBe(join(pkgDir, 'Account.object-meta.xml'));
    });
  });

  // -- manifest dispatch ---------------------------------------------------

  describe('manifest dispatch', () => {
    it('dedupes by parent directory for labels and overrides prePurge to false on the disassemble call', async () => {
      const labelXmls = new Set([
        'force-app/labels/CustomLabels.labels-meta.xml',
        'force-app/labels/CustomLabels.labels-meta.xml',
        'other-pkg/labels/CustomLabels.labels-meta.xml',
      ]);

      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'labels' }),
        makeTypeOptions({ prepurge: true }),
        '.gitignore',
        undefined,
        labelXmls,
      );

      expect(prePurgeLabelsSpy).toHaveBeenCalledTimes(2);
      expect(moveAndRenameLabelsSpy).toHaveBeenCalledTimes(2);
      expect(disassembleSpy).toHaveBeenCalledTimes(2);
      // Even though the user passed prepurge=true, labels override it to false.
      for (const call of disassembleSpy.mock.calls) {
        expect((call[0] as { prePurge: boolean }).prePurge).toBe(false);
      }
    });

    it('dedupes by parent directory for strict-directory types and uses the parent basename as the fullName', async () => {
      const xmlPaths = new Set([
        'force-app/bots/BotA/BotA.bot-meta.xml',
        'force-app/bots/BotA/BotA.bot-meta.xml',
        'force-app/bots/BotB/BotB.bot-meta.xml',
      ]);

      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        xmlPaths,
      );

      expect(disassembleSpy).toHaveBeenCalledTimes(2);
      const calledPaths = disassembleSpy.mock.calls.map((c) => (c[0] as { filePath: string }).filePath).sort();
      expect(calledPaths).toEqual(['force-app/bots/BotA', 'force-app/bots/BotB']);
    });

    it('takes the strict-directory branch when folderType is set even if strictDirectoryName is false', async () => {
      const xmlPaths = new Set([
        'force-app/reports/FolderA/Report1.report-meta.xml',
        'force-app/reports/FolderA/Report2.report-meta.xml',
      ]);

      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'report', strictDirectoryName: false, folderType: 'ReportFolder' }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        xmlPaths,
      );

      // The strict-directory branch dedupes by `dirname(xml)`, so two
      // xml paths in the same folder collapse to one disassemble call.
      expect(disassembleSpy).toHaveBeenCalledTimes(1);
      expect(lastCall(disassembleSpy).filePath).toBe('force-app/reports/FolderA');
    });

    it('runs renameWorkflows once per unique parent dir when metaSuffix is workflow', async () => {
      const xmlPaths = new Set([
        'force-app/workflows/Account.workflow-meta.xml',
        'force-app/workflows/Opportunity.workflow-meta.xml',
        'other-pkg/workflows/Custom.workflow-meta.xml',
      ]);

      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'workflow' }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        xmlPaths,
      );

      expect(renameWorkflowsSpy).toHaveBeenCalledTimes(2);
      const calledDirs = renameWorkflowsSpy.mock.calls.map((c) => c[0] as string).sort();
      expect(calledDirs).toEqual(['force-app/workflows', 'other-pkg/workflows']);
    });

    it('does NOT run renameWorkflows for non-workflow suffixes', async () => {
      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'object' }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        new Set(['force-app/objects/Account.object-meta.xml']),
      );
      expect(renameWorkflowsSpy).not.toHaveBeenCalled();
    });

    it('disassembles once per xml path when neither strictDirectoryName nor folderType is set', async () => {
      const xmlPaths = new Set([
        'force-app/objects/Account.object-meta.xml',
        'force-app/objects/Opportunity.object-meta.xml',
      ]);

      await decomposeFileHandler(
        makeAttrs({ metaSuffix: 'object' }),
        makeTypeOptions(),
        '.gitignore',
        undefined,
        xmlPaths,
      );

      expect(disassembleSpy).toHaveBeenCalledTimes(2);
      const calledPaths = disassembleSpy.mock.calls.map((c) => (c[0] as { filePath: string }).filePath).sort();
      expect(calledPaths).toEqual([
        'force-app/objects/Account.object-meta.xml',
        'force-app/objects/Opportunity.object-meta.xml',
      ]);
    });
  });
});
