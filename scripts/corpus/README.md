# sf-decomposer corpus harness

Checks that decompose followed by recompose gives back **the same bytes** on real public
Salesforce DX projects. `sf decomposer verify` and `scripts/audit/` compare structure. This
harness compares SHA-256 hashes of every file in the project.

Not part of the published plugin. Runs weekly in CI (`.github/workflows/corpus.yml`).

## Run it

```bash
npm run build            # bin/run.js loads lib/, so build first
npm run corpus           # every corpus repo, both strategies, xml
npm run corpus -- --repos dreamhouse-lwc --types permissionset,flow --formats all --nested-perms
```

| Option                | Default                                    |
| --------------------- | ------------------------------------------ |
| `--corpus <path>`     | `scripts/corpus/corpus.json`               |
| `--repos <a,b>`       | all corpus entries                         |
| `--types <a,b>`       | every supported type found in the repo     |
| `--strategies <a,b>`  | `unique-id,grouped-by-tag`                 |
| `--formats <a,b/all>` | `xml`                                      |
| `--nested-perms`      | off (adds a `-p` cell for permissionset)   |
| `--strict`            | off (fail formatting-only differences too) |
| `--work-root <path>`  | `<tmp>/sfd-corpus`                         |
| `--out <path>`        | `<work-root>/reports/<timestamp>`          |

Statuses: **PASS** (byte-equal), **FORMAT** (only `tag-whitespace`/`whitespace` differ; passes unless `--strict`), **REORDER** (a `--nested-perms` cell where only permission order, plus any formatting, differs: `-p` sorts object and field permissions by design; passes unless `--strict`), **SKIPPED** (nothing decomposed), **FAIL**, **ERROR**. Exit code: `0` when there's no FAIL or ERROR, `2` otherwise, `1` on a harness error.

## How each cell works

For each repo, each supported type found in its package directories (child types, CustomObject,
unsupported adapters and folder types are left out, as sf-decomposer rejects them), and each
strategy/format:

1. Reset the clone to its pinned commit (`git reset --hard` and `git clean -fdx`).
2. `decompose -m <type> -s <strategy> -f <format> --postpurge`.
3. Originals still present after the purge were left alone by the disassembler. Each is recorded
   with the reason it logged: `only has leaf elements`, `has no child elements`, or
   `has comments between elements` (comments it can't keep in place). If none were decomposed,
   the cell is **SKIPPED**, because it proves nothing.
4. `recompose -m <type> --postpurge`.
5. Hash the whole work tree and compare with the pristine tree. Any missing file,
   leftover file (a shard or sidecar) or changed byte **FAILS** the cell.

Clones use `core.autocrlf=false` plus `* -text` in `.git/info/attributes`, so checkout
writes the committed blob bytes and the repo's own `.gitattributes` can't normalize them.

## Skipped files

`summary.md` has a `skipped` column per cell and two sections:

- **Files left undecomposed in decomposed cells:** files left in place in a cell that still
  passed because other files of the type decomposed. These would otherwise hide behind a PASS.
- **Skipped files by reason:** unique files per reason across the run.

## Reading failures

`summary.md` and `results.json` are written to the report dir. Each changed file is saved as
`<repo>/<cell>/files/<path>.orig` and `.rebuilt`, and labeled with the first normalization
that makes the two equal:

| Kind                  | Meaning                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `bom`                 | Byte-order mark added or dropped                                                              |
| `declaration`         | `<?xml ...?>` spacing or quotes, e.g. `"UTF-8" ?>` vs `"UTF-8"?>`                             |
| `eol`                 | CRLF vs LF                                                                                    |
| `trailing-whitespace` | Trailing newline or whitespace at end of file                                                 |
| `entity`              | `&apos;` vs `'` and similar                                                                   |
| `tag-whitespace`      | Whitespace inside tag markup (Prettier's `<tag` + newline + `>value`, one attribute per line) |
| `whitespace`          | Indentation or whitespace between tags                                                        |
| `self-closing`        | `<a/>` vs `<a></a>`                                                                           |
| `reorder`             | Same lines, different order                                                                   |
| `drift`               | None of the above explains it: content changed                                                |

## Adding repos

Tag each entry with `style`: `salesforce` for metadata as retrieved (`"UTF-8"?>`, self-closing `<a/>`), `prettier` for Prettier-formatted repos. Keep both styles in the corpus.

Add `{ "name", "url", "sha" }` to `corpus.json`. `sha` must be a full commit SHA, never a
branch, so upstream commits don't show up as regressions. Get it with
`git ls-remote <url> HEAD`.
