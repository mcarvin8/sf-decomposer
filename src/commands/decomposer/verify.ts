'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { verifyMetadataTypes } from '../../core/verifyMetadataTypes.js';
import { loadOverridesFromConfig, resolveDefaultConfigPath } from '../../helpers/configOverrides.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
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
  };

  public async run(): Promise<VerifyResult> {
    const { flags } = await this.parse(DecomposerVerify);

    if (!flags['metadata-type'] && !flags['manifest']) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    const overrides = flags['config'] ? await loadOverridesFromConfig(await resolveDefaultConfigPath()) : undefined;

    const result = await verifyMetadataTypes({
      metadataTypes: flags['metadata-type'],
      format: flags['format'],
      ignoreDirs: flags['ignore-package-directory'],
      strategy: flags['strategy'],
      decomposeNestedPerms: flags['decompose-nested-permissions'],
      manifest: flags['manifest'],
      overrides,
      log: this.log.bind(this),
    });

    if (result.drift.length > 0) {
      throw messages.createError('error.driftDetected', [String(result.drift.length)]);
    }

    return result;
  }
}
