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
  'mutingpermissionset',
  'recordType',
  'externalServiceRegistration',
  // Real-world gremlins already sitting in the fixtures but never round-tripped:
  // marketingappextension has CDATA-wrapped JSON blobs, globalValueSetTranslation
  // has an inline XML comment. Both are byte-fidelity edge cases that a
  // synthetic-generator perf fixture wouldn't produce.
  'marketingappextension',
  'globalValueSetTranslation',
];
// labels shouldn't be in the tags test
export const METADATA_UNDER_TEST_FOR_TAGS = ['workflow', 'bot', 'profile', 'permissionset', 'flow', 'app'];
export const FORMATS = ['xml', 'json', 'json5', 'yaml'];
