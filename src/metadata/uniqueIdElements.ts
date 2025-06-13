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
  },
];
