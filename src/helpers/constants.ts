'use strict';
export const SFDX_PROJECT_FILE_NAME = 'sfdx-project.json';
export const CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';
export const DEFAULT_UNIQUE_ID_ELEMENTS: string = 'fullName,name';
export const LOG_FILE = 'disassemble.log';
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

// Concurrency limits to prevent file system overload
// These conservative limits prevent EMFILE and EBUSY errors
export const CONCURRENCY_LIMITS = {
  METADATA_TYPES: 3, // Process up to 3 metadata types concurrently
  PACKAGE_DIRS: 5, // Process up to 5 package directories concurrently
  SUBDIRECTORIES: 5, // Process up to 5 subdirectories concurrently
  FILE_OPERATIONS: 10, // Perform up to 10 file operations concurrently (moves, renames, stats)
};
