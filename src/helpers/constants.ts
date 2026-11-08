'use strict';
export const SFDX_PROJECT_FILE_NAME = 'sfdx-project.json';
export const CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';
// config-disassembler writes this alongside the shard directory it disassembles a parent XML
// into, recording whether the source file ended in a newline, and reads it back on reassemble.
// CustomLabels' decompose/recompose shuffle (customLabels.ts / reassembleLabels.ts) must
// carry it across manually since it lives one level up from the actual label shard files.
export const TRAILING_NEWLINE_SIDECAR = '.trailing_newline.json';
export const DEFAULT_UNIQUE_ID_ELEMENTS: string = 'fullName,name';
export const DECOMPOSED_FILE_TYPES: string[] = ['xml', 'json', 'yaml', 'json5'];
export const DECOMPOSED_STRATEGIES: string[] = ['unique-id', 'grouped-by-tag'];
export const IGNORE_FILE = '.sfdecomposerignore';
export const WORKFLOW_SUFFIX_MAPPING: { [key: string]: string } = {
  'alerts-meta': 'workflowAlert-meta',
  'fieldUpdates-meta': 'workflowFieldUpdate-meta',
  'flowActions-meta': 'workflowFlowAction-meta',
  'knowledgePublishes-meta': 'workflowKnowledgePublish-meta',
  'outboundMessages-meta': 'workflowOutboundMessage-meta',
  'rules-meta': 'workflowRule-meta',
  'tasks-meta': 'workflowTask-meta',
  'send-meta': 'workflowSend-meta',
};
export const HOOK_CONFIG_JSON = '.sfdecomposer.config.json';

// SDR adapter strategies this plugin cannot decompose (see getRegistryValuesBySuffix.ts).
// Also referenced by scripts/update-metadata-support.ts to classify new registry types.
export const UNSUPPORTED_ADAPTERS: string[] = ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'];

// Concurrency limits to prevent file system overload
// These conservative limits prevent EMFILE and EBUSY errors
export const CONCURRENCY_LIMITS = {
  METADATA_TYPES: 3, // Process up to 3 metadata types concurrently
  PACKAGE_DIRS: 5, // Process up to 5 package directories concurrently
  SUBDIRECTORIES: 2, // EXPERIMENT (not for merge): probe recompose peak RSS vs wall time at 2 vs 5
  // Per-file / per-subdirectory *disassemble* calls in flight at once (perFileHandler for
  // component-scope overrides, subDirectoryHandler for strict-directory types like bots).
  // Matches config-disassembler's own in-call fan-out (DIRECTORY_CONCURRENCY = 16 files per
  // directory-mode call), so a type split into per-file calls keeps 16 files in flight
  // instead of dropping to 5: -6% to -14% decompose wall on the `manyfiles-overrides` perf
  // profile, peak RSS flat. Deliberately NOT applied to recompose: each reassemble call
  // already parses up to 32 shards in parallel, so 16 concurrent calls oversubscribed the
  // cores there (+6% to +10% XML recompose wall in the same run).
  PER_FILE_DISASSEMBLE: 16,
  FILE_OPERATIONS: 10, // Perform up to 10 file operations concurrently (moves, renames, stats)
};
