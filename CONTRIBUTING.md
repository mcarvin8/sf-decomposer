## Contributing

Any contributions to this repository are highly encouraged.

## Installation

1. Clone or fork this repository.
2. Install dependencies.

```
yarn
```

## Testing

When developing, run the provided end-to-end (E2E) test to confirm all supported metadata types remain functional using the set of baseline `recomposed` files.

```
yarn test
```

The `force-app/main/default` directory in this repository contains all of the baseline `recompose` files for each supported metadata type.

NOTE: The `recompose` files are not the exact same as the original metadata files. They have the same contents but will most likely have a different ordering. This plugin's XML file sorting may differ from the Salesforce CLI.

Ensure the `force-app/main/default` in this repository contains `recomposed` files created by this plugin to ensure consistent results. This directory should not contain any `decomposed` files.

The E2E test will:

1. Copy `force-app/main/default` into a temporary `mock` directory.
2. Run the `decomposer decompose` command for all metadata types in the `mock` directory.
3. Run the `decomposer recompose` command for all metadata types in the `mock` directory.
4. Compare the `recompose` files in the `mock` directory against the baselines in `force-app/main/default` (the test will ignore the `decompose` files in `mock`).

The test will fail if the decomposer commands fail or there is any differences found between the `recomposed` files in `mock` against `force-app/main/default`.

## Adding Support for Metadata Types

To add support for a metadata type, follow this process:

1. Fork or clone this repository.
2. Create a feature branch.
3. Update the `jsonData` in `src\metadata\metadata.ts` with the metadata type:

   ```typescript
   const jsonData = [
     {
       metaSuffix: 'labels',
     },
     {
       metaSuffix: 'workflow',
     },
     {
       metaSuffix: 'permissionset',
       uniqueIdElements: 'application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field',
     },
   ];
   ```

   - Reference the [Metadata API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_types_list.htm)
   - The `metaSuffix` is required for the `decomposer` argument parser
   - The `uniqueIdElements` should contain a comma separated list of unique ID elements that will be used to name decomposed files (nested elements)
     - The default unique ID element for all types is `fullName`. Only list `uniqueIdElements` if it requires others besides `fullName`.
     - Unique ID elements are only used to name decomposed files with nested elements as shown below.
       - Ex: `apexClass` is a unique ID element for permission sets and will be used to name decomposed meta files for apex permissions (`permissionsets/HR_Admin/classAccesses/Send_Email_Confirmation.classAccesses-meta.xml`).

   ```xml
   <classAccesses>
     <apexClass>Send_Email_Confirmation</apexClass>
     <enabled>true</enabled>
   </classAccesses>
   ```

   - Leaf elements will be added to the same decomposed file which matches the original meta file name (`permissionsets/HR_Admin/HR_Admin.permissionset-meta.xml`).

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <PermissionSet>
     <description>Grants all rights needed for an HR administrator to manage employees.</description>
     <label>HR Administration</label>
     <userLicense>Salesforce</userLicense>
   </PermissionSet>
   ```

4. Add the directory for the metadata type to `force-app/main/default` and include a sample file.
5. Run the `decomposer decompose` command on the new metadata type. Confirm the file is decomposed as intended.
6. Run the `decomposer recompose` command on the new metadata type. Confirm the file is recomposed as intended (sorting will be different to original file). Confirm the recomposed file can be deployed to a sandbox.
7. Once satisfied, delete the `decomposed` files from your feature branch for the metadata type.
8. Commit changes and confirm the E2E test passes locally before pushing your feature branch.
9. Open a Pull Request into `main`.
