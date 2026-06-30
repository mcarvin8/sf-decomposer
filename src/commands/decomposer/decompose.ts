'use strict';

import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { decomposeMetadataTypes } from '../../core/decomposeMetadataTypes.js';
import { loadConfigFile, parseConfigSuffixes, resolveDefaultConfigPath } from '../../helpers/configOverrides.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
import { DecomposerResult } from '../../helpers/types.js';
import { getRepoRoot } from '../../service/core/getRepoRoot.js';

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

    let metadataTypes = flags['metadata-type'];
    let manifest = flags['manifest'];
    let ignoreDirs = flags['ignore-package-directory'];
    let format = flags['format'] ?? 'xml';
    let strategy = flags['strategy'] ?? 'unique-id';
    let prepurge = flags['prepurge'];
    let postpurge = flags['postpurge'];
    let decomposeNestedPerms = flags['decompose-nested-permissions'];
    let updateForceignore = flags['update-forceignore'];
    let updateGitattributes = flags['update-gitattributes'];
    let overrides;

    if (flags['config']) {
      const config = await loadConfigFile(await resolveDefaultConfigPath());
      metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
      const configManifest = !flags['manifest'] ? config.manifest : undefined;
      manifest ??= config.manifest;
      ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
      format = flags['format'] ?? config.decomposedFormat ?? 'xml';
      strategy = flags['strategy'] ?? config.strategy ?? 'unique-id';
      prepurge = flags['prepurge'] || (config.prePurge ?? false);
      postpurge = flags['postpurge'] || (config.postPurge ?? false);
      decomposeNestedPerms = flags['decompose-nested-permissions'] || (config.decomposeNestedPermissions ?? false);
      updateForceignore = flags['update-forceignore'] || (config.updateForceignore ?? false);
      updateGitattributes = flags['update-gitattributes'] || (config.updateGitattributes ?? false);
      overrides = config.overrides;

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

    return decomposeMetadataTypes({
      metadataTypes,
      prepurge,
      postpurge,
      format,
      ignoreDirs,
      strategy,
      decomposeNestedPerms,
      manifest,
      overrides,
      updateForceignore,
      updateGitattributes,
      log: this.log.bind(this),
    });
  }
}
