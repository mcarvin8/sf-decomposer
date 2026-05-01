'use strict';

/**
 * Built-in `multiLevel` rules applied when the user does not supply their own
 * `multiLevel` override for a metadata suffix and `strategy === 'unique-id'`.
 *
 * Rule shape: `<file_pattern>:<root_to_strip>:<unique_id_elements>` (the third
 * segment is itself a comma-separated list). See the `multiLevel` JSDoc on
 * `DecomposerOverride` in src/helpers/types.ts for the full grammar.
 *
 * Adding an entry here makes the rule the default for that metadata suffix.
 * User-supplied overrides always win because the resolver only falls back to
 * this map when `options.multiLevel === undefined`.
 *
 * To use a different multi-level layout, supply your own `multiLevel` in
 * `.sfdecomposer.config.json` (component- or type-scoped). To get fully flat
 * output, pass `--strategy grouped-by-tag`, which skips multi-level entirely.
 */
export const multiLevelDefaults: Record<string, string[]> = {
  // Bot: dialogs split out by developerName so each dialog gets its own
  // subdirectory; steps within a dialog split by step type so distinct steps
  // (Message vs Navigation vs Wait, etc.) live in separate shards. Without
  // these the output is a flat blob of indistinguishable <botSteps> shards
  // since most botSteps elements share structural shape and the SHA-256
  // fallback alone produces opaque file names.
  bot: ['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'],

  // LoyaltyProgramSetup: programProcesses keyed by parameterName + ruleName.
  // (Previously hardcoded inline in decomposeFileHandler.ts.)
  loyaltyProgramSetup: ['programProcesses:programProcesses:parameterName,ruleName'],
};
