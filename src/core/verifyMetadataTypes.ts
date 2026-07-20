'use strict';

import { readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { verifyXmlRoundtrip } from 'config-disassembler';

import {
  ResolvedDecomposeTypeOptions,
  resolveDecomposeOptionsForComponent,
  resolveDecomposeOptionsForType,
} from '../helpers/configOverrides.js';
import { CONCURRENCY_LIMITS, SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { SfdxProject, VerifyDrift, VerifyOptions, VerifyResult } from '../helpers/types.js';
import { buildPackageDirectoryIndex } from '../metadata/getPackageDirectories.js';
import { getRegistryValuesBySuffix, resolveMetadataTypeEntry } from '../metadata/getRegistryValuesBySuffix.js';
import { listParentXmlFilesForType } from '../metadata/listParentXmlFiles.js';
import { resolveEffectiveMetadataTypes } from '../metadata/parseManifest.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { resolveEffectiveDisassembleOptions } from '../service/decompose/resolveEffectiveDisassembleOptions.js';

type TypeVerifyResult = {
  metadataType: string;
  processed: boolean;
  drift: VerifyDrift[];
  reordered: string[];
};

/**
 * Run a non-destructive round-trip check directly against the user's repo. For every parent
 * metadata XML file belonging to the requested (or manifest-filtered) metadata types, disassemble
 * + reassemble it inside an isolated temp directory (via `verifyXmlRoundtrip`, which never touches
 * the real file) and compare the reconstructed XML against the original.
 *
 * Unlike a real decompose/recompose run, this never writes to the user's working tree at all --
 * `verifyXmlRoundtrip` owns its own temp-directory isolation per file, so there is no scratch
 * project to build or clean up here.
 *
 * The returned `drift` array is empty when every parent XML would survive the round trip
 * semantically; otherwise each entry names the offending file (relative to its package directory)
 * and a short reason. `reordered` is informational only -- sibling/attribute order is not
 * preserved by design, and Salesforce treats metadata as order-agnostic.
 */
export async function verifyMetadataTypes(options: VerifyOptions): Promise<VerifyResult> {
  const { metadataTypes, format, ignoreDirs, strategy, decomposeNestedPerms, manifest, overrides, log } = options;

  const { manifestFilter, effectiveTypes } = await resolveEffectiveMetadataTypes(
    metadataTypes,
    manifest,
    ignoreDirs,
    undefined,
    log,
  );

  if (effectiveTypes.length === 0) {
    log('No metadata types to verify after applying the manifest filter.');
    return { metadata: [], drift: [], reordered: [] };
  }

  const { repoRoot } = (await getRepoRoot()) as { repoRoot: string };
  // Stryker disable next-line StringLiteral: JSON.parse(Buffer) defaults to UTF-8 decoding
  const sfdxProjectRaw = await readFile(join(repoRoot, SFDX_PROJECT_FILE_NAME), 'utf-8');
  const sfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const packageDirs = sfdxProject.packageDirectories.map((p) => resolve(repoRoot, p.path));

  const baseOptions: ResolvedDecomposeTypeOptions = {
    format,
    strategy,
    decomposeNestedPerms,
    prepurge: false,
    postpurge: false,
  };

  // In manifest mode, parseManifest already built a directory index covering every type it
  // found -- reuse it rather than walking the same tree a second time. Otherwise, resolve every
  // requested type's directoryName up front so the filesystem walk below covers all of them in
  // one pass, instead of each type re-walking the whole package directory tree. Unsupported/
  // unknown suffixes are skipped here; the per-type getRegistryValuesBySuffix call below still
  // throws (and, in manifest mode, is caught/logged there) exactly as it does today.
  let pathIndex: { index: Map<string, string[]>; ignorePath: string };
  if (manifestFilter) {
    pathIndex = manifestFilter.directoryIndex;
  } else {
    const directoryNames = new Set<string>();
    for (const metadataType of effectiveTypes) {
      try {
        directoryNames.add(`${resolveMetadataTypeEntry(metadataType).directoryName}`);
      } catch {
        /* istanbul ignore next -- @preserve: handled per-type by getRegistryValuesBySuffix below */
      }
    }
    pathIndex = await buildPackageDirectoryIndex(directoryNames, ignoreDirs, undefined);
  }

  const typeLimit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);
  const typeResults: TypeVerifyResult[] = await Promise.all(
    effectiveTypes.map((metadataType) =>
      typeLimit(async (): Promise<TypeVerifyResult> => {
        const typeResolved = resolveDecomposeOptionsForType(metadataType, baseOptions, overrides);

        let metaAttributes;
        let ignorePath: string;
        try {
          ({ metaAttributes, ignorePath } = await getRegistryValuesBySuffix(
            metadataType,
            'decompose',
            ignoreDirs,
            undefined,
            typeResolved.uniqueIdElements,
            pathIndex,
          ));
        } catch (err) {
          /* istanbul ignore if -- @preserve: preserves non-manifest behavior; unreachable via known CLI types */
          if (!manifestFilter) throw err;
          /* istanbul ignore next -- @preserve: getRegistryValuesBySuffix always throws Error instances */
          const message = err instanceof Error ? err.message : String(err);
          log(`Skipping ${metadataType}: ${message}`);
          return { metadataType, processed: false, drift: [], reordered: [] };
        }

        const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);
        const parentFiles = await listParentXmlFilesForType(metaAttributes, manifestXmlPaths);

        const fileLimit = pLimit(CONCURRENCY_LIMITS.SUBDIRECTORIES);
        const drift: VerifyDrift[] = [];
        const reordered: string[] = [];
        await Promise.all(
          parentFiles.map((parent) =>
            fileLimit(async () => {
              const resolved = resolveDecomposeOptionsForComponent(
                metadataType,
                parent.fullName,
                typeResolved,
                overrides,
              );
              const effective = resolveEffectiveDisassembleOptions(metadataType, resolved);

              const result = await verifyXmlRoundtrip({
                filePath: parent.filePath,
                uniqueIdElements: metaAttributes.uniqueIdElements,
                strategy: effective.strategy,
                ignorePath,
                fileExtension: `${metadataType}-meta.xml`,
                multiLevel: effective.multiLevel,
                splitTags: effective.splitTags,
                sidecarElements: effective.sidecarElements,
              });

              // `verifyXmlRoundtrip` reports "missing in round-trip output" whenever the file
              // can't be disassembled at all (leaf-only XML, or XML the parser rejects outright)
              // -- not just when reassembly loses data. A real decompose run silently skips such
              // files entirely (no directory is ever created, so recompose has nothing to touch),
              // leaving them byte-identical throughout. Treat that specific reason as a no-op,
              // matching what the real pipeline actually does, rather than false-flagging every
              // leaf-only metadata file as drift.
              if (result.status === 'drift' && result.reason !== 'missing in round-trip output') {
                const relPath = relativeToPackageDir(parent.filePath, packageDirs, repoRoot);
                drift.push({ path: relPath, reason: result.reason ?? 'content drift' });
              } else if (result.status === 'reordered') {
                const relPath = relativeToPackageDir(parent.filePath, packageDirs, repoRoot);
                reordered.push(relPath);
              }
            }),
          ),
        );

        return { metadataType, processed: true, drift, reordered };
      }),
    ),
  );

  const metadata = typeResults.filter((r) => r.processed).map((r) => r.metadataType);
  const drift = typeResults.flatMap((r) => r.drift);
  const reordered = typeResults.flatMap((r) => r.reordered);

  if (drift.length === 0) {
    log(`Round-trip verified for ${metadata.length} metadata type(s); no drift detected.`);
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

  return { metadata, drift, reordered };
}

/** Path of `filePath` relative to whichever package directory contains it, forward-slashed. */
function relativeToPackageDir(filePath: string, packageDirs: string[], repoRoot: string): string {
  const absoluteFile = resolve(filePath);
  const containingDir = packageDirs
    .filter((dir) => absoluteFile === dir || absoluteFile.startsWith(`${dir}${sep}`))
    .sort((a, b) => b.length - a.length)[0];
  const base = containingDir ?? repoRoot;
  return relative(base, absoluteFile).split(sep).join('/');
}
