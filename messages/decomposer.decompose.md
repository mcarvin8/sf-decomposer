# summary

Decomposes the metadata files created by retrievals.

# description

This command will read all of the original metadata files and separate them into multiple XML files by elements and field names.

You should use this to create files for version control after retrieving metadata from an org.

# examples

- `sf decomposer decompose -m "flow"`

# flags.sfdx-configuration.summary

Path to your project's Salesforce DX configuration file (`sfdx-project.json`). By default, it will look for `sfdx-project.json` in the same directory you're running this plugin in.

# flags.metadata-type.summary

This flag allows users to specify a metadata type for processing, such as 'flow', 'labels', etc. The provided input should be the metadata's suffix value.

# flags.prepurge.summary

If provided, purge directories of pre-existing decomposed files.

# flags.postpurge.summary

If provided, purge the original files after decomposing them.

# flags.debug.summary

If provided, debug to log file.
