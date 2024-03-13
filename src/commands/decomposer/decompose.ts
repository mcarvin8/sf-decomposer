'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { METADATA_DIR_DEFAULT_VALUE, DEFAULT_UNIQUE_ID_ELEMENT } from '../../helpers/constants.js';
import { getUniqueIdElements } from '../../metadata/getUniqueIdElements.js';
import { decomposeFileHandler } from '../../service/decomposeFileHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');
const registryAccess = new RegistryAccess();

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
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
    }),
    prepurge: Flags.boolean({
      summary: messages.getMessage('flags.prepurge.summary'),
      required: false,
      default: false,
    }),
    postpurge: Flags.boolean({
      summary: messages.getMessage('flags.postpurge.summary'),
      required: false,
      default: false,
    }),
    debug: Flags.boolean({
      summary: messages.getMessage('flags.debug.summary'),
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<DecomposerDecomposeResult> {
    const { flags } = await this.parse(DecomposerDecompose);
    const metadataTypeToRetrieve = flags['metadata-type'];
    if (metadataTypeToRetrieve === 'object') {
      this.error('Custom Objects are not supported by this plugin.');
    }
    if (metadataTypeToRetrieve === 'botVersion') {
      this.error('`botVersion` suffix should not be used. Please use `bot` to decompose bot and bot version files.');
    }
    const dxDirectory = flags['dx-directory'];
    const prepurge = flags['prepurge'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
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
        strictDirectoryName: metadataTypeEntry.strictDirectoryName as boolean,
        folderType: metadataTypeEntry.folderType as string,
        metadataPath: `${dxDirectory}/${metadataTypeEntry.directoryName}`,
        uniqueIdElements: getUniqueIdElements(metadataTypeToRetrieve)
          ? `${DEFAULT_UNIQUE_ID_ELEMENT},${getUniqueIdElements(metadataTypeToRetrieve)}`
          : DEFAULT_UNIQUE_ID_ELEMENT,
      };
      await decomposeFileHandler(metaAttributes, prepurge, postpurge, debug);
      this.log(`All metadata files have been decomposed for the metadata type: ${metadataTypeToRetrieve}`);
    } else {
      this.error(`Metadata type not found for the given suffix: ${metadataTypeToRetrieve}.`);
    }

    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\decompose.ts',
    };
  }
}
