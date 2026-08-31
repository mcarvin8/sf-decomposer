window.BENCHMARK_DATA = {
  "lastUpdate": 1788176252973,
  "repoUrl": "https://github.com/mcarvin8/sf-decomposer",
  "entries": {
    "Decompose Runtime (large)": [
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
        "date": 1783544693459,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5085.13,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16551.74,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4039.23,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2610.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4141.38,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2684.37,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4551.39,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3258.26,
            "unit": "ms"
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
        "date": 1783798766322,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 7525.9,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16231.35,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3910.92,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2442.27,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3992.82,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2638.43,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4363.62,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3033.72,
            "unit": "ms"
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
        "date": 1783931205664,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6532.11,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17849.01,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5809.51,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3556.69,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5791.04,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3572.13,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6302.45,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4090.06,
            "unit": "ms"
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
        "date": 1783950715712,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6112.71,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17674.86,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5311.41,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3218.77,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5339.73,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3423.93,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5769.71,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3856.7,
            "unit": "ms"
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
        "date": 1783954537281,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6233.26,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17442.42,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5348.07,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3237.96,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5378.83,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3375.52,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5909.05,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3882.98,
            "unit": "ms"
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
        "date": 1784034095227,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5753.87,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 12658.96,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3350.23,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2229.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3459.04,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2209.6,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3732.9,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2567.71,
            "unit": "ms"
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
        "date": 1784224417319,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6473.25,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17792.24,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5688.01,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3467.18,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5714.88,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3524.96,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6233.36,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4064.56,
            "unit": "ms"
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
        "date": 1784535294429,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6026.84,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 13542.33,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3959.68,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2405.57,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3911.2,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2490.92,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4345.84,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2895.66,
            "unit": "ms"
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
        "date": 1784571441673,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6047.94,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17252.35,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5256.34,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3173.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5317.28,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3317.75,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5838.5,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3852.68,
            "unit": "ms"
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
        "date": 1785141728436,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6231.09,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17341.3,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5521.75,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3263.66,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5497.26,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3367.67,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5999.18,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3952.14,
            "unit": "ms"
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
        "date": 1785159299630,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6321.49,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17836.52,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5760.05,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3491.51,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5788.66,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3646.51,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6339.51,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4153.37,
            "unit": "ms"
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
        "date": 1785746381359,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6138.25,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17472.09,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5212.19,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3113.85,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5208.54,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3245.06,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5718.11,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3854.03,
            "unit": "ms"
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
        "date": 1785937364263,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6309.33,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17750.13,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5492.2,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3374.46,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5535.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3404.73,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5959.93,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3946.37,
            "unit": "ms"
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
        "date": 1786342730042,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4661.03,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 15663.87,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3713.68,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2438.06,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3774.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2530.29,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4197.06,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3031.31,
            "unit": "ms"
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
        "date": 1786546086457,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6290.54,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17612.61,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5559.61,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3321.79,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5485.74,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3448.23,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5997.17,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3991.26,
            "unit": "ms"
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
        "date": 1786840630275,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5553.92,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16526.73,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4698.16,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2932.54,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4791.37,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2947.15,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5151.49,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3517.3,
            "unit": "ms"
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
        "date": 1786945419874,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4599.89,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 15243.76,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3686.31,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2401.05,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3633.02,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2461.73,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4104.53,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2939.33,
            "unit": "ms"
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
        "date": 1787077338966,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5722.44,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16919.3,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4895.67,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3070.76,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4920.84,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3027.51,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5329.28,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3520.68,
            "unit": "ms"
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
        "date": 1787550323433,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 3676.68,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 9277.47,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3077.64,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2029.16,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3070.87,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2038.44,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3264.26,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2331.4,
            "unit": "ms"
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
        "date": 1787603205853,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4808.78,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 13180.21,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3844.72,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2342.53,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3855.35,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2436.44,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4208.88,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2922.11,
            "unit": "ms"
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
        "date": 1787605821014,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6188.21,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17578.91,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5471.44,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3320.35,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5469.19,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3388.94,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5958.18,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3945.78,
            "unit": "ms"
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
        "date": 1787659004938,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6164.56,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17605.91,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5428.57,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3274.95,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5458.43,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3467.58,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6016.07,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3933.97,
            "unit": "ms"
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
        "date": 1788175994394,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5109.4,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 12594.77,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3327.08,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2098.26,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3352.37,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2157.25,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3744.89,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2560.04,
            "unit": "ms"
          }
        ]
      }
    ],
    "Decompose Runtime (manyfiles)": [
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
        "date": 1783545016401,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3515.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13426.09,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3765.96,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2750.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3770.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2826.46,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 4128.39,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3339.35,
            "unit": "ms"
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
        "date": 1783799071037,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3559.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13575.46,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3540.68,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2636.1,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3402.43,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2590.34,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3741.4,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3005.01,
            "unit": "ms"
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
        "date": 1783931509382,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3497.92,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13390.5,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3434.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2540.08,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3400.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2460.98,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3851.09,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3063.39,
            "unit": "ms"
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
        "date": 1783951069421,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 4535.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 14364.33,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 4565.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 3353.87,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 4402.62,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 3348.8,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 4730.51,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3913.7,
            "unit": "ms"
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
        "date": 1783954824187,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3401.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13197.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3257.14,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2320,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3240,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2371.56,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3640.92,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2882.52,
            "unit": "ms"
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
        "date": 1784034345229,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2847.49,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12004.14,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2751.75,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1862.75,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2675.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1902.36,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2933.05,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2266.34,
            "unit": "ms"
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
        "date": 1784224654643,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2652.29,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 9892.33,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2575.01,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1967.35,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2617.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1950.48,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2880.84,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2326.72,
            "unit": "ms"
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
        "date": 1784535530232,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2583.41,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 9835.57,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2528.08,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1953.46,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2571.26,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1900.91,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2773.4,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2262.62,
            "unit": "ms"
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
        "date": 1784571741432,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3500.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13481.01,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3397.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2586.92,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3374.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2586.84,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3801.22,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3203.54,
            "unit": "ms"
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
        "date": 1785142022855,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3415.24,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12680.97,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3794.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2541.88,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3876.8,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2535.41,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 4183.19,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2986.72,
            "unit": "ms"
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
        "date": 1785159601967,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3554.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13680.07,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3405.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2546.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3366.83,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2638.59,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3840.34,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3124.66,
            "unit": "ms"
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
        "date": 1785746723578,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3765.28,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13400.86,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3818.86,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2529.71,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 5478.2,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 3099.79,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 5895.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3354.37,
            "unit": "ms"
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
        "date": 1785937631093,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2928.19,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12064.33,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3012.19,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1947.88,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3007.56,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2047.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3109.14,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2385.89,
            "unit": "ms"
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
        "date": 1786343029954,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3422.72,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13398.05,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3429.38,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2540.33,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3408.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2557.32,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3774.35,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3075.64,
            "unit": "ms"
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
        "date": 1786546367587,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2999.84,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12678.13,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2851.52,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2157.08,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2913.69,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2207.83,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3066.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2596.16,
            "unit": "ms"
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
        "date": 1786840925251,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3409.53,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13463.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3421.94,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2570.4,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3327.52,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2582.33,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3711.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3051.54,
            "unit": "ms"
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
        "date": 1786945704456,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3338.18,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13343.98,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3239.86,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2355.8,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3261.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2426.12,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3691.97,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3010,
            "unit": "ms"
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
        "date": 1787077642918,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3488.47,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13707.31,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3336.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2452.92,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3406.88,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2608.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3922.71,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3274.59,
            "unit": "ms"
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
        "date": 1787550622030,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3378.2,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12950.07,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3660.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2802.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3552.12,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2882.51,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3834.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3213.68,
            "unit": "ms"
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
        "date": 1787603594808,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3895.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13773.11,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3923.86,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2752.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 8091.61,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 4005.11,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 8583.66,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 4120.41,
            "unit": "ms"
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
        "date": 1787606116539,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3608.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12898.34,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3512.47,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2656.26,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3572.69,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2728.01,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3877.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3153,
            "unit": "ms"
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
        "date": 1787659308016,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3510.6,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13514.52,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3509.53,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2629.05,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3629.13,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2776.11,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3821.47,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3211.42,
            "unit": "ms"
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
        "date": 1788176251707,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2735.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 10404.76,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2590.77,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2264.96,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2617.83,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2089.23,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2839.84,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2432.44,
            "unit": "ms"
          }
        ]
      }
    ]
  }
}