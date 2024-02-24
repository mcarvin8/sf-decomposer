# summary

Decomposes the original metadata files created by retrievals.

# description

This command will read all of the original metadata files and separate them into multiple XML files by elements and field names.

You should use this to create files for version control after retrieving metadata from an org.

# examples

- `sf decomposer decompose -m "flow"`

# flags.dx-directory.summary

Directory containing Salesforce metadata (default: `force-app/main/default`).

# flags.metadata-type.summary

This flag allows users to specify a metadata type for processing, such as 'flow', 'labels', etc. The provided input should be the metadata's suffix value.

# flags.purge.summary

If provided, purge directories of pre-existing decomposed files.

# flags.debug.summary

If provided, debug to log file.
