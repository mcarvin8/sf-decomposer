# sfdx-decomposer

[![NPM](https://img.shields.io/npm/v/sfdx-decomposer.svg?label=sfdx-decomposer)](https://www.npmjs.com/package/sfdx-decomposer) [![Downloads/week](https://img.shields.io/npm/dw/sfdx-decomposer.svg)](https://npmjs.org/package/sfdx-decomposer) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/sfdx-decomposer/main/LICENSE.txt)

IN-DEVELOPMENT: Converting the Python project (https://github.com/mcarvin8/sfdx-decomposer) into a SFDX plugin.

## Using the template

This repository provides a template for creating a plugin for the Salesforce CLI. To convert this template to a working plugin:

1. Please get in touch with the Platform CLI team. We want to help you develop your plugin.
2. Generate your plugin:

   ```
   sf plugins install dev
   sf dev generate plugin

   git init -b main
   git add . && git commit -m "chore: initial commit"
   ```

3. Create your plugin's repo in the salesforcecli github org
4. When you're ready, replace the contents of this README with the information you want.

### Hooks

For cross clouds commands, e.g. `sf env list`, we utilize [oclif hooks](https://oclif.io/docs/hooks) to get the relevant information from installed plugins.

This plugin includes sample hooks in the [src/hooks directory](src/hooks). You'll just need to add the appropriate logic. You can also delete any of the hooks if they aren't required for your plugin.

# Everything past here is only a suggestion as to what should be in your specific plugin's description

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sf plugins install sfdx-decomposer@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

## Commands

`sfdx-decomposer` supports 2 commands:
    - sf decomposer decompose
    - sf decomposer compose

The same arguments are used for both commands.

## `sf decomposer decompose`

Decomposes the original metadata files into smaller files for version control. Excluding custom labels, the smaller files will be placed into new sub-directories:
    - {metadata}

```
USAGE
  $ sf decomposer decompose -t <value> -d <value> [--json]

FLAGS
  -n, --metadata-type=<value> The type of metadata to decompose.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the original metadata files and separate them into multiple XML files by elements and field names.

  You should use this to create files for version control after retrieving metadata from an org.

EXAMPLES
  Decompose all flows:

    $ sf decomposer decompose -t "flow"
```

## `sf decomposer compose`

Reads all of the files created by the decompoose command and re-creates the original meta files suitable for CLI deployments.

```
USAGE
  $ sf decomposer compose -t <value> -d <value> [--json]

FLAGS
  -n, --metadata-type=<value> The type of metadata to compose.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the decomposed files and re-create the original meta files in the original locations.

  You should use this to compile files before you deploy the metadata to your org.

EXAMPLES
  Compose all flows:

    $ sf decomposer compose -t "flow"
```