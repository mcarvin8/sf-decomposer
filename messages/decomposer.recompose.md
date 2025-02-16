# summary

Recomposes the files created by the `decompose` command before deployments.

# description

Recompose the decomposed files into deployment-compatible metadata files.

You should run this before you deploy decomposed metadata to an org.

# examples

- `sf decomposer recompose -m "flow" -f "xml" --postpurge --debug`
- `sf decomposer recompose -m "flow" -m "labels" -f "xml" --postpurge --debug`
- `sf decomposer recompose -m "flow" -i "force-app"`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc.

# flags.postpurge.summary

Purge the decomposed files after recomposing them.

# flags.debug.summary

Debug to a log file.

# flags.format.summary

File format for the decomposed files.

# flags.ignore-package-directory.summary

Ignore a package directory.
