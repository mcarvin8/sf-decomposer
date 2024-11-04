'use strict';
export const SFDX_PROJECT_FILE_NAME = 'sfdx-project.json';
export const CUSTOM_LABELS_FILE = 'CustomLabels.labels-meta.xml';
export const DEFAULT_UNIQUE_ID_ELEMENTS: string = 'fullName,name';
export const LOG_FILE = 'disassemble.log';
export const DECOMPOSED_FILE_TYPES: string[] = ['xml', 'json', 'yaml'];
export const IGNORE_FILE = '.sfdecomposerignore';
export const WORKFLOW_SUFFIX_MAPPING: { [key: string]: string } = {
  'alerts-meta.xml': 'workflowAlert-meta.xml',
  'fieldUpdates-meta.xml': 'workflowFieldUpdate-meta.xml',
  'flowActions-meta.xml': 'workflowFlowAction-meta.xml',
  'knowledgePublishes-meta.xml': 'workflowKnowledgePublish-meta.xml',
  'outboundMessages-meta.xml': 'workflowOutboundMessage-meta.xml',
  'rules-meta.xml': 'workflowRule-meta.xml',
  'tasks-meta.xml': 'workflowTask-meta.xml',
  'send-meta.xml': 'workflowSend-meta.xml',
};
