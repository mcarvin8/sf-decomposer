'use strict';

export const SFDX_CONFIG_FILE = 'sfdx-project.json';
export const METADATA_UNDER_TEST = [
  'labels',
  'workflow',
  'bot',
  'profile',
  'permissionset',
  'flow',
  'escalationRules',
  'loyaltyProgramSetup',
];
// labels shouldn't be in the tags test
export const METADATA_UNDER_TEST_FOR_TAGS = ['workflow', 'bot', 'profile', 'permissionset', 'flow', 'app'];
