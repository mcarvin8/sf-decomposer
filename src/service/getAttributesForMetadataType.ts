'use strict';

import { Metadata } from '../metadata/metadataInterface.js';

export function getAttributesForMetadataType(
  jsonData: Metadata[],
  metadataType: string,
  dxDirectory: string
): {
  metaSuffix: string;
  fieldNames: string;
  xmlElement: string;
  metadataPath: string;
} | null {
  const metadata = jsonData.find((item) => item.metaSuffix === metadataType);

  if (metadata) {
    const metaSuffix = metadata.metaSuffix;
    const directoryName = metadata.directoryName || '';
    const fieldNames = metadata.fieldNames;
    const xmlElement = metadata.xmlElement;
    const metadataPath = `${dxDirectory}/${directoryName}`;

    return {
      metaSuffix,
      fieldNames,
      xmlElement,
      metadataPath,
    };
  }

  return null;
}
