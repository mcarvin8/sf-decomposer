'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { Messages, Logger } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import { recomposeFileHandler } from '../../service/recomposeFileHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.recompose');
const registryAccess = new RegistryAccess();

export type DecomposerRecomposeResult = {
  path: string;
};

export default class DecomposerRecompose extends SfCommand<DecomposerRecomposeResult> {
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
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
    }),
  };

  public async run(): Promise<DecomposerRecomposeResult> {
    const { flags } = await this.parse(DecomposerRecompose);
    const log = await Logger.child(this.ctor.name);
    const metadataTypeToRetrieve = flags['metadata-type'];
    if (metadataTypeToRetrieve === 'object') {
      this.error('Custom Objects are not supported by this plugin.');
    }
    const dxDirectory = flags['dx-directory'];
    const metadataTypeEntry = registryAccess.getTypeBySuffix(metadataTypeToRetrieve);

    if (metadataTypeEntry) {
      if (
        metadataTypeEntry.strategies?.adapter &&
        ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'].includes(
          metadataTypeEntry.strategies.adapter
        )
      ) {
        this.error(
          `Metadata types with ${metadataTypeEntry.strategies.adapter} strategies are not supported by this plugin.`
        );
      }
      const metaAttributes = {
        metaSuffix: metadataTypeEntry.suffix as string,
        xmlElement: metadataTypeEntry.name,
        strictDirectoryName: metadataTypeEntry.strictDirectoryName as boolean,
        folderType: metadataTypeEntry.folderType as string,
        metadataPath:
          metadataTypeToRetrieve === 'botVersion'
            ? `${dxDirectory}/bots` // Change the directoryName to 'bots' until SDR is fixed
            : `${dxDirectory}/${metadataTypeEntry.directoryName}`,
      };

      await recomposeFileHandler(metaAttributes, log);
      this.log(`All metadata files have been recomposed for the metadata type: ${metadataTypeToRetrieve}`);
    } else {
      this.error(`Metadata type not found for the given suffix: ${metadataTypeToRetrieve}.`);
    }

    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\recompose.ts',
    };
  }
}
