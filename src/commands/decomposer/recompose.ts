'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import { recomposeFileHandler } from '../../service/recomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.recompose');

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
    debug: Flags.boolean({
      summary: messages.getMessage('flags.debug.summary'),
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<DecomposerRecomposeResult> {
    const { flags } = await this.parse(DecomposerRecompose);
    const metadataTypeToRetrieve = flags['metadata-type'];
    const debug = flags['debug'];
    const dxDirectory = flags['dx-directory'];
    const metaAttributes = getRegistryValuesBySuffix(metadataTypeToRetrieve, dxDirectory);

    await recomposeFileHandler(metaAttributes, debug);
    this.log(`All metadata files have been recomposed for the metadata type: ${metadataTypeToRetrieve}`);

    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\recompose.ts',
    };
  }
}
