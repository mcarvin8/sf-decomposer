# summary

Decomposes the metadata files created by retrievals.

# description

This command will read all of the original metadata files and separate them into smaller files.

These smaller decomposed files can be XMLs, YAMLs, or JSONs.

You should use this to create files for version control after retrieving metadata from an org.

# examples

- `sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc.

# flags.prepurge.summary

If provided, purge directories of pre-existing decomposed files.

# flags.postpurge.summary

If provided, purge the original files after decomposing them.

# flags.debug.summary

If provided, debug to log file.

# flags.format.summary

File format for the decomposed files.
