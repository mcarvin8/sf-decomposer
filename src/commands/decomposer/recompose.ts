'use strict';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';

import { recomposeMetadataTypes } from '../../core/recomposeMetadataTypes.js';
import {
  loadConfigFile,
  parseConfigSuffixes,
  resolveDefaultConfigPath,
  validateConfigManifest,
} from '../../helpers/configOverrides.js';
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

    let metadataTypes = flags['metadata-type'];
    let manifest = flags['manifest'];
    let ignoreDirs = flags['ignore-package-directory'];
    let postpurge = flags['postpurge'];

    if (flags['config']) {
      const config = await loadConfigFile(await resolveDefaultConfigPath());
      metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
      const configManifest = !flags['manifest'] ? config.manifest : undefined;
      manifest ??= config.manifest;
      ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
      postpurge = flags['postpurge'] || (config.postPurge ?? false);

      manifest = await validateConfigManifest({
        configManifest,
        metadataTypes,
        manifest,
        warn: this.warn.bind(this),
      });
    }

    if (!metadataTypes?.length && !manifest) {
      throw messages.createError('error.missingMetadataOrManifest');
    }

    return recomposeMetadataTypes({
      metadataTypes,
      postpurge,
      ignoreDirs,
      manifest,
      log: this.log.bind(this),
    });
  }
}
