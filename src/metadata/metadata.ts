interface Metadata {
  directoryName: string;
  metaSuffix: string;
  xmlElement: string;
  fieldNames: string;
}

const jsonData: Metadata[] = [
    {
      'directoryName': 'labels',
      'metaSuffix': 'labels',
      'xmlElement': 'CustomLabels',
      'fieldNames': 'fullName'
    },
    {
      'directoryName': 'workflows',
      'metaSuffix': 'workflow',
      'xmlElement': 'Workflow',
      'fieldNames': 'fullName'
    },
    {
      'directoryName': 'profiles',
      'metaSuffix': 'profile',
      'xmlElement': 'Profile',
      'fieldNames': 'fullName,application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field,startAddress,dataCategoryGroup,layout,weekdayStart,friendlyname'
    },
    {
      'directoryName': 'permissionsets',
      'metaSuffix': 'permissionset',
      'xmlElement': 'PermissionSet',
      'fieldNames': 'fullName,application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field'
    },
    {
      'directoryName': 'matchingRules',
      'metaSuffix': 'matchingRule',
      'xmlElement': 'MatchingRules',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'assignmentRules',
      'metaSuffix': 'assignmentRules',
      'xmlElement': 'AssignmentRules',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'flows',
      'metaSuffix': 'flow',
      'xmlElement': 'Flow',
      'fieldNames': 'fullName,apexClass,name,object,field,layout,actionName,targetReference,assignToReference,choiceText,promptText'
    },
    {
      'directoryName': 'escalationRules',
      'metaSuffix': 'escalationRules',
      'xmlElement': 'EscalationRules',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'sharingRules',
      'metaSuffix': 'sharingRules',
      'xmlElement': 'SharingRules',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'autoResponseRules',
      'metaSuffix': 'autoResponseRules',
      'xmlElement': 'AutoResponseRules',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'globalValueSetTranslations',
      'metaSuffix': 'globalValueSetTranslation',
      'xmlElement': 'GlobalValueSetTranslation',
      'fieldNames': 'fullName,masterLabel'
    },
    {
      'directoryName': 'standardValueSetTranslations',
      'metaSuffix': 'standardValueSetTranslation',
      'xmlElement': 'StandardValueSetTranslation',
      'fieldNames': 'fullName,masterLabel'
    },
    {
      'directoryName': 'marketingappextensions',
      'metaSuffix': 'marketingappextension',
      'xmlElement': 'MarketingAppExtension',
      'fieldNames': 'fullName,actionName,masterLabel'
    },
    {
      'directoryName': 'translations',
      'metaSuffix': 'translation',
      'xmlElement': 'Translation',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'globalValueSets',
      'metaSuffix': 'globalValueSet',
      'xmlElement': 'GlobalValueSet',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'standardValueSets',
      'metaSuffix': 'standardValueSet',
      'xmlElement': 'StandardValueSet',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'decisionMatrixDefinition',
      'metaSuffix': 'decisionMatrixDefinition',
      'xmlElement': 'DecisionMatrixDefinition',
      'fieldNames': 'fullName,name'
    },
    {
      'directoryName': 'aiScoringModelDefinitions',
      'metaSuffix': 'aiScoringModelDefinition',
      'xmlElement': 'AIScoringModelDefinition',
      'fieldNames': 'fullName,name'
    }
];

export default jsonData;
