'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import jsonData from '../../metadata/metadata.js';
import { Metadata } from '../../metadata/metadataInterface.js';
import { getAttributesForMetadataType } from '../../service/getAttributesForMetadataType.js';
import { decomposeFileHandler } from '../../service/decomposeFileHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');
const metaSuffixOptions = jsonData.map((item: Metadata) => item.metaSuffix);

export type DecomposerDecomposeResult = {
  path: string;
};

export default class DecomposerDecompose extends SfCommand<DecomposerDecomposeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'dx-directory': Flags.directory({
      summary: messages.getMessage('flags.dx-directory.summary'),
      char: 'd',
      required: true,
      exists: true,
      default: METADATA_DIR_DEFAULT_VALUE,
    }),
    'metadata-type': Flags.option({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
      options: metaSuffixOptions,
    })(),
  };

  public async run(): Promise<DecomposerDecomposeResult> {
    const { flags } = await this.parse(DecomposerDecompose);

    const metadataTypeToRetrieve = flags['metadata-type'];
    const dxDirectory = flags['dx-directory'];
    const metaAttributes = getAttributesForMetadataType(jsonData, metadataTypeToRetrieve, dxDirectory);

    if (metaAttributes) {
      const { metaSuffix, fieldNames, xmlElement, metadataPath } = metaAttributes;
      decomposeFileHandler(metadataPath, metaSuffix, fieldNames, xmlElement);
      this.log(`All metadata files have been decomposed for the metadata type: ${metaSuffix}`);
    } else {
      this.error(`Metadata type ${metadataTypeToRetrieve} not found.`);
    }

    return {
      path: 'sfdx-decomposer\\src\\commands\\decomposer\\decompose.ts',
    };
  }
}
