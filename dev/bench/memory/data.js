window.BENCHMARK_DATA = {
  "lastUpdate": 1794267448770,
  "repoUrl": "https://github.com/mcarvin8/sf-decomposer",
  "entries": {
    "Decompose Memory (large)": [
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "728fc131b3fd1368faa2eb0cc1a7f9f342b841f1",
          "message": "chore(perf): give each profile its own benchmark-action series/comment\n\nBoth matrix profiles published under the same benchmark-action `name`\n(\"Decompose Runtime\"/\"Decompose Memory\"). Each publish call appends a\nfresh entry to that shared series rather than merging into an existing\nentry for the same commit, so large/manyfiles publishes interleaved as\nalternating single-profile entries -- whichever profile wasn't the\nmost recent entry showed a blank \"Previous\" column in PR comments\n(confirmed on PR #528). Worse, both matrix jobs' PR comments shared\nthe same sticky-comment title, so whichever job finished last silently\noverwrote the other profile's comment.\n\nSuffixes `name:` with matrix.profile so each profile gets its own\nseries and its own sticky comment, with no shared state to collide\nover. This starts fresh series on gh-pages for both profiles (no\nexisting history under the old shared name is lost, it's just no\nlonger what new publishes append to).\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-08T20:58:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/728fc131b3fd1368faa2eb0cc1a7f9f342b841f1"
        },
        "date": 1783544696518,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 0.006,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.056,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8e31e3bedd2720f77cc70e85f5c892e203b3ff2",
          "message": "chore(main): release 6.38.4 (#532)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-11T15:25:45-04:00",
          "tree_id": "983b6471c795a6e6609dfd0b9e4703b49927c6c0",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8e31e3bedd2720f77cc70e85f5c892e203b3ff2"
        },
        "date": 1783798768622,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.001,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.027,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.041,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "b8e31e3bedd2720f77cc70e85f5c892e203b3ff2",
          "message": "chore(main): release 6.38.4 (#532)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-11T19:25:45Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8e31e3bedd2720f77cc70e85f5c892e203b3ff2"
        },
        "date": 1783931209391,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.007,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.065,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "a8564089ffa3e3aa732ffe3bf4f484131a4b8b34",
          "message": "chore(perf): diff PR benchmarks against same-runner base ref (#534)\n\n* chore(perf): diff PR benchmarks against same-runner base ref\n\nComparing PR perf against gh-pages history mixes in cross-runner/cross-time\nnoise (20-30% swings), forcing loose alert thresholds. Now the PR job\nbenchmarks the base ref and head ref back-to-back on the same runner and\ndiffs those directly (scripts/compare-perf-baseline.mjs), so the PR comment\ncan use a tighter regression threshold with fewer false alarms. gh-pages\npublishing (schedule/release) is unchanged.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\n\n* chore(perf): fetch PR base sha explicitly before checkout\n\nfetch-depth: ${{ cond && 0 || 1 }} always evaluated to 1 -- Actions\nexpressions treat 0 as falsy, so `0 || 1` collapses to 1 regardless of\ncond. The PR checkout stayed shallow, so the base sha was never fetched\nand `git checkout` on it failed with \"unable to read tree\". Fetch the\nbase commit explicitly instead of relying on an unshallow clone.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-13T13:45:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a8564089ffa3e3aa732ffe3bf4f484131a4b8b34"
        },
        "date": 1783950717419,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 0.003,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.063,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.034,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.032,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cc0c994c476fdc4a0b218d71990ba65f9b5acf80",
          "message": "chore(main): release 6.38.5 (#537)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-13T10:40:27-04:00",
          "tree_id": "91df8733ca9ca932ec660c566a21f8a0ab84a178",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cc0c994c476fdc4a0b218d71990ba65f9b5acf80"
        },
        "date": 1783954538785,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.055,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "45a75a4db2f0335f5378bb305c3087cf0fc99aaf",
          "message": "chore(main): release 6.39.0 (#543)",
          "timestamp": "2026-07-14T08:47:53-04:00",
          "tree_id": "5a7fbd50bde503ffe76f2496af9024dcfd73c998",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/45a75a4db2f0335f5378bb305c3087cf0fc99aaf"
        },
        "date": 1784034097264,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.052,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "74025626610c4b45d0bd7ae81a389d911b795b9d",
          "message": "chore(main): release 6.39.1 (#545)",
          "timestamp": "2026-07-16T13:33:06-04:00",
          "tree_id": "674c9eb5af44c15802774a8e634f7f991f90ac63",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/74025626610c4b45d0bd7ae81a389d911b795b9d"
        },
        "date": 1784224420899,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.042,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "74025626610c4b45d0bd7ae81a389d911b795b9d",
          "message": "chore(main): release 6.39.1 (#545)",
          "timestamp": "2026-07-16T17:33:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/74025626610c4b45d0bd7ae81a389d911b795b9d"
        },
        "date": 1784535297188,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.055,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3edbe6dc9c4cffb06bae1c8dc06b4eed1213ecba",
          "message": "chore(main): release 6.39.2 (#548)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-20T14:00:16-04:00",
          "tree_id": "e21d82a52ea57c69ebd21d070b4754fa15b9b097",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3edbe6dc9c4cffb06bae1c8dc06b4eed1213ecba"
        },
        "date": 1784571443175,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.047,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.034,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.037,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "95a32c13dc43bdbd20465d26c8456954a0d6dd75",
          "message": "chore(audit): require existing entry to cover all required fields, not just one\n\nThe prior alreadyCovered fix suppressed a candidate if any existing pool\nentry shared a single field with the child, which wrongly suppressed\nProfile's loginIpRanges: the pool's bare `startAddress` (added for some\nother Profile child) \"covered\" ProfileLoginIpRange even though that child\nneeds both startAddress and endAddress to avoid collisions. Now an existing\nentry only counts as coverage if it includes every one of the child's\nrequired string fields (or all string fields, if none are required) — so a\nsingle shared field no longer masks a real compound-key gap.",
          "timestamp": "2026-07-22T16:16:08Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/95a32c13dc43bdbd20465d26c8456954a0d6dd75"
        },
        "date": 1785141731166,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.007,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.051,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.043,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.036,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "26e6b8994a120072dd6c462d2b4e26f986303c92",
          "message": "chore(main): release 6.39.3 (#553)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-27T09:19:39-04:00",
          "tree_id": "f9500dcf14532cfefabe64b1d273008fd8c2f544",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e6b8994a120072dd6c462d2b4e26f986303c92"
        },
        "date": 1785159302131,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.046,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "26e6b8994a120072dd6c462d2b4e26f986303c92",
          "message": "chore(main): release 6.39.3 (#553)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-27T13:19:39Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e6b8994a120072dd6c462d2b4e26f986303c92"
        },
        "date": 1785746383073,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.051,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "50a8a9c7f26f3c60d85c588e392233ab7ab732ea",
          "message": "chore(main): release 7.0.0 (#556)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-05T09:28:05-04:00",
          "tree_id": "1bfae309b865e06e5f6541487c557fd46406c18f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/50a8a9c7f26f3c60d85c588e392233ab7ab732ea"
        },
        "date": 1785937365732,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.052,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "1313dfbb21caf2db8a93bb94522e119bd0eaed8b",
          "message": "chore: create github funding button",
          "timestamp": "2026-08-05T15:12:25Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1313dfbb21caf2db8a93bb94522e119bd0eaed8b"
        },
        "date": 1786342733154,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d0b7e13af5becb9e20d3bef0779010177e5d52ab",
          "message": "chore(main): release 7.0.1 (#560)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-12T10:31:33-04:00",
          "tree_id": "a515a162b648e1ac334f0cdbca813fd89de98dcd",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d0b7e13af5becb9e20d3bef0779010177e5d52ab"
        },
        "date": 1786546091993,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1ec9ec7e9a033ba422849874d0ea4f33dc881c4f",
          "message": "chore(main): release 7.1.0 (#565)",
          "timestamp": "2026-08-15T20:24:05-04:00",
          "tree_id": "ceb1972050a88e7ef8d8da96ecf4775b28a93981",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1ec9ec7e9a033ba422849874d0ea4f33dc881c4f"
        },
        "date": 1786840632012,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.012,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "1ec9ec7e9a033ba422849874d0ea4f33dc881c4f",
          "message": "chore(main): release 7.1.0 (#565)",
          "timestamp": "2026-08-16T00:24:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1ec9ec7e9a033ba422849874d0ea4f33dc881c4f"
        },
        "date": 1786945422390,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.049,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7d31d097134285b72630c7262c2ee8d9775034d6",
          "message": "chore(main): release 7.1.1 (#567)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-18T14:07:31-04:00",
          "tree_id": "61b6ebb92dc24dd27e74016e5958b0df62e64bb6",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7d31d097134285b72630c7262c2ee8d9775034d6"
        },
        "date": 1787077341968,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.047,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.013,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.031,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3e3ac915356b2a14ee3ab812f6171d08597a51ad",
          "message": "chore: add readme script to wireit",
          "timestamp": "2026-08-20T19:22:31Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3e3ac915356b2a14ee3ab812f6171d08597a51ad"
        },
        "date": 1787550326199,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.013,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.046,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.014,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.017,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e311426a7a5d5b9ef63ef4e0b661ae94783cd31e",
          "message": "chore(main): release 7.2.0 (#569)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-24T16:14:10-04:00",
          "tree_id": "0718272b116f1043b7bf4501edd47158b39c5073",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/e311426a7a5d5b9ef63ef4e0b661ae94783cd31e"
        },
        "date": 1787603207867,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.043,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.033,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.037,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0e9deb0bdfdf1a239bc109d16ff963bc0743d307",
          "message": "chore(main): release 7.3.0 (#573)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-24T16:56:14-04:00",
          "tree_id": "3afab6a1eba363b95b2b8312fe22d9f62b4d500e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/0e9deb0bdfdf1a239bc109d16ff963bc0743d307"
        },
        "date": 1787605823917,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.044,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b35bde1c129db5985c1f03a50e4bae75a915b341",
          "message": "chore(main): release 7.3.2 (#577)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-25T07:42:49-04:00",
          "tree_id": "4f5f86d55384019cc43205d4da0c36a8f286421d",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b35bde1c129db5985c1f03a50e4bae75a915b341"
        },
        "date": 1787659007413,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "21e773aa0fbefa08613e362003cc0cf54b6a25ed",
          "message": "docs(metadata): support AiAgentDefinition, AiAgentDefinitionVersion\n\nRefreshes METADATA_SUPPORT.md against the vendored SDR registry snapshot.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-25T18:55:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/21e773aa0fbefa08613e362003cc0cf54b6a25ed"
        },
        "date": 1788175997856,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.049,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.013,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e1244212d59f897dc44e3d3483126a22e5d81dd4",
          "message": "chore(main): release 7.3.3 (#590)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-02T16:36:43-04:00",
          "tree_id": "ac0bf64bac869f49be7be35454dcff5d72d99bb5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/e1244212d59f897dc44e3d3483126a22e5d81dd4"
        },
        "date": 1788382317097,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.045,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "48b16dfdc324c8595a63e71ba7b1e01341a39dd0",
          "message": "chore(main): release 7.3.4 (#592)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-03T12:05:37-04:00",
          "tree_id": "a0024253d5638004ee6a3eb5fd020c393c448098",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/48b16dfdc324c8595a63e71ba7b1e01341a39dd0"
        },
        "date": 1788452746257,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.049,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.035,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9a4d07d8e412a5ccd310c5b184b073d7e0a93738",
          "message": "chore(main): release 7.4.0 (#596)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-04T12:57:05-04:00",
          "tree_id": "6fd26eac4db86ab5776d0329a02be55cc56cf0f8",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9a4d07d8e412a5ccd310c5b184b073d7e0a93738"
        },
        "date": 1788541879499,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.053,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "1432d1d14dfdef57a9189959e5cbd755826db824",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-04T16:58:10Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1432d1d14dfdef57a9189959e5cbd755826db824"
        },
        "date": 1788775706566,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.031,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.036,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5f8d8633ed04c36f24423dee1af12427e7cab8b1",
          "message": "chore(main): release 7.4.1 (#598)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T09:47:37-04:00",
          "tree_id": "d9db1908bbc3c7c52cc0c151cfe0d22124f758e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/5f8d8633ed04c36f24423dee1af12427e7cab8b1"
        },
        "date": 1788875999129,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.055,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3cc06a1ba59074c6ccce442cd32bac1632ec7475",
          "message": "chore(main): release 7.4.2 (#600)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T10:56:45-04:00",
          "tree_id": "79e7d34ab2c37b739ef6878da42469439bd0e806",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3cc06a1ba59074c6ccce442cd32bac1632ec7475"
        },
        "date": 1788880300617,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.012,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.052,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.027,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "602412fdfcbd401d0548870ca768e605489cc0d0",
          "message": "chore(main): release 7.4.3 (#603)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-09T15:42:53-04:00",
          "tree_id": "38e5f5c17e887c8ecc8802a907fe67b0f75a04df",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/602412fdfcbd401d0548870ca768e605489cc0d0"
        },
        "date": 1788983956552,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.013,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.044,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "8f15fbb5748443baa5d872af1d4a83e74d94c268",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-09T19:43:52Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8f15fbb5748443baa5d872af1d4a83e74d94c268"
        },
        "date": 1789382058146,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.051,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "8f15fbb5748443baa5d872af1d4a83e74d94c268",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-09T19:43:52Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8f15fbb5748443baa5d872af1d4a83e74d94c268"
        },
        "date": 1789987188019,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.052,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.041,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f023202ee6a43bf707dac47d0b560649ae7eee56",
          "message": "chore(main): release 7.5.0 (#605)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-21T09:06:35-04:00",
          "tree_id": "f173c1491ae88ff9cd4d089335b0279665746486",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f023202ee6a43bf707dac47d0b560649ae7eee56"
        },
        "date": 1789996981089,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.044,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.033,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "249439c67fe626eb158c893764fa2a8bb8a45495",
          "message": "ci(release): poll npm registry before triggering smoke test\n\nnpm publish can return before the registry finishes propagating, causing\nsf plugins install in smoke-test.yml to 404 on the just-published version.\nAdd a wait-for-npm job that polls npm view until the version resolves\n(15s interval, 10min cap) before smoke-test runs.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-21T13:18:29Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/249439c67fe626eb158c893764fa2a8bb8a45495"
        },
        "date": 1790595579427,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.045,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.034,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.036,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "dependabot[bot]",
            "username": "dependabot[bot]",
            "email": "49699333+dependabot[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3eb83c0acc4cbd918f251a209c37adb1c66b789a",
          "message": "fix(deps): bump the dependencies group across 1 directory with 3 updates (#608)",
          "timestamp": "2026-10-05T00:42:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3eb83c0acc4cbd918f251a209c37adb1c66b789a"
        },
        "date": 1791202367063,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.01,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.046,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.039,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "dependabot[bot]",
            "username": "dependabot[bot]",
            "email": "49699333+dependabot[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3eb83c0acc4cbd918f251a209c37adb1c66b789a",
          "message": "fix(deps): bump the dependencies group across 1 directory with 3 updates (#608)",
          "timestamp": "2026-10-05T00:42:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3eb83c0acc4cbd918f251a209c37adb1c66b789a"
        },
        "date": 1791809971034,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.011,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.044,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.036,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cba238539e4ec7ec4718371a188e8cd3fbf539fe",
          "message": "chore(main): release 7.5.1 (#609)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-13T10:18:45-04:00",
          "tree_id": "99722c1ede7d6f6e088e7dd9831cfaa9b2d8c6ee",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cba238539e4ec7ec4718371a188e8cd3fbf539fe"
        },
        "date": 1791902270707,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.049,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.04,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "37fa00c637b6fa6231e4303d3319ab3a7a3241bd",
          "message": "docs: add troubleshooting for removing stale metadata references\n\nExplain how to delete decomposed files for deleted or uninstalled\ncomponents (e.g. managed package namespaces) and recompose, so\npermission sets and profiles deploy without stale references.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-14T12:41:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/37fa00c637b6fa6231e4303d3319ab3a7a3241bd"
        },
        "date": 1792406481657,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.008,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.045,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.034,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.036,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8143b042d86301b97542d9978ab884c528fa382",
          "message": "chore(main): release 7.6.0 (#612)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-19T09:16:51-04:00",
          "tree_id": "c9760da29cf1414253ecdb231b3d403930ec6391",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8143b042d86301b97542d9978ab884c528fa382"
        },
        "date": 1792417032837,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.013,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.051,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "27787c9f56e99964e927ca115b5cb357ff627e87",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-10-19T13:18:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/27787c9f56e99964e927ca115b5cb357ff627e87"
        },
        "date": 1793012296493,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.015,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.034,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.032,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.037,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a29e6f54a3eccf8b25662dfa848f7ffb5472927d",
          "message": "chore(main): release 7.7.0 (#614)",
          "timestamp": "2026-10-26T10:11:18-04:00",
          "tree_id": "8aaf5baa6831fc1bafce5e61e514e775630a536e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a29e6f54a3eccf8b25662dfa848f7ffb5472927d"
        },
        "date": 1793024869883,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.05,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.039,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "15e6a1a94e35b0a71e74d25811df0b452a3e1906",
          "message": "chore(main): release 7.8.0 (#617)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-31T13:58:00-04:00",
          "tree_id": "63a674d0aa5fe72422127e38a4eb6974a562458b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/15e6a1a94e35b0a71e74d25811df0b452a3e1906"
        },
        "date": 1793470610126,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.009,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.053,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.016,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.04,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "8e99955923cd5f1836f16336816119806e0c1bc9",
          "message": "docs: remove v66 refs",
          "timestamp": "2026-10-31T20:51:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8e99955923cd5f1836f16336816119806e0c1bc9"
        },
        "date": 1793625755059,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.028,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.045,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.044,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.038,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "26e9f5661de672a15ccc17e67e290f159e1e435f",
          "message": "chore(main): release 7.9.0 (#621)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-02T13:15:19-05:00",
          "tree_id": "69ee026a459d1ff727d99da047355d0338a8650f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e9f5661de672a15ccc17e67e290f159e1e435f"
        },
        "date": 1793644334816,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.03,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.046,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.037,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.037,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dc672e911fbe3da815273baec68ef87223f7fff6",
          "message": "chore(main): release 7.10.0 (#624)",
          "timestamp": "2026-11-03T14:41:16-05:00",
          "tree_id": "6321c95b1693ebe2ca92fd3ab4cee94a4cf62019",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/dc672e911fbe3da815273baec68ef87223f7fff6"
        },
        "date": 1793735874382,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.029,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.048,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.038,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.035,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.037,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "819abc7a90cf7dcb611ad0f7bd50425d3563a995",
          "message": "chore(main): release 7.11.0 (#634)",
          "timestamp": "2026-11-05T19:36:36-05:00",
          "tree_id": "4fdc7e5267da5dcc72925e30d494854e488dc61b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/819abc7a90cf7dcb611ad0f7bd50425d3563a995"
        },
        "date": 1793926180574,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": -0.037,
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 0.047,
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 0.041,
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 0.036,
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 0.035,
            "unit": "MB"
          }
        ]
      }
    ],
    "Decompose Memory (manyfiles)": [
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "728fc131b3fd1368faa2eb0cc1a7f9f342b841f1",
          "message": "chore(perf): give each profile its own benchmark-action series/comment\n\nBoth matrix profiles published under the same benchmark-action `name`\n(\"Decompose Runtime\"/\"Decompose Memory\"). Each publish call appends a\nfresh entry to that shared series rather than merging into an existing\nentry for the same commit, so large/manyfiles publishes interleaved as\nalternating single-profile entries -- whichever profile wasn't the\nmost recent entry showed a blank \"Previous\" column in PR comments\n(confirmed on PR #528). Worse, both matrix jobs' PR comments shared\nthe same sticky-comment title, so whichever job finished last silently\noverwrote the other profile's comment.\n\nSuffixes `name:` with matrix.profile so each profile gets its own\nseries and its own sticky comment, with no shared state to collide\nover. This starts fresh series on gh-pages for both profiles (no\nexisting history under the old shared name is lost, it's just no\nlonger what new publishes append to).\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-08T20:58:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/728fc131b3fd1368faa2eb0cc1a7f9f342b841f1"
        },
        "date": 1783545019217,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8e31e3bedd2720f77cc70e85f5c892e203b3ff2",
          "message": "chore(main): release 6.38.4 (#532)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-11T15:25:45-04:00",
          "tree_id": "983b6471c795a6e6609dfd0b9e4703b49927c6c0",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8e31e3bedd2720f77cc70e85f5c892e203b3ff2"
        },
        "date": 1783799073334,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "b8e31e3bedd2720f77cc70e85f5c892e203b3ff2",
          "message": "chore(main): release 6.38.4 (#532)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-11T19:25:45Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8e31e3bedd2720f77cc70e85f5c892e203b3ff2"
        },
        "date": 1783931512187,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "a8564089ffa3e3aa732ffe3bf4f484131a4b8b34",
          "message": "chore(perf): diff PR benchmarks against same-runner base ref (#534)\n\n* chore(perf): diff PR benchmarks against same-runner base ref\n\nComparing PR perf against gh-pages history mixes in cross-runner/cross-time\nnoise (20-30% swings), forcing loose alert thresholds. Now the PR job\nbenchmarks the base ref and head ref back-to-back on the same runner and\ndiffs those directly (scripts/compare-perf-baseline.mjs), so the PR comment\ncan use a tighter regression threshold with fewer false alarms. gh-pages\npublishing (schedule/release) is unchanged.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\n\n* chore(perf): fetch PR base sha explicitly before checkout\n\nfetch-depth: ${{ cond && 0 || 1 }} always evaluated to 1 -- Actions\nexpressions treat 0 as falsy, so `0 || 1` collapses to 1 regardless of\ncond. The PR checkout stayed shallow, so the base sha was never fetched\nand `git checkout` on it failed with \"unable to read tree\". Fetch the\nbase commit explicitly instead of relying on an unshallow clone.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-13T13:45:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a8564089ffa3e3aa732ffe3bf4f484131a4b8b34"
        },
        "date": 1783951072263,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cc0c994c476fdc4a0b218d71990ba65f9b5acf80",
          "message": "chore(main): release 6.38.5 (#537)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-13T10:40:27-04:00",
          "tree_id": "91df8733ca9ca932ec660c566a21f8a0ab84a178",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cc0c994c476fdc4a0b218d71990ba65f9b5acf80"
        },
        "date": 1783954826530,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "45a75a4db2f0335f5378bb305c3087cf0fc99aaf",
          "message": "chore(main): release 6.39.0 (#543)",
          "timestamp": "2026-07-14T08:47:53-04:00",
          "tree_id": "5a7fbd50bde503ffe76f2496af9024dcfd73c998",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/45a75a4db2f0335f5378bb305c3087cf0fc99aaf"
        },
        "date": 1784034347629,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "74025626610c4b45d0bd7ae81a389d911b795b9d",
          "message": "chore(main): release 6.39.1 (#545)",
          "timestamp": "2026-07-16T13:33:06-04:00",
          "tree_id": "674c9eb5af44c15802774a8e634f7f991f90ac63",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/74025626610c4b45d0bd7ae81a389d911b795b9d"
        },
        "date": 1784224656910,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "74025626610c4b45d0bd7ae81a389d911b795b9d",
          "message": "chore(main): release 6.39.1 (#545)",
          "timestamp": "2026-07-16T17:33:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/74025626610c4b45d0bd7ae81a389d911b795b9d"
        },
        "date": 1784535532714,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3edbe6dc9c4cffb06bae1c8dc06b4eed1213ecba",
          "message": "chore(main): release 6.39.2 (#548)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-20T14:00:16-04:00",
          "tree_id": "e21d82a52ea57c69ebd21d070b4754fa15b9b097",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3edbe6dc9c4cffb06bae1c8dc06b4eed1213ecba"
        },
        "date": 1784571743904,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "95a32c13dc43bdbd20465d26c8456954a0d6dd75",
          "message": "chore(audit): require existing entry to cover all required fields, not just one\n\nThe prior alreadyCovered fix suppressed a candidate if any existing pool\nentry shared a single field with the child, which wrongly suppressed\nProfile's loginIpRanges: the pool's bare `startAddress` (added for some\nother Profile child) \"covered\" ProfileLoginIpRange even though that child\nneeds both startAddress and endAddress to avoid collisions. Now an existing\nentry only counts as coverage if it includes every one of the child's\nrequired string fields (or all string fields, if none are required) — so a\nsingle shared field no longer masks a real compound-key gap.",
          "timestamp": "2026-07-22T16:16:08Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/95a32c13dc43bdbd20465d26c8456954a0d6dd75"
        },
        "date": 1785142024680,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.011,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "26e6b8994a120072dd6c462d2b4e26f986303c92",
          "message": "chore(main): release 6.39.3 (#553)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-27T09:19:39-04:00",
          "tree_id": "f9500dcf14532cfefabe64b1d273008fd8c2f544",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e6b8994a120072dd6c462d2b4e26f986303c92"
        },
        "date": 1785159604329,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.007,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "26e6b8994a120072dd6c462d2b4e26f986303c92",
          "message": "chore(main): release 6.39.3 (#553)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-07-27T13:19:39Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e6b8994a120072dd6c462d2b4e26f986303c92"
        },
        "date": 1785746726239,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "50a8a9c7f26f3c60d85c588e392233ab7ab732ea",
          "message": "chore(main): release 7.0.0 (#556)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-05T09:28:05-04:00",
          "tree_id": "1bfae309b865e06e5f6541487c557fd46406c18f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/50a8a9c7f26f3c60d85c588e392233ab7ab732ea"
        },
        "date": 1785937633792,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.001,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "1313dfbb21caf2db8a93bb94522e119bd0eaed8b",
          "message": "chore: create github funding button",
          "timestamp": "2026-08-05T15:12:25Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1313dfbb21caf2db8a93bb94522e119bd0eaed8b"
        },
        "date": 1786343033123,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d0b7e13af5becb9e20d3bef0779010177e5d52ab",
          "message": "chore(main): release 7.0.1 (#560)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-12T10:31:33-04:00",
          "tree_id": "a515a162b648e1ac334f0cdbca813fd89de98dcd",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d0b7e13af5becb9e20d3bef0779010177e5d52ab"
        },
        "date": 1786546369843,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1ec9ec7e9a033ba422849874d0ea4f33dc881c4f",
          "message": "chore(main): release 7.1.0 (#565)",
          "timestamp": "2026-08-15T20:24:05-04:00",
          "tree_id": "ceb1972050a88e7ef8d8da96ecf4775b28a93981",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1ec9ec7e9a033ba422849874d0ea4f33dc881c4f"
        },
        "date": 1786840927033,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.009,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "1ec9ec7e9a033ba422849874d0ea4f33dc881c4f",
          "message": "chore(main): release 7.1.0 (#565)",
          "timestamp": "2026-08-16T00:24:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1ec9ec7e9a033ba422849874d0ea4f33dc881c4f"
        },
        "date": 1786945706457,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7d31d097134285b72630c7262c2ee8d9775034d6",
          "message": "chore(main): release 7.1.1 (#567)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-18T14:07:31-04:00",
          "tree_id": "61b6ebb92dc24dd27e74016e5958b0df62e64bb6",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7d31d097134285b72630c7262c2ee8d9775034d6"
        },
        "date": 1787077645004,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.01,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3e3ac915356b2a14ee3ab812f6171d08597a51ad",
          "message": "chore: add readme script to wireit",
          "timestamp": "2026-08-20T19:22:31Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3e3ac915356b2a14ee3ab812f6171d08597a51ad"
        },
        "date": 1787550624251,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.009,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e311426a7a5d5b9ef63ef4e0b661ae94783cd31e",
          "message": "chore(main): release 7.2.0 (#569)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-24T16:14:10-04:00",
          "tree_id": "0718272b116f1043b7bf4501edd47158b39c5073",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/e311426a7a5d5b9ef63ef4e0b661ae94783cd31e"
        },
        "date": 1787603598516,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.011,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0e9deb0bdfdf1a239bc109d16ff963bc0743d307",
          "message": "chore(main): release 7.3.0 (#573)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-24T16:56:14-04:00",
          "tree_id": "3afab6a1eba363b95b2b8312fe22d9f62b4d500e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/0e9deb0bdfdf1a239bc109d16ff963bc0743d307"
        },
        "date": 1787606120593,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b35bde1c129db5985c1f03a50e4bae75a915b341",
          "message": "chore(main): release 7.3.2 (#577)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-08-25T07:42:49-04:00",
          "tree_id": "4f5f86d55384019cc43205d4da0c36a8f286421d",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b35bde1c129db5985c1f03a50e4bae75a915b341"
        },
        "date": 1787659310833,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.011,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "21e773aa0fbefa08613e362003cc0cf54b6a25ed",
          "message": "docs(metadata): support AiAgentDefinition, AiAgentDefinitionVersion\n\nRefreshes METADATA_SUPPORT.md against the vendored SDR registry snapshot.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-25T18:55:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/21e773aa0fbefa08613e362003cc0cf54b6a25ed"
        },
        "date": 1788176255156,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e1244212d59f897dc44e3d3483126a22e5d81dd4",
          "message": "chore(main): release 7.3.3 (#590)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-02T16:36:43-04:00",
          "tree_id": "ac0bf64bac869f49be7be35454dcff5d72d99bb5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/e1244212d59f897dc44e3d3483126a22e5d81dd4"
        },
        "date": 1788382589020,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "48b16dfdc324c8595a63e71ba7b1e01341a39dd0",
          "message": "chore(main): release 7.3.4 (#592)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-03T12:05:37-04:00",
          "tree_id": "a0024253d5638004ee6a3eb5fd020c393c448098",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/48b16dfdc324c8595a63e71ba7b1e01341a39dd0"
        },
        "date": 1788453057933,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9a4d07d8e412a5ccd310c5b184b073d7e0a93738",
          "message": "chore(main): release 7.4.0 (#596)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-04T12:57:05-04:00",
          "tree_id": "6fd26eac4db86ab5776d0329a02be55cc56cf0f8",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9a4d07d8e412a5ccd310c5b184b073d7e0a93738"
        },
        "date": 1788542160594,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.01,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "1432d1d14dfdef57a9189959e5cbd755826db824",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-04T16:58:10Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/1432d1d14dfdef57a9189959e5cbd755826db824"
        },
        "date": 1788775984184,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.012,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5f8d8633ed04c36f24423dee1af12427e7cab8b1",
          "message": "chore(main): release 7.4.1 (#598)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T09:47:37-04:00",
          "tree_id": "d9db1908bbc3c7c52cc0c151cfe0d22124f758e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/5f8d8633ed04c36f24423dee1af12427e7cab8b1"
        },
        "date": 1788876290173,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.011,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.013,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3cc06a1ba59074c6ccce442cd32bac1632ec7475",
          "message": "chore(main): release 7.4.2 (#600)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T10:56:45-04:00",
          "tree_id": "79e7d34ab2c37b739ef6878da42469439bd0e806",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3cc06a1ba59074c6ccce442cd32bac1632ec7475"
        },
        "date": 1788880608680,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "602412fdfcbd401d0548870ca768e605489cc0d0",
          "message": "chore(main): release 7.4.3 (#603)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-09T15:42:53-04:00",
          "tree_id": "38e5f5c17e887c8ecc8802a907fe67b0f75a04df",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/602412fdfcbd401d0548870ca768e605489cc0d0"
        },
        "date": 1788984262127,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.011,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "8f15fbb5748443baa5d872af1d4a83e74d94c268",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-09T19:43:52Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8f15fbb5748443baa5d872af1d4a83e74d94c268"
        },
        "date": 1789382292171,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.012,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "8f15fbb5748443baa5d872af1d4a83e74d94c268",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-09-09T19:43:52Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8f15fbb5748443baa5d872af1d4a83e74d94c268"
        },
        "date": 1789987391536,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.013,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.007,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f023202ee6a43bf707dac47d0b560649ae7eee56",
          "message": "chore(main): release 7.5.0 (#605)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-21T09:06:35-04:00",
          "tree_id": "f173c1491ae88ff9cd4d089335b0279665746486",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f023202ee6a43bf707dac47d0b560649ae7eee56"
        },
        "date": 1789997210419,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "249439c67fe626eb158c893764fa2a8bb8a45495",
          "message": "ci(release): poll npm registry before triggering smoke test\n\nnpm publish can return before the registry finishes propagating, causing\nsf plugins install in smoke-test.yml to 404 on the just-published version.\nAdd a wait-for-npm job that polls npm view until the version resolves\n(15s interval, 10min cap) before smoke-test runs.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-21T13:18:29Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/249439c67fe626eb158c893764fa2a8bb8a45495"
        },
        "date": 1790595874444,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "dependabot[bot]",
            "username": "dependabot[bot]",
            "email": "49699333+dependabot[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3eb83c0acc4cbd918f251a209c37adb1c66b789a",
          "message": "fix(deps): bump the dependencies group across 1 directory with 3 updates (#608)",
          "timestamp": "2026-10-05T00:42:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3eb83c0acc4cbd918f251a209c37adb1c66b789a"
        },
        "date": 1791202559617,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.014,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "dependabot[bot]",
            "username": "dependabot[bot]",
            "email": "49699333+dependabot[bot]@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "3eb83c0acc4cbd918f251a209c37adb1c66b789a",
          "message": "fix(deps): bump the dependencies group across 1 directory with 3 updates (#608)",
          "timestamp": "2026-10-05T00:42:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3eb83c0acc4cbd918f251a209c37adb1c66b789a"
        },
        "date": 1791810287891,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cba238539e4ec7ec4718371a188e8cd3fbf539fe",
          "message": "chore(main): release 7.5.1 (#609)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-13T10:18:45-04:00",
          "tree_id": "99722c1ede7d6f6e088e7dd9831cfaa9b2d8c6ee",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cba238539e4ec7ec4718371a188e8cd3fbf539fe"
        },
        "date": 1791902469925,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.014,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.012,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "id": "37fa00c637b6fa6231e4303d3319ab3a7a3241bd",
          "message": "docs: add troubleshooting for removing stale metadata references\n\nExplain how to delete decomposed files for deleted or uninstalled\ncomponents (e.g. managed package namespaces) and recompose, so\npermission sets and profiles deploy without stale references.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-14T12:41:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/37fa00c637b6fa6231e4303d3319ab3a7a3241bd"
        },
        "date": 1792406777455,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8143b042d86301b97542d9978ab884c528fa382",
          "message": "chore(main): release 7.6.0 (#612)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-19T09:16:51-04:00",
          "tree_id": "c9760da29cf1414253ecdb231b3d403930ec6391",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8143b042d86301b97542d9978ab884c528fa382"
        },
        "date": 1792417341129,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.006,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mcarvin8",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "github-actions[bot]",
            "username": "github-actions[bot]",
            "email": "41898282+github-actions[bot]@users.noreply.github.com"
          },
          "id": "27787c9f56e99964e927ca115b5cb357ff627e87",
          "message": "docs: regenerate command reference [skip ci]",
          "timestamp": "2026-10-19T13:18:09Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/27787c9f56e99964e927ca115b5cb357ff627e87"
        },
        "date": 1793012474480,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.002,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.005,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a29e6f54a3eccf8b25662dfa848f7ffb5472927d",
          "message": "chore(main): release 7.7.0 (#614)",
          "timestamp": "2026-10-26T10:11:18-04:00",
          "tree_id": "8aaf5baa6831fc1bafce5e61e514e775630a536e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a29e6f54a3eccf8b25662dfa848f7ffb5472927d"
        },
        "date": 1793025182404,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.011,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "15e6a1a94e35b0a71e74d25811df0b452a3e1906",
          "message": "chore(main): release 7.8.0 (#617)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-31T13:58:00-04:00",
          "tree_id": "63a674d0aa5fe72422127e38a4eb6974a562458b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/15e6a1a94e35b0a71e74d25811df0b452a3e1906"
        },
        "date": 1793470780936,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.012,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.009,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.007,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "8e99955923cd5f1836f16336816119806e0c1bc9",
          "message": "docs: remove v66 refs",
          "timestamp": "2026-10-31T20:51:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8e99955923cd5f1836f16336816119806e0c1bc9"
        },
        "date": 1793626064201,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "26e9f5661de672a15ccc17e67e290f159e1e435f",
          "message": "chore(main): release 7.9.0 (#621)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-02T13:15:19-05:00",
          "tree_id": "69ee026a459d1ff727d99da047355d0338a8650f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e9f5661de672a15ccc17e67e290f159e1e435f"
        },
        "date": 1793644613693,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dc672e911fbe3da815273baec68ef87223f7fff6",
          "message": "chore(main): release 7.10.0 (#624)",
          "timestamp": "2026-11-03T14:41:16-05:00",
          "tree_id": "6321c95b1693ebe2ca92fd3ab4cee94a4cf62019",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/dc672e911fbe3da815273baec68ef87223f7fff6"
        },
        "date": 1793736210404,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.008,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "819abc7a90cf7dcb611ad0f7bd50425d3563a995",
          "message": "chore(main): release 7.11.0 (#634)",
          "timestamp": "2026-11-05T19:36:36-05:00",
          "tree_id": "4fdc7e5267da5dcc72925e30d494854e488dc61b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/819abc7a90cf7dcb611ad0f7bd50425d3563a995"
        },
        "date": 1793926421485,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": -0.004,
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 0.007,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 0.01,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": -0.003,
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 0.008,
            "unit": "MB"
          }
        ]
      }
    ],
    "Decompose Peak RSS (large)": [
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3c00cef771c8147cc73166ddca969c450743d5f3",
          "message": "chore(main): release 7.11.1 (#638)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T12:24:51-05:00",
          "tree_id": "27f64d1a64a9a5f151330bdf83ff02789bc476fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3c00cef771c8147cc73166ddca969c450743d5f3"
        },
        "date": 1793986850627,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 511.63,
            "range": "511.24-511.91MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 511.79,
            "range": "511.29-511.98MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 618.54,
            "range": "618.41-773.07MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 618.58,
            "range": "618.28-618.92MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 683.11,
            "range": "682.62-727.51MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 683.23,
            "range": "683.12-683.88MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 707.82,
            "range": "707.56-708.32MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 708.3,
            "range": "708.03-708.38MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c",
          "message": "chore(main): release 7.11.2 (#640)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T16:14:34-05:00",
          "tree_id": "16039113b2a724fa8219102bfe3eb51eea7c11be",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c"
        },
        "date": 1794000482399,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 479.24,
            "range": "478.95-479.33MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 479.48,
            "range": "479.33-479.99MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 683.73,
            "range": "683.65-685.2MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 683.98,
            "range": "683.69-684.45MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 743.33,
            "range": "743.01-744.88MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 743.25,
            "range": "743.05-743.37MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 845.01,
            "range": "844.81-845.47MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 845.3,
            "range": "845.03-845.7MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a5c4e943e7e5d3a4cab16041a9758dee6cadabd4",
          "message": "chore(main): release 7.11.3 (#643)",
          "timestamp": "2026-11-06T16:54:52-05:00",
          "tree_id": "24e18592914fd3182e8098ab792a838d97b806fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a5c4e943e7e5d3a4cab16041a9758dee6cadabd4"
        },
        "date": 1794002826066,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 563.41,
            "range": "563.13-564.89MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 563.36,
            "range": "562.91-563.95MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 707.57,
            "range": "707.12-711.59MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 707.75,
            "range": "707.55-711.68MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 720.05,
            "range": "719.39-721.75MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 720.32,
            "range": "719.75-722.43MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 729.3,
            "range": "728.98-729.59MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 729.44,
            "range": "729.27-730.07MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3",
          "message": "chore(main): release 7.11.4 (#645)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T15:46:00-05:00",
          "tree_id": "c0fc119c9304e74243a36719665cee32a6aee2d7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3"
        },
        "date": 1794085110090,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 561.59,
            "range": "561.38-561.98MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 561.88,
            "range": "561.66-562.13MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 680.91,
            "range": "680.43-682.97MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 681.47,
            "range": "681.37-682.7MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 658.86,
            "range": "658.25-713.02MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 658.72,
            "range": "658.29-713.85MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 696.22,
            "range": "695.69-715.27MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 696.36,
            "range": "696.2-696.39MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "227b33d905d5723c9f9f49968da711f4984ae7da",
          "message": "chore(main): release 7.11.5 (#647)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T16:14:09-05:00",
          "tree_id": "026193b40ada8e1e4e22d9633706ceb392af69e7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/227b33d905d5723c9f9f49968da711f4984ae7da"
        },
        "date": 1794086865983,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 506.02,
            "range": "505.88-506.46MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 505.92,
            "range": "505.17-506.45MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 581.3,
            "range": "581.05-582.93MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 581.84,
            "range": "581.46-583.57MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 694.01,
            "range": "693.3-696.1MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 694.75,
            "range": "693.99-695.82MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 706.1,
            "range": "705.62-754.07MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 706.26,
            "range": "705.69-706.93MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "75b30c7cbd783394a72bb6970bdfd678179620ad",
          "message": "chore(main): release 7.11.6 (#649)",
          "timestamp": "2026-11-07T17:07:53-05:00",
          "tree_id": "a4a51a792d76a00b3b1080a1c82931a1191af6e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/75b30c7cbd783394a72bb6970bdfd678179620ad"
        },
        "date": 1794089991230,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 503.09,
            "range": "502.64-531.86MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 502.81,
            "range": "502.41-532.13MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 597.89,
            "range": "597.43-599.34MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 597.84,
            "range": "597.63-599.06MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 667.87,
            "range": "667.41-668.74MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 668.22,
            "range": "667.17-668.7MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 678.67,
            "range": "678.33-679.1MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 678.63,
            "range": "678.49-679.16MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ae7a67eceb909494eebfdafe84add98cacbda510",
          "message": "chore(main): release 7.11.7 (#651)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T21:18:41-05:00",
          "tree_id": "b5ccd1be38522c8b0bc6631fc1e720458b521ddc",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/ae7a67eceb909494eebfdafe84add98cacbda510"
        },
        "date": 1794105039066,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 286.95,
            "range": "286.83-287.99MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 287.39,
            "range": "286.8-287.99MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 319.99,
            "range": "318.28-322.04MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 319.34,
            "range": "319.19-322.21MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 326.72,
            "range": "326.11-335.32MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 326.35,
            "range": "325.98-335.14MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 335.51,
            "range": "335.16-335.76MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 335.73,
            "range": "335.49-336.13MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7a32f40e5591ee7855b76fb817f86232b10465ff",
          "message": "chore(main): release 7.11.8 (#655)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T10:26:33-05:00",
          "tree_id": "e07a7f04aeb37855bbc16ea291befce16d1aa0b5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7a32f40e5591ee7855b76fb817f86232b10465ff"
        },
        "date": 1794152431949,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 156.71,
            "range": "149.05-171.16MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 256.97,
            "range": "256.3-260.45MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 155.36,
            "range": "150.84-168.88MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 235.29,
            "range": "226.93-238.34MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 155.64,
            "range": "153.93-166.6MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 234.56,
            "range": "228.3-238.51MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 152.32,
            "range": "150.99-156.87MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 236.88,
            "range": "233.04-241.94MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "d647f44c7309e3a35f545fc488c30c3b450f43e2",
          "message": "chore(release): publish a manyfiles-overrides perf baseline after each release (#657)\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T15:37:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d647f44c7309e3a35f545fc488c30c3b450f43e2"
        },
        "date": 1794231936536,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 160.47,
            "range": "150.29-171.61MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 260.72,
            "range": "256.76-266.04MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 151.83,
            "range": "148.64-172.19MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 235.82,
            "range": "228.23-237.89MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 155.53,
            "range": "153.55-175.83MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 234.61,
            "range": "233.73-242.87MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 151.05,
            "range": "149.38-163.3MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 238.36,
            "range": "237.26-242.97MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794237820808,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 156.55,
            "range": "150.11-163.17MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 259.5,
            "range": "254.86-262.62MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 154.65,
            "range": "151.85-173.09MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 233.91,
            "range": "226.67-240.75MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 156.77,
            "range": "151.59-160.95MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 237.81,
            "range": "233.22-240.67MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 164.27,
            "range": "149.23-170.67MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 237.43,
            "range": "236.19-238.98MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f98ed3dc03b72519ddab01150d2fd5aef4e827be",
          "message": "chore(main): release 7.12.1 (#661)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T16:00:22-05:00",
          "tree_id": "2345a08abfc18eb6873fd1686d5b216ed0c858ce",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f98ed3dc03b72519ddab01150d2fd5aef4e827be"
        },
        "date": 1794267448720,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 150.98,
            "range": "148.85-160.47MB",
            "unit": "MB"
          },
          {
            "name": "large.xml.recompose",
            "value": 256.06,
            "range": "254.66-258.17MB",
            "unit": "MB"
          },
          {
            "name": "large.json.decompose",
            "value": 169.12,
            "range": "150.34-180.25MB",
            "unit": "MB"
          },
          {
            "name": "large.json.recompose",
            "value": 236.86,
            "range": "229.9-238.37MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.decompose",
            "value": 160.8,
            "range": "153.95-186.09MB",
            "unit": "MB"
          },
          {
            "name": "large.json5.recompose",
            "value": 236.73,
            "range": "234.79-242.92MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.decompose",
            "value": 152.37,
            "range": "150.01-170.11MB",
            "unit": "MB"
          },
          {
            "name": "large.yaml.recompose",
            "value": 237.39,
            "range": "235.67-242.69MB",
            "unit": "MB"
          }
        ]
      }
    ],
    "Decompose Peak RSS (manyfiles)": [
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3c00cef771c8147cc73166ddca969c450743d5f3",
          "message": "chore(main): release 7.11.1 (#638)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T12:24:51-05:00",
          "tree_id": "27f64d1a64a9a5f151330bdf83ff02789bc476fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3c00cef771c8147cc73166ddca969c450743d5f3"
        },
        "date": 1793987050697,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 79.49,
            "range": "79.31-91.82MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 79.8,
            "range": "79.39-79.88MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 91.51,
            "range": "91.12-97.31MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 91.97,
            "range": "91.5-98.01MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 90.98,
            "range": "90.77-99.41MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 91.54,
            "range": "90.51-99.21MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 94.03,
            "range": "93.44-95.28MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 93.91,
            "range": "93.5-95.32MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c",
          "message": "chore(main): release 7.11.2 (#640)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T16:14:34-05:00",
          "tree_id": "16039113b2a724fa8219102bfe3eb51eea7c11be",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c"
        },
        "date": 1794000678422,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 89.05,
            "range": "78.55-92.23MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 89.41,
            "range": "78.79-92.21MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 88.17,
            "range": "87.57-88.52MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 88.46,
            "range": "87.97-88.89MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 92.39,
            "range": "91.84-101.19MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 92.3,
            "range": "92.06-101.67MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 98.85,
            "range": "98.33-99.5MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 99.3,
            "range": "99.06-99.95MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a5c4e943e7e5d3a4cab16041a9758dee6cadabd4",
          "message": "chore(main): release 7.11.3 (#643)",
          "timestamp": "2026-11-06T16:54:52-05:00",
          "tree_id": "24e18592914fd3182e8098ab792a838d97b806fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a5c4e943e7e5d3a4cab16041a9758dee6cadabd4"
        },
        "date": 1794002974943,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 98.79,
            "range": "98.35-100.84MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 98.95,
            "range": "88.38-101.27MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 96.74,
            "range": "96.33-99.17MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 97.06,
            "range": "96.56-99.01MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 102.72,
            "range": "100.98-105.88MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 101.9,
            "range": "101.37-106.51MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 99.39,
            "range": "99.05-104.67MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 99.57,
            "range": "99.04-104.93MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3",
          "message": "chore(main): release 7.11.4 (#645)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T15:46:00-05:00",
          "tree_id": "c0fc119c9304e74243a36719665cee32a6aee2d7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3"
        },
        "date": 1794085329796,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 88.75,
            "range": "88.19-96.22MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 89.03,
            "range": "88.32-96.23MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 98.51,
            "range": "97.88-101.59MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 98.67,
            "range": "98.27-101.31MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 95.47,
            "range": "94.81-105.03MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 95.13,
            "range": "94.21-105.64MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 105.71,
            "range": "105.16-106.13MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 106.2,
            "range": "105.79-106.31MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "227b33d905d5723c9f9f49968da711f4984ae7da",
          "message": "chore(main): release 7.11.5 (#647)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T16:14:09-05:00",
          "tree_id": "026193b40ada8e1e4e22d9633706ceb392af69e7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/227b33d905d5723c9f9f49968da711f4984ae7da"
        },
        "date": 1794087036919,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 96.61,
            "range": "85.44-97.09MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 96.73,
            "range": "85.06-97.55MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 96.58,
            "range": "96.39-97.91MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 97.04,
            "range": "96.71-98.33MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 96.7,
            "range": "95.96-105.74MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 96.68,
            "range": "95.91-105.54MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 97.43,
            "range": "96.91-98.42MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 97.54,
            "range": "97.14-98.59MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "75b30c7cbd783394a72bb6970bdfd678179620ad",
          "message": "chore(main): release 7.11.6 (#649)",
          "timestamp": "2026-11-07T17:07:53-05:00",
          "tree_id": "a4a51a792d76a00b3b1080a1c82931a1191af6e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/75b30c7cbd783394a72bb6970bdfd678179620ad"
        },
        "date": 1794090144202,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 95.57,
            "range": "84.66-96.3MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 94.76,
            "range": "84.97-96.47MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 94.78,
            "range": "92.99-95.08MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 93.34,
            "range": "92.59-94.77MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 96.42,
            "range": "95.43-106.79MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 97.29,
            "range": "95.48-106.1MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 94.38,
            "range": "94.29-95.21MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 94.98,
            "range": "94.66-95.8MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ae7a67eceb909494eebfdafe84add98cacbda510",
          "message": "chore(main): release 7.11.7 (#651)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T21:18:41-05:00",
          "tree_id": "b5ccd1be38522c8b0bc6631fc1e720458b521ddc",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/ae7a67eceb909494eebfdafe84add98cacbda510"
        },
        "date": 1794105164804,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 63.29,
            "range": "62.4-63.93MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 63.71,
            "range": "62.41-64.22MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 63.1,
            "range": "60.82-63.72MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 63.06,
            "range": "60.82-63.89MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 73.71,
            "range": "62.2-74.35MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 73.61,
            "range": "62.16-74.25MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 64.71,
            "range": "64.22-65.5MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 65.07,
            "range": "64.5-65.62MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7a32f40e5591ee7855b76fb817f86232b10465ff",
          "message": "chore(main): release 7.11.8 (#655)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T10:26:33-05:00",
          "tree_id": "e07a7f04aeb37855bbc16ea291befce16d1aa0b5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7a32f40e5591ee7855b76fb817f86232b10465ff"
        },
        "date": 1794152603188,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 22.53,
            "range": "21.76-23MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 31.03,
            "range": "30.63-31.34MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 22.86,
            "range": "21.79-24.32MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 33.2,
            "range": "30.81-33.93MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 23.18,
            "range": "22.21-24.4MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 31.84,
            "range": "30.5-33.98MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 21.09,
            "range": "20.36-22.17MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 29.3,
            "range": "28.88-29.97MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "d647f44c7309e3a35f545fc488c30c3b450f43e2",
          "message": "chore(release): publish a manyfiles-overrides perf baseline after each release (#657)\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T15:37:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d647f44c7309e3a35f545fc488c30c3b450f43e2"
        },
        "date": 1794231949522,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 22.08,
            "range": "21.48-23.63MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 30.74,
            "range": "30.63-31.13MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 22.98,
            "range": "22.04-24.27MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 31.66,
            "range": "31.48-34.34MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 23.19,
            "range": "21.73-23.77MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 31.62,
            "range": "31.24-32.31MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 21.74,
            "range": "21.25-22.66MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 29.07,
            "range": "28.63-30.34MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794237962365,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 23.52,
            "range": "22.46-24.41MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 31.74,
            "range": "31.21-33.21MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 22.89,
            "range": "22.25-24.14MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 34.19,
            "range": "32.77-35.99MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 23.96,
            "range": "23.59-24.94MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 31.85,
            "range": "31.48-34.04MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 22.44,
            "range": "22.16-23.54MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 29.94,
            "range": "29.37-30.72MB",
            "unit": "MB"
          }
        ]
      }
    ],
    "Decompose Peak RSS (manyfiles-overrides)": [
      {
        "commit": {
          "author": {
            "name": "Matt Carvin",
            "username": "mcarvin8",
            "email": "90224411+mcarvin8@users.noreply.github.com"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "d647f44c7309e3a35f545fc488c30c3b450f43e2",
          "message": "chore(release): publish a manyfiles-overrides perf baseline after each release (#657)\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T15:37:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d647f44c7309e3a35f545fc488c30c3b450f43e2"
        },
        "date": 1794231964211,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles-overrides.xml.decompose",
            "value": 23.5,
            "range": "22.25-23.63MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.xml.recompose",
            "value": 31.13,
            "range": "30.79-31.9MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json.decompose",
            "value": 22.57,
            "range": "21.98-25.4MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json.recompose",
            "value": 32.57,
            "range": "32.01-35.13MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json5.decompose",
            "value": 22.54,
            "range": "22.44-24.29MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json5.recompose",
            "value": 31.29,
            "range": "31.12-32.66MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose",
            "value": 22.02,
            "range": "21.54-22.73MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose",
            "value": 29.38,
            "range": "28.53-29.45MB",
            "unit": "MB"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "41898282+github-actions[bot]@users.noreply.github.com",
            "name": "github-actions[bot]",
            "username": "github-actions[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794238114421,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles-overrides.xml.decompose",
            "value": 22.27,
            "range": "22.2-24.42MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.xml.recompose",
            "value": 31.3,
            "range": "30.76-32.6MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json.decompose",
            "value": 23.39,
            "range": "22.18-23.87MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json.recompose",
            "value": 32.41,
            "range": "31.54-37.11MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json5.decompose",
            "value": 22.53,
            "range": "21.82-25.62MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.json5.recompose",
            "value": 31.98,
            "range": "30.71-34.36MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose",
            "value": 22.01,
            "range": "20.86-23.36MB",
            "unit": "MB"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose",
            "value": 29.27,
            "range": "29.05-29.66MB",
            "unit": "MB"
          }
        ]
      }
    ]
  }
}