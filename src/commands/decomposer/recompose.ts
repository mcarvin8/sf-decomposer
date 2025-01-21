'use strict';
/* eslint-disable no-await-in-loop */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { LOG_FILE, DECOMPOSED_FILE_TYPES } from '../../helpers/constants.js';
import { recomposeFileHandler } from '../../service/recomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/checkLogforErrors.js';
import { DecomposerResult } from '../../helpers/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.recompose');

export default class DecomposerRecompose extends SfCommand<DecomposerResult> {
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
    'ignore-package-directory': Flags.directory({
      summary: messages.getMessage('flags.ignore-package-directory.summary'),
      char: 'i',
      required: false,
      multiple: true,
    }),
  };

  public async run(): Promise<DecomposerResult> {
    const { flags } = await this.parse(DecomposerRecompose);
    const metadataTypes = flags['metadata-type'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const format = flags['format'];
    const ignoreDirs = flags['ignore-package-directory'];
    for (const metadataType of metadataTypes) {
      const { metaAttributes } = await getRegistryValuesBySuffix(metadataType, 'recompose', ignoreDirs);

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
