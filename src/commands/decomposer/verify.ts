'use strict';

import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Messages } from '@salesforce/core';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { verifyMetadataTypes } from '../../core/verifyMetadataTypes.js';
import { loadConfigFile, parseConfigSuffixes, resolveDefaultConfigPath } from '../../helpers/configOverrides.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from '../../helpers/constants.js';
import { VerifyResult } from '../../helpers/types.js';
import { getRepoRoot } from '../../service/core/getRepoRoot.js';

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

    let metadataTypes = flags['metadata-type'];
    let manifest = flags['manifest'];
    let ignoreDirs = flags['ignore-package-directory'];
    let format = flags['format'] ?? 'xml';
    let strategy = flags['strategy'] ?? 'unique-id';
    let decomposeNestedPerms = flags['decompose-nested-permissions'];
    let overrides;

    if (flags['config']) {
      const config = await loadConfigFile(await resolveDefaultConfigPath());
      metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
      const configManifest = !flags['manifest'] ? config.manifest : undefined;
      manifest ??= config.manifest;
      ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
      format = flags['format'] ?? config.decomposedFormat ?? 'xml';
      strategy = flags['strategy'] ?? config.strategy ?? 'unique-id';
      decomposeNestedPerms = flags['decompose-nested-permissions'] || (config.decomposeNestedPermissions ?? false);
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

    const result = await verifyMetadataTypes({
      metadataTypes,
      format,
      ignoreDirs,
      strategy,
      decomposeNestedPerms,
      manifest,
      overrides,
      log: this.log.bind(this),
    });

    if (result.drift.length > 0) {
      throw messages.createError('error.driftDetected', [String(result.drift.length)]);
    }

    return result;
  }
}
