'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { decomposeMetadataTypes } from '../../core/decomposeMetadataTypes.js';
import { loadOverridesFromConfig, resolveDefaultConfigPath } from '../../helpers/configOverrides.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
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
  };

  public async run(): Promise<DecomposerResult> {
    const { flags } = await this.parse(DecomposerDecompose);

    if (!flags['metadata-type'] && !flags['manifest']) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    const overrides = flags['config'] ? await loadOverridesFromConfig(await resolveDefaultConfigPath()) : undefined;

    return decomposeMetadataTypes({
      metadataTypes: flags['metadata-type'],
      prepurge: flags['prepurge'],
      postpurge: flags['postpurge'],
      format: flags['format'],
      ignoreDirs: flags['ignore-package-directory'],
      strategy: flags['strategy'],
      decomposeNestedPerms: flags['decompose-nested-permissions'],
      manifest: flags['manifest'],
      overrides,
      updateForceignore: flags['update-forceignore'],
      log: this.log.bind(this),
    });
  }
}
