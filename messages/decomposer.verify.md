# summary

Round-trip verify that decompose followed by recompose preserves your metadata byte-for-byte.

# description

Copies your package directories into a temp directory under your OS's `tmpdir()`, runs decompose
then recompose there with the same flags and `.sfdecomposer.config.json` overrides you would use
in production, then diffs every rebuilt parent XML against the original. Comparison is
**structural** (sibling and attribute order are ignored, matching how Salesforce treats metadata).
The command never modifies your working tree.

Files where the only delta is ordering are surfaced as informational notices ("reordered") and do
not fail the run. Genuine semantic differences are reported as drift and exit non-zero, which
makes the command suitable as a CI gate before committing strategy, format, or override changes.

# examples

- `sf decomposer verify -m "permissionset" -f "xml"`
- `sf decomposer verify -m "permissionset" -m "profile" -s "grouped-by-tag" -p`
- `sf decomposer verify -x "manifest/package.xml" --config`

# flags.metadata-type.summary

The metadata suffix to verify, such as 'flow', 'labels', etc. Required unless --manifest is provided.

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

Load per-type and per-component overrides from .sfdecomposer.config.json in the repo root, the same as `decomposer decompose --config`.

# error.missingMetadataOrManifest

Either --metadata-type (-m) or --manifest (-x) must be provided.

# error.driftDetected

Round-trip verify failed: %s file(s) drifted between the original tree and the round-tripped output. See the log above for the offending paths.
