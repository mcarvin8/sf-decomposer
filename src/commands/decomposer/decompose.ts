'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { decomposeMetadataTypes } from '../../core/decomposeMetadataTypes.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
import { isMissingMetadataOrManifest, resolveDecomposeOptions } from '../../helpers/runOptions.js';
import { DecomposerResult } from '../../helpers/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.decompose');

export default class DecomposerDecompose extends SfCommand<DecomposerResult> {
  public static override readonly summary = messages.getMessage('summary');
  public static override readonly description = messages.getMessage('description');
  public static override readonly examples = messages.getMessages('examples');

  public static override readonly flags = {
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      multiple: true,
      required: false,
    }),
    manifest: Flags.file({
      summary: messages.getMessage('flags.manifest.summary'),
      char: 'x',
      required: false,
      exists: true,
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
    format: Flags.string({
      summary: messages.getMessage('flags.format.summary'),
      char: 'f',
      required: false,
      multiple: false,
      options: DECOMPOSED_FILE_TYPES,
      defaultHelp: async () => 'xml',
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
      required: false,
      multiple: false,
      options: DECOMPOSED_STRATEGIES,
      defaultHelp: async () => 'unique-id',
    }),
    'decompose-nested-permissions': Flags.boolean({
      summary: messages.getMessage('flags.decompose-nested-permissions.summary'),
      char: 'p',
      required: false,
      default: false,
    }),
    config: Flags.boolean({
      summary: messages.getMessage('flags.config.summary'),
      char: 'c',
      required: false,
      default: false,
    }),
    'update-forceignore': Flags.boolean({
      summary: messages.getMessage('flags.update-forceignore.summary'),
      required: false,
      default: false,
    }),
    'update-gitattributes': Flags.boolean({
      summary: messages.getMessage('flags.update-gitattributes.summary'),
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<DecomposerResult> {
    const { flags } = await this.parse(DecomposerDecompose);

    const options = await resolveDecomposeOptions({
      metadataTypes: flags['metadata-type'],
      manifest: flags['manifest'],
      ignoreDirs: flags['ignore-package-directory'],
      format: flags['format'],
      strategy: flags['strategy'],
      prepurge: flags['prepurge'],
      postpurge: flags['postpurge'],
      decomposeNestedPerms: flags['decompose-nested-permissions'],
      updateForceignore: flags['update-forceignore'],
      updateGitattributes: flags['update-gitattributes'],
      config: flags['config'],
      warn: this.warn.bind(this),
    });

    if (isMissingMetadataOrManifest(options)) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    return decomposeMetadataTypes({ ...options, log: this.log.bind(this) });
  }
}
