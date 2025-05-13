'use strict';
export const SFDX_PROJECT_FILE_NAME = 'sfdx-project.json';
export const CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';
export const DEFAULT_UNIQUE_ID_ELEMENTS: string = 'fullName,name';
export const LOG_FILE = 'disassemble.log';
export const DECOMPOSED_FILE_TYPES: string[] = ['xml', 'json', 'yaml', 'json5', 'toml', 'ini'];
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
