'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';

import { recomposeMetadataTypes } from '../../core/recomposeMetadataTypes.js';
import { isMissingMetadataOrManifest, resolveRecomposeOptions } from '../../helpers/runOptions.js';
import { DecomposerResult } from '../../helpers/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.recompose');

export default class DecomposerRecompose extends SfCommand<DecomposerResult> {
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
    postpurge: Flags.boolean({
      summary: messages.getMessage('flags.postpurge.summary'),
      required: false,
      default: false,
    }),
    'ignore-package-directory': Flags.directory({
      summary: messages.getMessage('flags.ignore-package-directory.summary'),
      char: 'i',
      required: false,
      multiple: true,
    }),
    config: Flags.boolean({
      summary: messages.getMessage('flags.config.summary'),
      char: 'c',
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<DecomposerResult> {
    const { flags } = await this.parse(DecomposerRecompose);

    const options = await resolveRecomposeOptions({
      metadataTypes: flags['metadata-type'],
      manifest: flags['manifest'],
      ignoreDirs: flags['ignore-package-directory'],
      postpurge: flags['postpurge'],
      config: flags['config'],
      warn: this.warn.bind(this),
    });

    if (isMissingMetadataOrManifest(options)) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    return recomposeMetadataTypes({ ...options, log: this.log.bind(this) });
  }
}
