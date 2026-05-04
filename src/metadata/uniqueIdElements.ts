export default [
  {
    profile: {
      uniqueIdElements: [
        'application',
        'apexClass',
        'externalDataSource',
        'flow',
        'object',
        'apexPage',
        'recordType',
        'tab',
        'field',
        'startAddress',
        'dataCategoryGroup',
        'layout',
        'weekdayStart',
        'friendlyname',
        'agentName',
      ],
    },
    permissionset: {
      uniqueIdElements: [
        'application',
        'apexClass',
        'externalDataSource',
        'flow',
        'object',
        'apexPage',
        'recordType',
        'tab',
        'field',
        'agentName',
        'externalCredentialPrincipal',
        'servicePresenceStatus',
      ],
    },
    flow: {
      uniqueIdElements: [
        'apexClass',
        'object',
        'field',
        'layout',
        'actionName',
        'targetReference',
        'assignToReference',
        'choiceText',
        'promptText',
      ],
    },
    globalValueSetTranslation: {
      uniqueIdElements: ['masterLabel'],
    },
    standardValueSetTranslation: {
      uniqueIdElements: ['masterLabel'],
    },
    bot: {
      uniqueIdElements: [
        'developerName',
        'stepIdentifier',
        'invocationActionName',
        'parameterName',
        'nlpProviderType',
        'dialog',
        'chatButtonName',
      ],
    },
    marketingappextension: {
      uniqueIdElements: ['apiName'],
    },
    loyaltyProgramSetup: {
      uniqueIdElements: ['processName'],
    },
    entitlementProcess: {
      // `<milestones>` items have no `<fullName>`/`<name>`; the canonical key
      // is `<milestoneName>`. Without this, every milestone shard falls back
      // to a SHA-256 hash filename.
      uniqueIdElements: ['milestoneName'],
    },
    approvalProcess: {
      // `<approvalStep>` already keys off `<name>` via the default list, but
      // `<allowedSubmitters>` items only carry `<type>` (e.g. `creator`,
      // `owner`, `queue`). Multiple submitters with the same `<type>` in one
      // process will collide and fall back to SHA-256, which is acceptable
      // (and rare in practice) compared to *every* allowedSubmitters shard
      // hashing today.
      uniqueIdElements: ['type'],
    },
    quickAction: {
      // `<fieldOverrides>` and `<quickActionLayoutItems>` both key off
      // `<field>`. Singleton wrappers like `<quickActionLayout>` and
      // `<quickActionSendEmailOptions>` still hash (one stable hash per
      // parent), which is correct and intentional.
      uniqueIdElements: ['field'],
    },
    md: {
      // `<values>` items inside a `<CustomMetadata>` record are keyed by
      // `<field>`. Each customMetadata file holds 1..N values for distinct
      // fields, so `<field>` is unique per shard.
      uniqueIdElements: ['field'],
    },
    pathAssistant: {
      // `<pathAssistantSteps>` items use `<picklistValueName>` (a stage
      // value like "Planning", "Pre-Live Review") as their natural key.
      uniqueIdElements: ['picklistValueName'],
    },
    omniSupervisorConfig: {
      // Six sibling repeating elements: `<omniSupervisorConfigUser>` /
      // `<...Group>` / `<...Queue>` / `<...Profile>` / `<...Skill>` /
      // `<...Action>`. Each item carries exactly one of these inner-name
      // fields, and `find_id_in_subtree` picks whichever one is present.
      uniqueIdElements: ['user', 'group', 'queue', 'profile', 'skill', 'actionName'],
    },
    genAiPromptTemplate: {
      // `<templateVersions>` items carry a unique `<versionIdentifier>` per
      // version. The trailing `_<n>` makes it filesystem-safe.
      uniqueIdElements: ['versionIdentifier'],
    },
    mlDomain: {
      // `<mlIntents>` items use `<developerName>` as their canonical key.
      uniqueIdElements: ['developerName'],
    },
    liveChatAgentConfig: {
      // `<transferableButtons>` items carry `<button>`, `<supervisorSkills>`
      // items carry `<skill>`. `<assignments>` items wrap heterogeneous
      // user/group payloads with no single keyable field, so they continue
      // to hash (stable per content).
      uniqueIdElements: ['button', 'skill'],
    },
    liveChatButton: {
      // `<skills>` items use `<skill>`; `<deployments>` items use
      // `<deployment>`.
      uniqueIdElements: ['skill', 'deployment'],
    },
    duplicateRule: {
      // `<duplicateRuleMatchRules>` items carry `<matchingRule>`. Each
      // match rule appears once per duplicate rule, so the field is unique
      // within the parent.
      uniqueIdElements: ['matchingRule'],
    },
    queue: {
      // `<queueSobject>` items are keyed by `<sobjectType>` (e.g. `Case`,
      // `Lead`). Each sobject appears at most once per queue.
      uniqueIdElements: ['sobjectType'],
    },
    reportType: {
      // `<sections>` items use `<masterLabel>` as their natural key. Same
      // pattern as `globalValueSetTranslation`/`standardValueSetTranslation`.
      uniqueIdElements: ['masterLabel'],
    },
    app: {
      // CustomApplication's `<profileActionOverrides>` and `<actionOverrides>`
      // have a *compound* natural unique key: any single field (e.g. just
      // `<actionName>`) collides for hundreds of siblings sharing
      // `<actionName>View</actionName>`, silently merging on disassembly.
      // Compound keys (config-disassembler >= 0.4.5) join the resolved values
      // with `__` to form a stable, readable, collision-free filename.
      //
      // Fallback chain, widest first:
      //   1. profileActionOverrides with recordType
      //   2. profileActionOverrides without recordType
      //   3. actionOverrides with recordType (no profile)
      //   4. actionOverrides without recordType (no profile)
      // Items missing `pageOrSobjectType` or `formFactor` (very rare) fall
      // through to the SHA-256 outer-element hash, which is correct since
      // we can't safely name them without those keys.
      uniqueIdElements: [
        'actionName+pageOrSobjectType+formFactor+profile+recordType',
        'actionName+pageOrSobjectType+formFactor+profile',
        'actionName+pageOrSobjectType+formFactor+recordType',
        'actionName+pageOrSobjectType+formFactor',
      ],
    },
    mutingpermissionset: {
      uniqueIdElements: [
        'application',
        'apexClass',
        'externalDataSource',
        'flow',
        'object',
        'apexPage',
        'recordType',
        'tab',
        'field',
        'agentName',
        'externalCredentialPrincipal',
        'servicePresenceStatus',
      ],
    },
  },
];
