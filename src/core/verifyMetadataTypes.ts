'use strict';

import { mkdtemp, rm, readFile, writeFile, cp, stat, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { diffDirectories } from '../service/verify/diffDirectories.js';
import { SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { SfdxProject, VerifyDrift, VerifyOptions, VerifyResult } from '../helpers/types.js';
import { decomposeMetadataTypes } from './decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from './recomposeMetadataTypes.js';

/**
 * Run a non-destructive round-trip check: copy the user's package directories into a scratch
 * directory under the OS temp folder, decompose + recompose them there, and diff the rebuilt
 * parents against the originals.
 *
 * The temp directory is always removed before this function returns, and the user's working tree
 * is never modified. The returned `drift` array is empty when every parent XML survived the round
 * trip byte-identically; otherwise each entry names the offending file (relative to its package
 * directory) and a short reason.
 */
export async function verifyMetadataTypes(options: VerifyOptions): Promise<VerifyResult> {
  const { metadataTypes, format, ignoreDirs, strategy, decomposeNestedPerms, manifest, overrides, log } = options;

  const { repoRoot, dxConfigFilePath } = (await getRepoRoot()) as {
    repoRoot: string;
    dxConfigFilePath: string;
  };

  const sfdxProjectRaw = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const packageDirRelPaths = sfdxProject.packageDirectories.map((p) => p.path);

  const tempProjectDir = await mkdtemp(join(tmpdir(), 'sf-decomposer-verify-'));
  const originalCwd = process.cwd();

  try {
    await Promise.all(
      packageDirRelPaths.map(async (rel) => {
        const src = resolve(repoRoot, rel);
        const dst = resolve(tempProjectDir, rel);
        // Stryker disable all
        /* istanbul ignore next -- @preserve: declared package dirs typically exist; defensive only */
        if (!(await pathExists(src))) {
          /* istanbul ignore next -- @preserve: declared package dirs typically exist; defensive only */
          return;
        }
        // Stryker restore all
        await cp(src, dst, { recursive: true });
      }),
    );

    await writeFile(join(tempProjectDir, SFDX_PROJECT_FILE_NAME), sfdxProjectRaw);

    // Manifests are validated by oclif's `Flags.file({ exists: true })`, so when one is supplied
    // it always points to a real file under the user's repo. Mirror it into the temp project at
    // the same relative path so parseManifest finds it via the tempProjectDir repoRoot.
    let tempManifest: string | undefined;
    if (manifest) {
      const absManifest = resolve(originalCwd, manifest);
      const relManifest = relative(repoRoot, absManifest);
      const tempManifestAbs = resolve(tempProjectDir, relManifest);
      await mkdir(dirname(tempManifestAbs), { recursive: true });
      await cp(absManifest, tempManifestAbs);
      tempManifest = tempManifestAbs;
    }

    // Strip any user-supplied prePurge/postPurge from the overrides for verify only. Verify needs
    // the parent XML to survive the decompose phase so that manifest-driven recompose can
    // re-resolve it (parseManifest only returns parent XML paths that exist on disk). Letting the
    // user's overrides drive post-purge here would silently break manifest filtering.
    const verifyOverrides = overrides?.map((override) => {
      const { prePurge, postPurge, ...rest } = override;
      // Reference the stripped fields so the linter understands they are intentionally discarded.
      void prePurge;
      void postPurge;
      return rest;
    });

    const decomposed = await decomposeMetadataTypes({
      metadataTypes,
      // Wipe any pre-existing decomposed children so we always start from a clean fixture, but
      // keep the parent XML intact for the recompose phase (see comment above).
      prepurge: true,
      postpurge: false,
      format,
      ignoreDirs,
      strategy,
      decomposeNestedPerms,
      manifest: tempManifest,
      overrides: verifyOverrides,
      log,
      repoRoot: tempProjectDir,
    });

    if (decomposed.metadata.length > 0) {
      await recomposeMetadataTypes({
        metadataTypes: decomposed.metadata,
        // Postpurge here removes the decomposed children we generated above, leaving the rebuilt
        // parent XML as the only artifact to diff against the original.
        postpurge: true,
        ignoreDirs,
        manifest: tempManifest,
        log,
        repoRoot: tempProjectDir,
      });
    }

    const drift: VerifyDrift[] = [];
    const reordered: string[] = [];
    const diffTasks = packageDirRelPaths.map(async (rel) => {
      const original = resolve(repoRoot, rel);
      const reconstructed = resolve(tempProjectDir, rel);
      // Stryker disable all
      /* istanbul ignore if -- @preserve: we just `cp`'d into this directory, so it always exists */
      if (!(await pathExists(reconstructed))) {
        return { drift: [] as VerifyDrift[], reordered: [] as string[] };
      }
      // Stryker restore all
      return diffDirectories(original, reconstructed);
    });
    for (const result of await Promise.all(diffTasks)) {
      drift.push(...result.drift);
      reordered.push(...result.reordered);
    }

    if (drift.length === 0) {
      log(`Round-trip verified for ${decomposed.metadata.length} metadata type(s); no drift detected.`);
    } else {
      log(`Round-trip drift detected in ${drift.length} file(s):`);
      for (const entry of drift) {
        log(`  - ${entry.path}: ${entry.reason}`);
      }
    }

    if (reordered.length > 0) {
      // Informational only — semantic content matches, just sibling/attribute order changed.
      // Salesforce treats metadata as order-agnostic, so this is safe to commit.
      log(`Note: ${reordered.length} file(s) round-tripped semantically but with sibling/attribute reordering:`);
      for (const path of reordered) {
        log(`  - ${path}`);
      }
    }

    return { metadata: decomposed.metadata, drift, reordered };
  } finally {
    await rm(tempProjectDir, { recursive: true, force: true }); // Stryker disable-line BooleanLiteral
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    // Stryker disable-line BlockStatement
    /* istanbul ignore next -- @preserve: package directories declared in sfdx-project.json always
       exist on disk in the supported flow; this catch is defensive for partially-broken projects. */
    return false;
  }
}
