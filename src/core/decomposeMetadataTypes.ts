'use strict';

import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { parseManifest, ManifestFilter } from '../metadata/parseManifest.js';
import { decomposeFileHandler } from '../service/decompose/decomposeFileHandler.js';
import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { DecomposerResult, DecomposeOptions } from '../helpers/types.js';
import { resolveDecomposeOptionsForType } from '../helpers/configOverrides.js';

export async function decomposeMetadataTypes(options: DecomposeOptions): Promise<DecomposerResult> {
  const {
    metadataTypes,
    prepurge,
    postpurge,
    format,
    ignoreDirs,
    strategy,
    decomposeNestedPerms,
    manifest,
    overrides,
    log,
    repoRoot,
  } = options;

  let manifestFilter: ManifestFilter | undefined;
  let effectiveTypes: string[];

  if (manifest) {
    manifestFilter = await parseManifest(manifest, ignoreDirs, repoRoot);
    for (const { type, member } of manifestFilter.unresolvedComponents) {
      log(`Warning: manifest component ${type}:${member} not found in local source; skipping.`);
    }
    // Stryker disable next-line ConditionalExpression, EqualityOperator
    if (metadataTypes && metadataTypes.length > 0) {
      const manifestTypes = new Set(manifestFilter.suffixes);
      effectiveTypes = metadataTypes.filter((type) => manifestTypes.has(type));
    } else {
      effectiveTypes = manifestFilter.suffixes;
    }
  } else {
    if (!metadataTypes || metadataTypes.length === 0) {
      throw Error('Either --metadata-type or --manifest must be provided.');
    }
    effectiveTypes = metadataTypes;
  }

  if (effectiveTypes.length === 0) {
    log('No metadata types to decompose after applying the manifest filter.');
    return { metadata: [] };
  }

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const processed: string[] = [];

  const tasks = effectiveTypes.map((metadataType) =>
    limit(async () => {
      const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);

      let metaAttributes;
      let ignorePath: string;
      try {
        ({ metaAttributes, ignorePath } = await getRegistryValuesBySuffix(
          metadataType,
          'decompose',
          ignoreDirs,
          repoRoot,
        ));
      } catch (err) {
        /* istanbul ignore if -- @preserve: preserves non-manifest behavior; unreachable via known CLI types */
        if (!manifestFilter) throw err;
        /* istanbul ignore next -- @preserve: getRegistryValuesBySuffix always throws Error instances */
        const message = err instanceof Error ? err.message : String(err);
        log(`Skipping ${metadataType}: ${message}`);
        return;
      }

      // Type-scope resolved options serve as the base for component-scope resolution further
      // down the call stack. Hard strategy rules (labels / loyaltyProgramSetup) are applied per
      // file inside the disassembler so they remain in force even when a component-scope override
      // tries to flip the strategy.
      const typeResolved = resolveDecomposeOptionsForType(
        metadataType,
        { format, strategy, decomposeNestedPerms, prepurge, postpurge },
        overrides,
      );

      await decomposeFileHandler(metaAttributes, typeResolved, ignorePath, overrides, manifestXmlPaths);

      processed.push(metadataType);
      log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }),
  );

  await Promise.all(tasks);

  return { metadata: processed };
}
