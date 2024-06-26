# summary

Recomposes the files created by the `decompose` command prior to deployments.

# description

This command will read all of the decomposed files and recreate deployment compatible metadata files in each package directory.

You should run this before you deploy the metadata to an org.

# examples

- `sf decomposer recompose -m "flow" -f "xml" --postpurge --debug`
- `sf decomposer recompose -m "flow" -m "labels" -f "xml" --postpurge --debug`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc. You can provide this flag multiple times to process multiple metadata types at once.

# flags.postpurge.summary

If provided, purge the decomposed files after recomposing them.

# flags.debug.summary

If provided, debug to log file.

# flags.format.summary

File format for the decomposed files.
