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

Statuses: **PASS** (byte-equal), **FORMAT** (only `tag-whitespace`/`whitespace` differ; passes unless `--strict`), **SKIPPED** (nothing decomposed), **FAIL**, **ERROR**. Exit code: `0` when there's no FAIL or ERROR, `2` otherwise, `1` on a harness error.

## How each cell works

For each repo, each supported type found in its package directories, and each
strategy/format:

1. Reset the clone to its pinned commit (`git reset --hard` and `git clean -fdx`).
2. `decompose -m <type> -s <strategy> -f <format> --postpurge`.
3. Originals still present after the purge were skipped as leaf-only. If none were
   decomposed, the cell is **SKIPPED**, because it proves nothing.
4. `recompose -m <type> --postpurge`.
5. Hash the whole work tree and compare with the pristine tree. Any missing file,
   leftover file (a shard or sidecar) or changed byte **FAILS** the cell.

Clones use `core.autocrlf=false` plus `* -text` in `.git/info/attributes`, so checkout
writes the committed blob bytes and the repo's own `.gitattributes` can't normalize them.

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
