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
