'use strict';

export const defaultuniqueIdElements: string = 'fullName';

export const jsonData = [
  {
    metaSuffix: 'labels',
  },
  {
    metaSuffix: 'workflow',
  },
  {
    metaSuffix: 'profile',
    uniqueIdElements:
      'application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field,startAddress,dataCategoryGroup,layout,weekdayStart,friendlyname',
  },
  {
    metaSuffix: 'permissionset',
    uniqueIdElements: 'application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field',
  },
  {
    metaSuffix: 'matchingRule',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'assignmentRules',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'flow',
    uniqueIdElements:
      'apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText',
  },
  {
    metaSuffix: 'escalationRules',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'sharingRules',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'autoResponseRules',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'globalValueSetTranslation',
    uniqueIdElements: 'masterLabel',
  },
  {
    metaSuffix: 'standardValueSetTranslation',
    uniqueIdElements: 'masterLabel',
  },
  {
    metaSuffix: 'translation',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'globalValueSet',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'standardValueSet',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'decisionMatrixDefinition',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'aiScoringModelDefinition',
    uniqueIdElements: 'name',
  },
  {
    metaSuffix: 'botVersion',
    uniqueIdElements: 'name,developerName,stepIdentifier,invocationActionName,parameterName,nlpProviderType,dialog',
  },
  {
    metaSuffix: 'bot',
    uniqueIdElements:
      'name,developerName,stepIdentifier,invocationActionName,parameterName,nlpProviderType,dialog,chatButtonName',
  },
  {
    metaSuffix: 'marketingappextension',
    uniqueIdElements: 'apiName',
  },
];
