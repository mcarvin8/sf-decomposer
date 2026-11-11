'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { verifyMetadataTypes } from '../../core/verifyMetadataTypes.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
import { isMissingMetadataOrManifest, resolveVerifyOptions } from '../../helpers/runOptions.js';
import { VerifyResult } from '../../helpers/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-decomposer', 'decomposer.verify');

export default class DecomposerVerify extends SfCommand<VerifyResult> {
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
  };

  public async run(): Promise<VerifyResult> {
    const { flags } = await this.parse(DecomposerVerify);

    const options = await resolveVerifyOptions({
      metadataTypes: flags['metadata-type'],
      manifest: flags['manifest'],
      ignoreDirs: flags['ignore-package-directory'],
      format: flags['format'],
      strategy: flags['strategy'],
      decomposeNestedPerms: flags['decompose-nested-permissions'],
      config: flags['config'],
      warn: this.warn.bind(this),
    });

    if (isMissingMetadataOrManifest(options)) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    const result = await verifyMetadataTypes({ ...options, log: this.log.bind(this) });

    if (result.drift.length > 0) {
      throw messages.createError('error.driftDetected', [String(result.drift.length)]);
    }

    return result;
  }
}
