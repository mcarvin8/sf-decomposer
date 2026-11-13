# summary

Round-trip verify that decompose followed by recompose preserves your metadata byte-for-byte.

# description

For every parent metadata XML file belonging to the requested metadata types, disassembles and
reassembles it in an isolated temp directory using the same flags and `.sfdecomposer.config.json`
overrides you would use in production, then compares the reconstructed XML against the original.
Comparison is **structural**: content must match, and element-order differences are reported
separately. The command never modifies your working tree.

Repeated sibling elements keep their original order through a round trip (recorded in
`.element_order.json`), so files normally come back byte-identical. Files whose only delta is
element order are surfaced as informational notices ("reordered") and do not fail the run. This
happens when the order can't be recorded, for example different tags interleaved (`<a>`, `<b>`,
`<a>`) or a grouped-by-tag `group` rule. Some metadata depends on order (picklist values,
page-layout sections, approval steps), so review reordered files before committing. Genuine
semantic differences are reported as drift and exit non-zero, which makes the command suitable as
a CI gate before committing strategy, format, or override changes.

# examples

- `sf decomposer verify -m "permissionset" -f "xml"`
- `sf decomposer verify -m "permissionset" -m "profile" -s "grouped-by-tag" -p`
- `sf decomposer verify -x "manifest/package.xml" --config`

# flags.metadata-type.summary

The metadata suffix to verify, such as 'flow', 'labels', etc., or an exact type name such as 'CustomSite' for a type whose suffix is shared with another type. Required unless --manifest is provided.

# flags.manifest.summary

Path to a package.xml manifest file. When provided, only the metadata listed in the manifest is verified. If --metadata-type is also provided, the intersection of the two is used.

# flags.format.summary

File format to decompose into for the round-trip check.

# flags.ignore-package-directory.summary

Ignore a package directory.

# flags.strategy.summary

Strategy to follow when decomposing files for the round-trip check.

# flags.decompose-nested-permissions.summary

Additionally decompose object and field permissions on a permission set when strategy is set to "grouped-by-tag".

# flags.config.summary

Load all settings from .sfdecomposer.config.json in the repo root. When set, all top-level fields (metadataSuffixes, manifest, decomposedFormat, strategy, ignorePackageDirectories, decomposeNestedPermissions) and the "overrides" array are applied. Explicit CLI flags take precedence over config values. Makes --metadata-type and --manifest optional when either is defined in the config.

# error.missingMetadataOrManifest

Either --metadata-type (-m) or --manifest (-x) must be provided, or use --config (-c) with a config file that specifies metadataSuffixes or manifest.

# error.driftDetected

Round-trip verify failed: %s file(s) drifted between the original tree and the round-tripped output. See the log above for the offending paths.
