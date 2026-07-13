export default [
  {
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
    approvalProcess: {
      // `<approvalStep>` already keys off `<name>` via the default list, but
      // `<allowedSubmitters>` items only carry `<type>` (e.g. `creator`,
      // `owner`, `queue`). Multiple submitters with the same `<type>` in one
      // process will collide and fall back to SHA-256, which is acceptable
      // (and rare in practice) compared to *every* allowedSubmitters shard
      // hashing today.
      uniqueIdElements: ['type'],
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
    duplicateRule: {
      // `<duplicateRuleMatchRules>` items carry `<matchingRule>`. Each
      // match rule appears once per duplicate rule, so the field is unique
      // within the parent.
      uniqueIdElements: ['matchingRule'],
    },
    entitlementProcess: {
      // `<milestones>` items have no `<fullName>`/`<name>`; the canonical key
      // is `<milestoneName>`. Without this, every milestone shard falls back
      // to a SHA-256 hash filename.
      uniqueIdElements: ['milestoneName'],
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
    genAiPlugin: {
      // `<genAiFunctions>` items are keyed by `<functionName>`;
      // `<genAiPluginInstructions>` items by `<developerName>`. Each
      // repeating child only carries one of these fields, so first-match
      // wins picks the right one without a compound.
      uniqueIdElements: ['functionName', 'developerName'],
    },
    genAiPromptTemplate: {
      // `<templateVersions>` items carry a unique `<versionIdentifier>` per
      // version. The trailing `_<n>` makes it filesystem-safe.
      uniqueIdElements: ['versionIdentifier'],
    },
    globalValueSetTranslation: {
      uniqueIdElements: ['masterLabel'],
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
    loyaltyProgramSetup: {
      uniqueIdElements: ['processName'],
    },
    marketingappextension: {
      uniqueIdElements: ['apiName'],
    },
    md: {
      // `<values>` items inside a `<CustomMetadata>` record are keyed by
      // `<field>`. Each customMetadata file holds 1..N values for distinct
      // fields, so `<field>` is unique per shard.
      uniqueIdElements: ['field'],
    },
    mlDomain: {
      // `<mlIntents>` items use `<developerName>` as their canonical key.
      uniqueIdElements: ['developerName'],
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
    omniSupervisorConfig: {
      // Six sibling repeating elements: `<omniSupervisorConfigUser>` /
      // `<...Group>` / `<...Queue>` / `<...Profile>` / `<...Skill>` /
      // `<...Action>`. Each item carries exactly one of these inner-name
      // fields, and `find_id_in_subtree` picks whichever one is present.
      uniqueIdElements: ['user', 'group', 'queue', 'profile', 'skill', 'actionName'],
    },
    pathAssistant: {
      // `<pathAssistantSteps>` items use `<picklistValueName>` (a stage
      // value like "Planning", "Pre-Live Review") as their natural key.
      uniqueIdElements: ['picklistValueName'],
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
    profile: {
      // `<profileActionOverrides>` (API v37-44, deprecated but still present in
      // legacy orgs) has the same compound natural key problem as
      // CustomApplication's `<profileActionOverrides>`/`<actionOverrides>`
      // (see `app` above): a single field like `<actionName>` collides for
      // every sibling sharing `actionName>view</actionName>`. Compound keys
      // join resolved values with `__` for a stable, collision-free filename.
      //
      // Fallback chain, widest first:
      //   1. actionName+pageOrSobjectType+formFactor+recordType
      //   2. actionName+pageOrSobjectType+formFactor
      // Items missing `pageOrSobjectType` or `formFactor` fall through to the
      // SHA-256 outer-element hash, which is correct since we can't safely
      // name them without those keys.
      uniqueIdElements: [
        'actionName+pageOrSobjectType+formFactor+recordType',
        'actionName+pageOrSobjectType+formFactor',
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
        'servicePresenceStatus',
        'configName',
      ],
    },
    queue: {
      // `<queueSobject>` items are keyed by `<sobjectType>` (e.g. `Case`,
      // `Lead`). Each sobject appears at most once per queue.
      uniqueIdElements: ['sobjectType'],
    },
    quickAction: {
      // `<fieldOverrides>` and `<quickActionLayoutItems>` both key off
      // `<field>`. Singleton wrappers like `<quickActionLayout>` and
      // `<quickActionSendEmailOptions>` still hash (one stable hash per
      // parent), which is correct and intentional.
      uniqueIdElements: ['field'],
    },
    recordType: {
      // `<picklistValues>` items are keyed by `<picklist>` (the API name of the
      // picklist field, e.g. `IASubtheme__c`). Each picklist appears at most
      // once per record type, so the field is unique within the parent.
      uniqueIdElements: ['picklist'],
    },
    reportType: {
      // `<sections>` items use `<masterLabel>` as their natural key — same
      // pattern as `globalValueSetTranslation`/`standardValueSetTranslation`.
      // The singleton `<join>` element is keyed by `<relationship>` purely for
      // readability: without it every reportType that joins a child object
      // produces a hash-named shard.
      uniqueIdElements: ['masterLabel', 'relationship'],
    },
    serviceChannel: {
      // Each `<serviceChannelStatusFieldMappings>` row carries `<type>` (a
      // status category like `COMPLETED` / `IN_PROGRESS`) and `<value>` (the
      // human-readable status name). `<type>` collides massively (most rows
      // are `COMPLETED`) and `<value>` alone is usually unique within a
      // channel, but we observed status names repeated across distinct types
      // in production data — the compound `type+value` is the only fully
      // stable id, with `value` as a single-field fallback for any row that
      // happens to lack `<type>`.
      uniqueIdElements: ['type+value', 'value'],
    },
    standardValueSetTranslation: {
      uniqueIdElements: ['masterLabel'],
    },
  },
];
