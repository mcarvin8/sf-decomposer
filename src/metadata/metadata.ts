'use strict';

import { RegistryAccess } from '@salesforce/source-deploy-retrieve';

// Create an instance of RegistryAccess
const registryAccess = new RegistryAccess();

let defaultuniqueIdElements: string = 'fullName';

const jsonData = [
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
];

// Iterate over jsonData and call getTypeBySuffix for each metaSuffix
jsonData.forEach((entry) => {
  const { metaSuffix, uniqueIdElements } = entry;
  const metadataType = registryAccess.getTypeBySuffix(metaSuffix);

  // Handle the result
  if (metadataType) {
    // console.log(`Metadata Type Name for suffix '${metaSuffix}': ${metadataType.fullName}`);
    if (uniqueIdElements) {
      // Append additional field names to the defaultuniqueIdElements string
      defaultuniqueIdElements += `,${uniqueIdElements}`;
      // console.log(`Field Names: ${uniqueIdElements}`);
    }
  } else {
    // console.error(`No metadata type found for suffix: ${metaSuffix}`);
  }
});

export { jsonData, defaultuniqueIdElements };
