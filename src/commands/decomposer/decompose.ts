'use strict';
/* eslint-disable no-await-in-loop */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { LOG_FILE, DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
import { decomposeFileHandler } from '../../service/decompose/decomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/core/checkLogforErrors.js';
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
    strategy: Flags.string({
      summary: messages.getMessage('flags.strategy.summary'),
      char: 's',
      required: true,
      multiple: false,
      default: 'unique-id',
      options: DECOMPOSED_STRATEGIES,
    }),
    'decompose-nested-permissions': Flags.boolean({
      summary: messages.getMessage('flags.decompose-nested-permissions.summary'),
      char: 'p',
      required: false,
      default: false,
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
    const strategy = flags['strategy'];
    const decomposeNestedPerms = flags['decompose-nested-permissions'];
    for (const metadataType of metadataTypes) {
      const { metaAttributes, ignorePath } = await getRegistryValuesBySuffix(metadataType, 'decompose', ignoreDirs);

      let effectiveStrategy = strategy;

      if (metadataType === 'labels' && strategy === 'grouped-by-tag') {
        this.warn('Overriding strategy to "unique-id" for custom labels, as "grouped-by-tag" is not supported.');
        effectiveStrategy = 'unique-id';
      }

      if (metadataType === 'loyaltyProgramSetup' && strategy === 'grouped-by-tag') {
        this.warn('Overriding strategy to "unique-id" for loyaltyProgramSetup, as "grouped-by-tag" is not supported.');
        effectiveStrategy = 'unique-id';
      }
      if (metadataType === 'bot' && strategy === 'grouped-by-tag') {
        this.warn('Overriding strategy to "unique-id" for bot, as "grouped-by-tag" is not supported.');
        effectiveStrategy = 'unique-id';
      }
      const currentLogFile = await readOriginalLogFile(LOG_FILE);
      await decomposeFileHandler(
        metaAttributes,
        prepurge,
        postpurge,
        debug,
        format,
        ignorePath,
        effectiveStrategy,
        decomposeNestedPerms
      );
      const decomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
      if (decomposeErrors.length > 0) {
        decomposeErrors.forEach((error) => {
          this.warn(error);
        });
      }
      this.log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }
    return {
      metadata: metadataTypes,
    };
  }
}
