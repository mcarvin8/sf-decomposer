'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { SFDX_PROJECT_FILE_NAME, LOG_FILE, DECOMPOSED_FILE_TYPES } from '../../helpers/constants.js';
import { recomposeFileHandler } from '../../service/recomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/checkLogforErrors.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.recompose');

export type DecomposerRecomposeResult = {
  metadata: string;
};

export default class DecomposerRecompose extends SfCommand<DecomposerRecomposeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'sfdx-configuration': Flags.file({
      summary: messages.getMessage('flags.sfdx-configuration.summary'),
      char: 'c',
      required: true,
      exists: true,
      default: SFDX_PROJECT_FILE_NAME,
    }),
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
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
    format: Flags.string({
      summary: messages.getMessage('flags.format.summary'),
      char: 'f',
      required: true,
      multiple: false,
      default: 'xml',
      options: DECOMPOSED_FILE_TYPES,
    }),
  };

  public async run(): Promise<DecomposerRecomposeResult> {
    const { flags } = await this.parse(DecomposerRecompose);
    const sfdxConfigFile = flags['sfdx-configuration'];
    const metadataTypeToRetrieve = flags['metadata-type'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const format = flags['format'];
    const metaAttributes = await getRegistryValuesBySuffix(metadataTypeToRetrieve, sfdxConfigFile, 'recompose');

    const currentLogFile = await readOriginalLogFile(LOG_FILE);
    await recomposeFileHandler(metaAttributes, postpurge, debug, format);
    const recomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
    if (recomposeErrors.length > 0) {
      recomposeErrors.forEach((error) => {
        this.warn(error);
      });
    }
    this.log(`All metadata files have been recomposed for the metadata type: ${metadataTypeToRetrieve}`);

    return {
      metadata: metadataTypeToRetrieve,
    };
  }
}
