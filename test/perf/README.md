# Performance tests

Heavy, slow round-trip tests against synthetic fixtures sized like real,
long-lived Salesforce orgs. Deliberately separated from `npm test` (unit) and
`npm run test:nuts` (non-unit) so:

- they don't bloat regular CI runtime,
- they don't influence coverage thresholds,
- their fixtures stay out of the published npm tarball.

## Running

```bash
npm run test:perf                            # large profile, all four formats, default types
PERF_PROFILE=medium npm run test:perf
PERF_FORMATS=xml,json npm run test:perf
PERF_PROFILE=xlarge PERF_FORMATS=xml npm run test:perf
PERF_TYPES=permissionset,profile npm run test:perf   # only time these two types
```

### Type selection

The default type list covers every shape the generator produces:

```
permissionset, mutingpermissionset, profile, flow, workflow, labels, bot,
app, globalValueSet
```

These all round-trip faithfully: types with `uniqueIdElements` configured in
`src/metadata/uniqueIdElements.ts` use those fields, and types without (or
sub-elements like `CustomApplication.actionOverrides` /
`profileActionOverrides` that have neither `<fullName>` nor `<name>`) fall back
to a SHA-256 hash of the full outer element. Since `config-disassembler@1.1.2`
that hash is computed over the entire element rather than the first text-leaf
child, so distinct siblings get distinct shards and no data is lost.

Override the list with `PERF_TYPES=permissionset,profile` to time a subset.

Profiles:

| Profile  | Fixture total | Notes                                                      |
| -------- | ------------- | ---------------------------------------------------------- |
| `small`  | ~1 MB         | sanity check; finishes in seconds                          |
| `medium` | ~10 MB        | local dev iteration                                        |
| `large`  | ~30 MB        | default; calibrated to mimic a 10+ year-old enterprise org |
| `xlarge` | ~80 MB        | stress test; can take many minutes                         |

## What the test asserts

For each format (`xml`, `json`, `json5`, `yaml`):

1. Decompose the synthetic fixture (timed).
2. Recompose it back to deployment-ready XML (timed).
3. **Non-shrinkage:** every recomposed `-meta.xml` retains at least 99% of
   the original generator-emitted bytes. Catches mass element-collapse
   regressions (e.g. the `actionOverrides` SHA-256 hash collision bug fixed
   in `config-disassembler@0.4.3`) that would otherwise still pass step 4.
4. Decompose again, recompose again (timed).
5. **Idempotence:** the bytes after the second round-trip must match the
   bytes after the first round-trip exactly.

The first round-trip may reorder elements relative to the generator's raw
output (the decomposer owns sort order) and may differ by a few bytes from
trailing-newline normalization, hence the 99% threshold rather than 100%.
The second round-trip must be byte-identical to the first; that's the
canonical-form regression guard.

## Output

Each test writes a JSON report to
`perf-results/<timestamp>-<profile>-<format>.json`:

```json
{
  "timestamp": "2026-05-01T12:34:56.789Z",
  "node": "v20.11.1",
  "platform": "win32",
  "arch": "x64",
  "profile": "large",
  "format": "xml",
  "fixtureBytes": 31457280,
  "fixtureFiles": 9,
  "samples": [
    { "label": "xml.decompose.pass1", "elapsedMs": 12345.6, "rssDeltaBytes": 1048576, ... },
    ...
  ]
}
```

These files are gitignored. Plot them, diff them between branches, or commit
them to a separate repo to track perf trends over time.

## Generating fixtures standalone

```bash
npm run test:perf:gen                              # large profile -> perf-fixtures/
npm run test:perf:gen -- --profile xlarge --out tmp/perf
```

## Why synthetic fixtures?

Real customer metadata leaks competitive intelligence even when it looks
innocuous: custom object names, field naming conventions, app structure, label
inventories, and integration patterns all reveal architecture. The generator
in `scripts/gen-perf-fixtures.ts` produces files with the _same shape and
scale_ as those large orgs but populated with deterministic counter-based
identifiers (`Sample_Object_001__c`, `Sample_Field_000001__c`, etc.) so:

- nothing proprietary ever reaches the repo,
- byte-for-byte reproducible runs across machines,
- contributors can run perf tests without a Salesforce org.
