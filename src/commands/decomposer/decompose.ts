'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import { decomposeFileHandler } from '../../service/decomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');

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
    const dxDirectory = flags['dx-directory'];
    const prepurge = flags['prepurge'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const metaAttributes = await getRegistryValuesBySuffix(metadataTypeToRetrieve, dxDirectory);

    await decomposeFileHandler(metaAttributes, prepurge, postpurge, debug);
    this.log(`All metadata files have been decomposed for the metadata type: ${metadataTypeToRetrieve}`);

    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\decompose.ts',
    };
  }
}
