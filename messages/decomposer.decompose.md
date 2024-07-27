# summary

Decomposes the metadata files created by retrievals.

# description

This command will read the original metadata files and decompose them into smaller files. The decomposed file format can be XML, YAML, or JSON.

You should run this after you retrieve metadata from an org and before you commit the metadata to your git repository.

# examples

- `sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug`
- `sf decomposer decompose -m "flow" -m "labels" -f "xml" --prepurge --postpurge --debug`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc. You can provide this flag multiple times to process multiple metadata types with a single command.

# flags.prepurge.summary

If provided, purge directories of pre-existing decomposed files.

# flags.postpurge.summary

If provided, purge the original files after decomposing them.

# flags.debug.summary

If provided, debug to a log file.

# flags.format.summary

File format for the decomposed files.
