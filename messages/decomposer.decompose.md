# summary

Decomposes the metadata files created by retrievals.

# description

Decompose large metadata files into smaller files.

You should run this after you retrieve metadata from an org.

# examples

- `sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug`
- `sf decomposer decompose -m "flow" -m "labels" -f "xml" --prepurge --postpurge --debug`
- `sf decomposer decompose -m "flow" -f "xml" -i "force-app"`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc.

# flags.prepurge.summary

Purge directories of pre-existing decomposed files.

# flags.postpurge.summary

Purge the original files after decomposing them.

# flags.debug.summary

Debug to a log file.

# flags.format.summary

File format for the decomposed files.

# flags.ignore-package-directory.summary

Ignore a package directory.

# flags.strategy.summary

Strategy to follow when decomposing files.
