'use strict';

export const defaultuniqueIdElements: string = 'fullName';

export function getUniqueIdElements(metaSuffix: string): string | undefined {
  // Add cases to return uniqueIdElements based on metaSuffix
  // SDR has unique ID elements for certain meta types, but does not have these cases below
  switch (metaSuffix) {
    case 'profile':
      return 'application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field,startAddress,dataCategoryGroup,layout,weekdayStart,friendlyname';
    case 'permissionset':
      return 'application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field';
    case 'matchingRule':
      return 'name';
    case 'assignmentRules':
      return 'name';
    case 'flow':
      return 'apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText';
    case 'escalationRules':
      return 'name';
    case 'sharingRules':
      return 'name';
    case 'autoResponseRules':
      return 'name';
    case 'globalValueSetTranslation':
      return 'masterLabel';
    case 'standardValueSetTranslation':
      return 'masterLabel';
    case 'translation':
      return 'name';
    case 'globalValueSet':
      return 'name';
    case 'standardValueSet':
      return 'name';
    case 'decisionMatrixDefinition':
      return 'name';
    case 'aiScoringModelDefinition':
      return 'name';
    case 'botVersion':
      return 'name,developerName,stepIdentifier,invocationActionName,parameterName,nlpProviderType,dialog';
    case 'bot':
      return 'name,developerName,stepIdentifier,invocationActionName,parameterName,nlpProviderType,dialog,chatButtonName';
    case 'marketingappextension':
      return 'apiName';
    default:
      return undefined;
  }
}
