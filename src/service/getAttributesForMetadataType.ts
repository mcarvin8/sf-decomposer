'use strict';

import { Metadata } from '../metadata/metadataInterface.js';

export function getAttributesForMetadataType(jsonData: Metadata[], metadataType: string): Metadata | null {
  const metadata = jsonData.find((item) => item.metaSuffix === metadataType);

  if (metadata) {
    return metadata;
  }
  return null;
}
