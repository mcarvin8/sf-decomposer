# summary

Decomposes the metadata files created by retrievals.

# description

Decompose large metadata files into smaller files.

You should run this after you retrieve metadata from an org.

# examples

- `sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge`
- `sf decomposer decompose -m "flow" -m "labels" -f "xml" --prepurge --postpurge`
- `sf decomposer decompose -m "flow" -f "xml" -i "force-app"`
- `sf decomposer decompose -x "manifest/package.xml" --postpurge`
- `sf decomposer decompose -x "manifest/package.xml" -m "flow"`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc. Required unless --manifest is provided.

# flags.manifest.summary

Path to a package.xml manifest file. When provided, only the metadata listed in the manifest is decomposed. If --metadata-type is also provided, the intersection of the two is used.

# flags.prepurge.summary

Purge directories of pre-existing decomposed files.

# flags.postpurge.summary

Purge the original files after decomposing them.

# flags.format.summary

File format for the decomposed files.

# flags.ignore-package-directory.summary

Ignore a package directory.

# flags.strategy.summary

Strategy to follow when decomposing files.

# flags.decompose-nested-permissions.summary

Additionally decompose object and field permissions on a permission set when strategy is set to "grouped-by-tag".

# error.missingMetadataOrManifest

Either --metadata-type (-m) or --manifest (-x) must be provided.
