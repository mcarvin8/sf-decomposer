'use strict';
/* eslint-disable no-await-in-loop */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { LOG_FILE, DECOMPOSED_FILE_TYPES } from '../../helpers/constants.js';
import { recomposeFileHandler } from '../../service/recomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/checkLogforErrors.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.recompose');

export type DecomposerRecomposeResult = {
  metadata: string[];
};

export default class DecomposerRecompose extends SfCommand<DecomposerRecomposeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      multiple: true,
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
    const metadataTypes = flags['metadata-type'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const format = flags['format'];
    for (const metadataType of metadataTypes) {
      const metaAttributes = await getRegistryValuesBySuffix(metadataType, 'recompose');

      const currentLogFile = await readOriginalLogFile(LOG_FILE);
      await recomposeFileHandler(metaAttributes, postpurge, debug, format);
      const recomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
      if (recomposeErrors.length > 0) {
        recomposeErrors.forEach((error) => {
          this.warn(error);
        });
      }
      this.log(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
    }
    return {
      metadata: metadataTypes,
    };
  }
}
