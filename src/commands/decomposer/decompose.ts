'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { LOG_FILE, DECOMPOSED_FILE_TYPES } from '../../helpers/constants.js';
import { decomposeFileHandler } from '../../service/decomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/checkLogforErrors.js';
import { DecomposerResult } from '../../helpers/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.decompose');

export default class DecomposerDecompose extends SfCommand<DecomposerResult> {
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
    const { flags } = await this.parse(DecomposerDecompose);
    const metadataTypes = flags['metadata-type'];
    const prepurge = flags['prepurge'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const format = flags['format'];
    const ignoreDirs = flags['ignore-package-directory'];

    const promises = metadataTypes.map(async (metadataType) => {
      const { metaAttributes, ignorePath } = await getRegistryValuesBySuffix(metadataType, 'decompose', ignoreDirs);

      const currentLogFile = await readOriginalLogFile(LOG_FILE);
      await decomposeFileHandler(metaAttributes, prepurge, postpurge, debug, format, ignorePath);
      const decomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
      if (decomposeErrors.length > 0) {
        decomposeErrors.forEach((error) => {
          this.warn(error);
        });
      }
      this.log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    });

    // Wait for all the promises to resolve
    await Promise.all(promises);

    return {
      metadata: metadataTypes,
    };
  }
}
