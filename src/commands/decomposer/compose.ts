'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { Messages } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import { jsonData } from '../../metadata/metadata.js';
import { composeFileHandler } from '../../service/composeFileHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.compose');
const registryAccess = new RegistryAccess();
const metaSuffixOptions = jsonData.map((item) => item.metaSuffix);

export type DecomposerComposeResult = {
  path: string;
};

export default class DecomposerCompose extends SfCommand<DecomposerComposeResult> {
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

  public async run(): Promise<DecomposerComposeResult> {
    const { flags } = await this.parse(DecomposerCompose);

    const metadataTypeToRetrieve = flags['metadata-type'];
    const dxDirectory = flags['dx-directory'];
    const metadataTypeEntry = jsonData.find((item) => item.metaSuffix === metadataTypeToRetrieve);

    if (metadataTypeEntry) {
      const { metaSuffix } = metadataTypeEntry;
      const metadataType = registryAccess.getTypeBySuffix(metaSuffix);

      if (metadataType) {
        const metaAttributes = {
          metaSuffix,
          xmlElement: metadataType.name,
          metadataPath:
            metaSuffix === 'botVersion'
              ? `${dxDirectory}/bots` // Change the directoryName to 'bots' until SDR is fixed
              : `${dxDirectory}/${metadataType.directoryName}`,
        };

        await composeFileHandler(metaAttributes);
        this.log(`All metadata files have been composed for the metadata type: ${metaSuffix}`);
      } else {
        this.error(`Metadata type definition not found for suffix: ${metadataTypeToRetrieve}`);
      }
    } else {
      this.error(`Metadata type ${metadataTypeToRetrieve} not found.`);
    }

    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\compose.ts',
    };
  }
}
