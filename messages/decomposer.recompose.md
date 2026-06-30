# summary

Recomposes the files created by the `decompose` command before deployments.

# description

Recompose the decomposed files into deployment-compatible metadata files.

You should run this before you deploy decomposed metadata to an org.

# examples

- `sf decomposer recompose -m "flow" --postpurge`
- `sf decomposer recompose -m "flow" -i "force-app"`
- `sf decomposer recompose -x "manifest/package.xml" --postpurge`
- `sf decomposer recompose -x "manifest/package.xml" -m "flow"`

# flags.metadata-type.summary

The metadata suffix to process, such as 'flow', 'labels', etc. Required unless --manifest is provided.

# flags.manifest.summary

Path to a package.xml manifest file. When provided, only the metadata listed in the manifest is recomposed. If --metadata-type is also provided, the intersection of the two is used.

# flags.postpurge.summary

Purge the decomposed files after recomposing them.

# flags.ignore-package-directory.summary

Ignore a package directory.

# flags.config.summary

Load all settings from .sfdecomposer.config.json in the repo root. When set, top-level fields (metadataSuffixes, manifest, postPurge, ignorePackageDirectories) are applied. Explicit CLI flags take precedence over config values. Makes --metadata-type and --manifest optional when either is defined in the config.

# error.missingMetadataOrManifest

Either --metadata-type (-m) or --manifest (-x) must be provided, or use --config (-c) with a config file that specifies metadataSuffixes or manifest.
