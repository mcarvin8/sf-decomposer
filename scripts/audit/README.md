# sf-decomposer audit harness

Three Node.js scripts that catch silent decompose / recompose bugs by exercising
the local CLI against real Salesforce metadata. They were originally written
as one-off PowerShell scripts during the Phase-1 / Phase-2 audit that drove
PR #430, #432, and #433; this is the portable, dependency-free Node port so
anyone can run them on macOS / Linux / CI without a PowerShell host.

The harness is **not** part of the published plugin — it lives under
`scripts/audit/` and is invoked via `npm run audit*`. None of these scripts
mutate the source archive; everything happens in a per-type workspace under
`<os.tmpdir()>/sfd-audit/`.

## Indicators each script reports

| Indicator                            | What it catches                                                                                                                            |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `origFiles != rebuiltFiles`          | A whole metadata file was lost on round-trip (severe).                                                                                     |
| `contentSetDiff > 0`                 | Per-file `<name>` multiset differs between original and rebuilt — a uniqueIdElements collision dropped child elements.                     |
| `parentOnlyDirs > 0`                 | A dotted-fullName type produced parent-only output dirs — the merge bug fixed by config-disassembler 0.4.4.                                |
| `hashFiles > 0`                      | One or more shards fell back to SHA-256 hash filenames — a uniqueIdElements coverage opportunity (correctness is fine, readability isn't). |
| `exitDecompose / exitRecompose != 0` | The CLI logged hard errors. Non-zero alone is not always a bug (leaf-only files are skipped at ERROR-level), but should be inspected.      |

## Scripts

### `npm run audit` — single-type focused audit

Drives one (type, suffix) pair end-to-end. Useful for iterating on a new
`uniqueIdElements` entry against a known-good archive.

```bash
npm run audit -- \
  --type quickActions \
  --suffix quickAction \
  --source-root /path/to/force-app/main/default \
  --sample 50
```

Exits `2` if `contentSetDiff > 0` or `parentOnlyDirs > 0`, otherwise `0`.

### `npm run audit:sweep` — broad decompose-only sweep

Iterates over a curated list of metadata types (see `type-pairs.ts`), runs
decompose-only with a per-type sample cap, and ranks types by hash-filename
count. Used to surface uniqueIdElements coverage opportunities across the
whole archive.

```bash
npm run audit:sweep -- \
  --source-root /path/to/force-app/main/default \
  --sample 30
```

### `npm run audit:roundtrip` — multi-type round-trip integrity

Iterates a focused list of high-risk types and runs the full decompose +
recompose pair, asserting `origFiles == rebuiltFiles` and `contentSetDiff == 0`.
Exits `2` when any type shows data loss, so this can gate CI against a real
metadata archive.

```bash
npm run audit:roundtrip -- \
  --source-root /path/to/force-app/main/default
```

## Adjusting the type lists

The two curated lists live in `scripts/audit/type-pairs.ts`:

- `SWEEP_PAIRS` — broad coverage for hash-filename surveys.
- `ROUNDTRIP_PAIRS` — focused list for round-trip integrity, with per-type
  sample caps for the slow ones (`customMetadata`, `reportTypes`).

Add or remove rows directly. The directory name is what Salesforce CLI emits
into `force-app/main/default/`, and the suffix is what `decomposer (de|re)compose -m`
expects (matches `MetadataResolver` in `source-deploy-retrieve`).

## Implementation notes

- Pure Node builtins (no extra deps). Same `node --import ts-node/esm` runner
  pattern as `scripts/gen-perf-fixtures.ts`.
- Each run stages files into `<tmp>/sfd-audit/<type>/`. The harness wipes that
  dir on every invocation; pass `--work-root` to relocate.
- The CLI subprocess inherits the parent env minus `NODE_OPTIONS` so the
  ts-node loader doesn't leak into the spawned `bin/run.js`.
- The `<name>`-multiset comparison is intentionally weaker than a byte
  comparison: XML round-tripping legitimately reorders elements and adjusts
  trailing whitespace. For byte-level guarantees see `test/perf/decompose.perf.ts`,
  which checks `recomposed.bytes >= 0.99 * original.bytes`.
