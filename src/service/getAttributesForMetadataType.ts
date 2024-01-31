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
  recurse?: boolean;
} | null {
  const metadata = jsonData.find((item) => item.metaSuffix === metadataType);

  if (metadata) {
    const metaSuffix = metadata.metaSuffix;
    const directoryName = metadata.directoryName || '';
    const fieldNames = metadata.fieldNames;
    const xmlElement = metadata.xmlElement;
    const metadataPath = `${dxDirectory}/${directoryName}`;
    const recurse = metadata.recurse ?? false;

    return {
      metaSuffix,
      fieldNames,
      xmlElement,
      metadataPath,
      recurse,
    };
  }

  return null;
}
