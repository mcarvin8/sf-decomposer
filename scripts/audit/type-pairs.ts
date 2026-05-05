/*
 * (DirectoryName, MetadataSuffix) pairs used by the audit harness.
 *
 * The directory name is what Salesforce CLI plops into force-app/main/default/
 * during retrieve; the suffix is what `decomposer (de|re)compose -m <suffix>`
 * expects (matches MetadataResolver / source-deploy-retrieve registration).
 *
 * The two diverge for several types — `customMetadata` uses suffix `md`,
 * `applications` uses `app`, and so on — which is why we keep this as
 * explicit data rather than deriving one from the other.
 *
 * Per-pair `sample` overrides exist for types that round-trip slowly enough
 * (custom metadata records, report types) that capping speeds up CI without
 * losing signal.
 */

import type { TypePair } from './lib.js';

/**
 * Decompose-only sweep: tally hash-filename counts across many types to
 * surface uniqueIdElements coverage opportunities. This is the broad net.
 */
export const SWEEP_PAIRS: readonly TypePair[] = [
  { type: 'reportTypes', suffix: 'reportType' },
  { type: 'flexipages', suffix: 'flexipage' },
  { type: 'territory2Models', suffix: 'territory2Model' },
  { type: 'globalValueSets', suffix: 'globalValueSet' },
  { type: 'standardValueSets', suffix: 'standardValueSet' },
  { type: 'applications', suffix: 'app' },
  { type: 'networks', suffix: 'network' },
  { type: 'duplicateRules', suffix: 'duplicateRule' },
  { type: 'queueRoutingConfigs', suffix: 'queueRoutingConfig' },
  { type: 'liveChatButtons', suffix: 'liveChatButton' },
  { type: 'liveChatDeployments', suffix: 'liveChatDeployment' },
  { type: 'liveChatAgentConfigs', suffix: 'liveChatAgentConfig' },
  { type: 'presenceUserConfigs', suffix: 'presenceUserConfig' },
  { type: 'connectedApps', suffix: 'connectedApp' },
  { type: 'cspTrustedSites', suffix: 'cspTrustedSite' },
  { type: 'customPermissions', suffix: 'customPermission' },
  { type: 'genAiFunctions', suffix: 'genAiFunction' },
  { type: 'genAiPromptTemplates', suffix: 'genAiPromptTemplate' },
  { type: 'genAiPlugins', suffix: 'genAiPlugin' },
  { type: 'omniSupervisorConfigs', suffix: 'omniSupervisorConfig' },
  { type: 'pathAssistants', suffix: 'pathAssistant' },
  { type: 'skills', suffix: 'skill' },
  { type: 'groups', suffix: 'group' },
  { type: 'queues', suffix: 'queue' },
  { type: 'remoteSiteSettings', suffix: 'remoteSite' },
  { type: 'samlssoconfigs', suffix: 'samlssoconfig' },
  { type: 'mlDomains', suffix: 'mlDomain' },
  { type: 'milestoneTypes', suffix: 'milestoneType' },
  { type: 'pages', suffix: 'page' },
  { type: 'tabs', suffix: 'tab' },
  { type: 'sites', suffix: 'site' },
  { type: 'experiences', suffix: 'experience' },
  { type: 'serviceChannels', suffix: 'serviceChannel' },
  { type: 'externalCredentials', suffix: 'externalCredentials' },
  { type: 'roles', suffix: 'role' },
];

/**
 * Round-trip integrity audit: decompose then recompose and assert
 * (origFiles == rebuiltFiles && contentSetDiff == 0). This is the focused
 * net for types that carry the highest collision risk, with per-type sample
 * caps for the slow ones.
 */
export const ROUNDTRIP_PAIRS: readonly TypePair[] = [
  { type: 'quickActions', suffix: 'quickAction' },
  { type: 'customMetadata', suffix: 'md', sample: 200 },
  { type: 'pathAssistants', suffix: 'pathAssistant' },
  { type: 'omniSupervisorConfigs', suffix: 'omniSupervisorConfig' },
  { type: 'genAiPromptTemplates', suffix: 'genAiPromptTemplate' },
  { type: 'mlDomains', suffix: 'mlDomain' },
  { type: 'liveChatAgentConfigs', suffix: 'liveChatAgentConfig' },
  { type: 'liveChatButtons', suffix: 'liveChatButton' },
  { type: 'duplicateRules', suffix: 'duplicateRule' },
  { type: 'queues', suffix: 'queue' },
  { type: 'reportTypes', suffix: 'reportType', sample: 100 },
  { type: 'applications', suffix: 'app' },
  { type: 'entitlementProcesses', suffix: 'entitlementProcess' },
  { type: 'approvalProcesses', suffix: 'approvalProcess' },
  // Types added in the compound-uniqueid-expansion pass (PR #439). Keep them
  // in the round-trip net so any future change that weakens
  // `serviceChannelStatusFieldMappings` (compound `type+value`) or the
  // genAiPlugin functionName/developerName keys is caught immediately.
  { type: 'serviceChannels', suffix: 'serviceChannel' },
  { type: 'genAiPlugins', suffix: 'genAiPlugin' },
];
