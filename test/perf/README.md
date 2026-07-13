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
|----------|---------------|------------------------------------------------------------|
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

## Published trend dashboard

CI runs that originate from `schedule` (weekly) or `workflow_call`
(release.yml) also convert the per-run reports into the flat metric arrays
consumed by [`benchmark-action/github-action-benchmark`][bench] and push them
to the `gh-pages` branch:

- Runtime: `https://<owner>.github.io/sf-decomposer/dev/bench/runtime/`
- Memory: `https://<owner>.github.io/sf-decomposer/dev/bench/memory/`

The conversion is done by `scripts/perf-to-benchmark.mjs`, which collapses
`perf-results/*.json` into `perf-runtime.json` (`elapsedMs`) and
`perf-memory.json` (`rssDeltaBytes` in MB). Ad-hoc `workflow_dispatch` runs
intentionally do not publish unless `publish: true` is checked, since they
often vary profile/types/formats inputs and would pollute the timeline.

To enable on first run:

1. Settings -> Pages -> Source: Deploy from branch -> Branch: `gh-pages`
   (the workflow creates the branch on first publish).
2. Trigger one publish-eligible run (e.g. `gh workflow run perf.yml` from a
   release tag, or wait for the next Monday cron).

## Pull-request comparison comment

PRs that touch non-doc files run the `large` and `manyfiles` profiles as
parallel matrix jobs. Each job benchmarks the PR's base ref and then its head
ref, back to back, **on the same runner**, then posts a sticky comment (one
per profile) showing the per-bench deltas between the two
(`scripts/compare-perf-baseline.mjs`). The comment updates in place on
subsequent pushes (keyed off an HTML marker containing the profile name).

This is deliberately not a comparison against the gh-pages history: that
history comes from a different run on a different runner, possibly days old,
and swings 20-30% between otherwise-identical code (see the `alert-threshold`
comments in `perf.yml`). Benchmarking base and head back to back on one
runner removes most of that noise, so the PR comparison uses a tighter
threshold (130% runtime / 150% memory) than the gh-pages-based publish steps
(150%/200%).

Behavior:

- Runs only on PRs from branches in this repo. Fork PRs are skipped because
  `GITHUB_TOKEN` is read-only there and can't post comments.
- Concurrency-limited: a new push cancels the in-progress perf run for the
  same PR so we don't queue redundant jobs.
- Never touches `gh-pages`: base and head results are both discarded after
  the comment is posted, so the trend dashboard only ever contains data from
  the schedule/release-triggered runs.
- Does **not** fail the check on regression. The comment (and a
  `::warning::` annotation) surfaces it; reviewers decide. Tune the
  thresholds in `scripts/compare-perf-baseline.mjs` if the noise floor
  changes.
- Honors the same paths-ignore filter the workflow uses, so doc-only PRs
  skip the run entirely rather than posting a stale comment.
- Costs roughly double a single-profile run (base + head, each profile run
  serially within its matrix job) - budget ~6-8 minutes per profile instead
  of ~3-4.

[bench]: https://github.com/benchmark-action/github-action-benchmark

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
