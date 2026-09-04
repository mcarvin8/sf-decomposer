window.BENCHMARK_DATA = {
  "lastUpdate": 1788541879552,
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
      }
    ]
  }
}