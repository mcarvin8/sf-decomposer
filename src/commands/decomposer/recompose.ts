'use strict';

import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';

import { recomposeMetadataTypes } from '../../core/recomposeMetadataTypes.js';
import { loadConfigFile, parseConfigSuffixes, resolveDefaultConfigPath } from '../../helpers/configOverrides.js';
import { DecomposerResult } from '../../helpers/types.js';
import { getRepoRoot } from '../../service/core/getRepoRoot.js';

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

      if (configManifest) {
        const { repoRoot } = await getRepoRoot();
        try {
          await access(resolve(repoRoot ?? process.cwd(), configManifest));
        } catch (err) {
          if (metadataTypes?.length) {
            this.warn(
              `Config manifest "${configManifest}" not found on disk. Falling back to metadataSuffixes from config.`,
            );
            manifest = undefined;
          } else {
            throw new Error(
              `Config manifest "${configManifest}" not found on disk and no metadataSuffixes are defined in the config. ` +
                'Ensure the manifest exists before running this command, or add metadataSuffixes to the config as a fallback.',
              { cause: err },
            );
          }
        }
      }
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
