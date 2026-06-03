'use strict';

import type { InternalMetadataType } from '../helpers/types.js';

// Types missing from SDR 12.36.0. Entries here take priority over SDR and bypass
// the adapter-strategy gate (the plugin explicitly supports these).
// Run `node tooling/syncInternalRegistryWithSdr.mjs` after upgrading SDR to prune
// entries that SDR has since added.
export const internalRegistry: InternalMetadataType[] = [
  { suffix: 'activationPlatformField', directoryName: 'activationPlatformFields' },
  { suffix: 'actvPfrmDataConnectorS3', directoryName: 'actvPfrmDataConnectorS3s' },
  { suffix: 'actvPlatformAdncIdentifier', directoryName: 'actvPlatformAdncIdentifiers' },
  { suffix: 'actvPlatformFieldValue', directoryName: 'actvPlatformFieldValues' },
  { suffix: 'dataSourceField', directoryName: 'dataSourceFields' },
  { suffix: 'SearchResultActionConfigSetting', directoryName: 'SearchResultActionConfigSettings' },
];
