# summary

Recomposes the files created by the `decompose` command before deployments.

# description

This command will read the decomposed files and recreate deployment-compatible metadata files in each package directory.

You should run this before you deploy decomposed metadata to an org.

# examples

- `sf decomposer recompose -m "flow" -f "xml" --postpurge --debug`
- `sf decomposer recompose -m "flow" -m "labels" -f "xml" --postpurge --debug`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc. You can provide this flag multiple times to process multiple metadata types with a single command.

# flags.postpurge.summary

If provided, purge the decomposed files after recomposing them.

# flags.debug.summary

If provided, debug to a log file.

# flags.format.summary

File format for the decomposed files.
