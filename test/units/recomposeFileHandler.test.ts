import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

// ---- Mocks ---------------------------------------------------------------
//
// As with the decompose dispatcher test, we mock the downstream Rust-backed
// reassembler so we can assert *which* arguments the dispatcher hands it.
// `reassembleLabels` and `renameBotVersionFile` are likewise mocked so we can
// assert call shape without needing real fixtures or directory walks.

const { reassembleSpy, reassembleLabelsSpy, renameBotVersionFileSpy } = vi.hoisted(() => ({
  reassembleSpy: vi.fn(),
  reassembleLabelsSpy: vi.fn(async () => undefined),
  renameBotVersionFileSpy: vi.fn(async () => undefined),
}));

vi.mock('config-disassembler', () => ({
  ReassembleXMLFileHandler: class {
    public reassemble = reassembleSpy;
  },
}));

vi.mock('../../src/service/recompose/reassembleLabels.js', () => ({
  reassembleLabels: reassembleLabelsSpy,
}));

vi.mock('../../src/service/recompose/renameBotVersionFiles.js', () => ({
  renameBotVersionFile: renameBotVersionFileSpy,
}));

const { recomposeFileHandler } = await import('../../src/service/recompose/recomposeFileHandler.js');

// ---- Test helpers --------------------------------------------------------

const TMP_ROOT = join('test', 'tmp', 'recompose-handler');

function makeAttrs(
  over: Partial<{
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
  }> = {},
): {
  metaSuffix: string;
  strictDirectoryName: boolean;
  folderType: string;
  metadataPaths: string[];
} {
  return {
    metaSuffix: 'object',
    strictDirectoryName: false,
    folderType: '',
    metadataPaths: [],
    ...over,
  };
}

function lastCall(spy: Mock): unknown[] {
  return spy.mock.calls[spy.mock.calls.length - 1] as unknown[];
}

describe('recomposeFileHandler', () => {
  beforeEach(async () => {
    reassembleSpy.mockReset();
    reassembleLabelsSpy.mockClear();
    renameBotVersionFileSpy.mockClear();
    await mkdir(TMP_ROOT, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_ROOT, { recursive: true, force: true });
  });

  // -- manifest-vs-standard gate -------------------------------------------

  describe('manifest entry guard', () => {
    it('routes through the standard path when manifestXmlPaths is undefined', async () => {
      const pkgDir = join(TMP_ROOT, 'objects-standard');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir] }), false, undefined);

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
      const [args] = lastCall(reassembleSpy) as [{ filePath: string }];
      expect(args.filePath).toBe(join(pkgDir, 'Account'));
    });

    it('routes through the standard path when manifestXmlPaths is an empty Set', async () => {
      const pkgDir = join(TMP_ROOT, 'objects-empty');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir] }), false, new Set());

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
    });

    it('routes through the manifest path when manifestXmlPaths has at least one entry', async () => {
      const decomposedDir = join(TMP_ROOT, 'objects-manifest', 'Account');
      await mkdir(decomposedDir, { recursive: true });

      await recomposeFileHandler(
        makeAttrs({ metadataPaths: ['SHOULD_BE_IGNORED'] }),
        false,
        new Set([join(TMP_ROOT, 'objects-manifest', 'Account.object-meta.xml')]),
      );

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
      const [args] = lastCall(reassembleSpy) as [{ filePath: string }];
      expect(args.filePath).toBe(decomposedDir);
    });
  });

  // -- non-manifest dispatch -----------------------------------------------

  describe('non-manifest dispatch', () => {
    it('delegates to reassembleLabels when metaSuffix is labels', async () => {
      const pkgDir = join(TMP_ROOT, 'labels-dir');
      await mkdir(pkgDir, { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'labels' }), true);

      expect(reassembleLabelsSpy).toHaveBeenCalledTimes(1);
      expect(reassembleLabelsSpy).toHaveBeenCalledWith(pkgDir, 'labels', true);
      expect(reassembleSpy).not.toHaveBeenCalled();
    });

    it('calls renameBotVersionFile after reassembling when metaSuffix is bot', async () => {
      const pkgDir = join(TMP_ROOT, 'bot-non-manifest');
      await mkdir(join(pkgDir, 'BotA'), { recursive: true });

      await recomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'bot', strictDirectoryName: true }),
        false,
      );

      expect(renameBotVersionFileSpy).toHaveBeenCalledTimes(1);
      expect(renameBotVersionFileSpy).toHaveBeenCalledWith(pkgDir);
    });

    it('does NOT call renameBotVersionFile when metaSuffix is not bot', async () => {
      const pkgDir = join(TMP_ROOT, 'object-non-manifest');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }), false);

      expect(renameBotVersionFileSpy).not.toHaveBeenCalled();
    });

    it('recurses one level when strictDirectoryName=true so each Bot subdir is reassembled', async () => {
      const pkgDir = join(TMP_ROOT, 'strict-bots');
      await mkdir(join(pkgDir, 'BotA', 'v1'), { recursive: true });
      await mkdir(join(pkgDir, 'BotA', 'v2'), { recursive: true });
      await mkdir(join(pkgDir, 'BotB', 'v1'), { recursive: true });

      await recomposeFileHandler(
        makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'bot', strictDirectoryName: true }),
        false,
      );

      // 2 (BotA's v1+v2) + 1 (BotB's v1) = 3 reassemble calls at the leaf level.
      expect(reassembleSpy).toHaveBeenCalledTimes(3);
    });

    it('recurses when folderType is set even if strictDirectoryName=false', async () => {
      const pkgDir = join(TMP_ROOT, 'folder-recurse');
      await mkdir(join(pkgDir, 'FolderA', 'sub'), { recursive: true });

      await recomposeFileHandler(
        makeAttrs({
          metadataPaths: [pkgDir],
          metaSuffix: 'report',
          strictDirectoryName: false,
          folderType: 'ReportFolder',
        }),
        false,
      );

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
      const [args] = lastCall(reassembleSpy) as [{ filePath: string }];
      expect(args.filePath).toBe(join(pkgDir, 'FolderA', 'sub'));
    });

    it('does not recurse when neither strictDirectoryName nor folderType is set', async () => {
      const pkgDir = join(TMP_ROOT, 'flat');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });
      // A nested directory; without recursion we should NOT reassemble it.
      await mkdir(join(pkgDir, 'Account', 'nested'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }), false);

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
      const [args] = lastCall(reassembleSpy) as [{ filePath: string }];
      // Only the top-level subdir is reassembled.
      expect(args.filePath).toBe(join(pkgDir, 'Account'));
    });

    it('skips non-directories under the package path', async () => {
      const pkgDir = join(TMP_ROOT, 'mixed');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });
      await writeFile(join(pkgDir, 'README.txt'), 'not a directory');

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }), false);

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
    });

    it('passes the postpurge flag through to the reassembler', async () => {
      const pkgDir = join(TMP_ROOT, 'postpurge');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'object' }), true);

      const [args] = lastCall(reassembleSpy) as [{ postPurge: boolean }];
      expect(args.postPurge).toBe(true);
    });

    it('builds the file extension as `${metaSuffix}-meta.xml`', async () => {
      const pkgDir = join(TMP_ROOT, 'ext');
      await mkdir(join(pkgDir, 'Account'), { recursive: true });

      await recomposeFileHandler(makeAttrs({ metadataPaths: [pkgDir], metaSuffix: 'profile' }), false);

      const [args] = lastCall(reassembleSpy) as [{ fileExtension: string }];
      expect(args.fileExtension).toBe('profile-meta.xml');
    });
  });

  // -- manifest dispatch ---------------------------------------------------

  describe('manifest dispatch', () => {
    it('dedupes by parent directory for labels and forwards postpurge', async () => {
      const xmls = new Set([
        'force-app/labels/CustomLabels.labels-meta.xml',
        'force-app/labels/CustomLabels.labels-meta.xml',
        'other-pkg/labels/CustomLabels.labels-meta.xml',
      ]);

      await recomposeFileHandler(makeAttrs({ metaSuffix: 'labels' }), true, xmls);

      expect(reassembleLabelsSpy).toHaveBeenCalledTimes(2);
      const dirs = (reassembleLabelsSpy.mock.calls as unknown[][]).map((c) => c[0] as string).sort();
      expect(dirs).toEqual(['force-app/labels', 'other-pkg/labels']);
      // Postpurge propagates.
      for (const call of reassembleLabelsSpy.mock.calls as unknown[][]) {
        expect(call[2]).toBe(true);
      }
    });

    it('dedupes parent dirs for strict-directory types and reassembles each parent without recursion', async () => {
      const parentA = join(TMP_ROOT, 'manifest-bots', 'BotA');
      const parentB = join(TMP_ROOT, 'manifest-bots', 'BotB');
      await mkdir(join(parentA, 'v1'), { recursive: true });
      await mkdir(join(parentB, 'v1'), { recursive: true });

      const xmls = new Set([
        join(parentA, 'BotA.bot-meta.xml'),
        join(parentA, 'BotA.bot-meta.xml'),
        join(parentB, 'BotB.bot-meta.xml'),
      ]);

      await recomposeFileHandler(makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true }), false, xmls);

      // Each parent dir contains one decomposed subdir (v1) -> 2 reassemble calls.
      expect(reassembleSpy).toHaveBeenCalledTimes(2);
    });

    it('runs renameBotVersionFile per unique bot *container* directory (one level above the bot dir) for manifest dispatch', async () => {
      // The dispatcher walks one level above the bot's own directory because
      // renameBotVersionFile expects e.g. `.../bots`, not `.../bots/BotA`.
      // BotA/BotB both live under `force-app/bots`, so they collapse to one
      // call; BotC lives under `other-pkg/bots` and contributes a second.
      const botA = join(TMP_ROOT, 'force-app', 'bots', 'BotA');
      const botB = join(TMP_ROOT, 'force-app', 'bots', 'BotB');
      const botC = join(TMP_ROOT, 'other-pkg', 'bots', 'BotC');
      await mkdir(botA, { recursive: true });
      await mkdir(botB, { recursive: true });
      await mkdir(botC, { recursive: true });

      const xmls = new Set([
        join(botA, 'BotA.bot-meta.xml'),
        join(botB, 'BotB.bot-meta.xml'),
        join(botC, 'BotC.bot-meta.xml'),
      ]);

      await recomposeFileHandler(makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true }), false, xmls);

      expect(renameBotVersionFileSpy).toHaveBeenCalledTimes(2);
      const containerDirs = (renameBotVersionFileSpy.mock.calls as unknown[][]).map((c) => c[0] as string).sort();
      expect(containerDirs).toEqual([join(TMP_ROOT, 'force-app', 'bots'), join(TMP_ROOT, 'other-pkg', 'bots')]);
    });

    it('skips manifest xml paths whose decomposed directory does not exist', async () => {
      const existing = join(TMP_ROOT, 'manifest-skip', 'Real');
      await mkdir(existing, { recursive: true });

      const xmls = new Set([
        join(TMP_ROOT, 'manifest-skip', 'Real.object-meta.xml'),
        join(TMP_ROOT, 'manifest-skip', 'Missing.object-meta.xml'),
      ]);

      await recomposeFileHandler(makeAttrs({ metaSuffix: 'object' }), false, xmls);

      expect(reassembleSpy).toHaveBeenCalledTimes(1);
      const [args] = lastCall(reassembleSpy) as [{ filePath: string }];
      expect(args.filePath).toBe(existing);
    });

    it('computes the decomposed directory by stripping the meta-meta.xml suffix from the xml basename', async () => {
      const decomposed = join(TMP_ROOT, 'strip-suffix', 'Custom_Profile');
      await mkdir(decomposed, { recursive: true });

      const xmls = new Set([join(TMP_ROOT, 'strip-suffix', 'Custom_Profile.profile-meta.xml')]);

      await recomposeFileHandler(makeAttrs({ metaSuffix: 'profile' }), false, xmls);

      const [args] = lastCall(reassembleSpy) as [{ filePath: string; fileExtension: string }];
      expect(args.filePath).toBe(decomposed);
      expect(args.fileExtension).toBe('profile-meta.xml');
    });

    it('takes the non-strict path when strictDirectoryName=false and folderType is empty', async () => {
      // The strict path (ConditionalExpression → true mutation) would call reassembleDirectories
      // on the parent dir and pick up any subdirectory, including Unrelated. The non-strict path
      // only reassembles the directory derived from the xml basename, and skips it when missing.
      const parentDir = join(TMP_ROOT, 'manifest-nonstruct');
      await mkdir(join(parentDir, 'Unrelated'), { recursive: true });
      // join(parentDir, 'Foo') intentionally does NOT exist

      const xmls = new Set([join(parentDir, 'Foo.object-meta.xml')]);
      await recomposeFileHandler(makeAttrs({ metaSuffix: 'object' }), false, xmls);

      expect(reassembleSpy).not.toHaveBeenCalled();
    });

    it('does NOT call renameBotVersionFile for non-bot strict-directory types in manifest dispatch', async () => {
      const parentDir = join(TMP_ROOT, 'manifest-strict-non-bot', 'ProfileA');
      await mkdir(join(parentDir, 'v1'), { recursive: true });

      const xmls = new Set([join(parentDir, 'ProfileA.profile-meta.xml')]);
      await recomposeFileHandler(makeAttrs({ metaSuffix: 'profile', strictDirectoryName: true }), false, xmls);

      expect(renameBotVersionFileSpy).not.toHaveBeenCalled();
    });
  });
});
