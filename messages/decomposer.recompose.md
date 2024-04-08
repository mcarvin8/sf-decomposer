# summary

Recomposes the files created by the `decompose` command.

# description

This command will read all of the decomposed files and recreate deployment compatible metadata files in each package directory.

You should run this before you deploy the metadata to an org.

# examples

- `sf decomposer recompose -m "flow"`

# flags.sfdx-configuration.summary

Path to your project's Salesforce DX configuration file (`sfdx-project.json`). By default, it will look for `sfdx-project.json` in the same directory you're running this plugin in.

# flags.metadata-type.summary

This flag allows users to specify a metadata type for processing, such as 'flow', 'labels', etc. The provided input should be the metadata's suffix value.

# flags.postpurge.summary

If provided, purge the decomposed files after recomposing them.

# flags.debug.summary

If provided, debug to log file.
