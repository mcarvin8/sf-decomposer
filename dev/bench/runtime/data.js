window.BENCHMARK_DATA = {
  "lastUpdate": 1794267596758,
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
        "date": 1788382313461,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6130.56,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17320.14,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5405.97,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3242.33,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5411.82,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3365.19,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5911.69,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3920.93,
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
          "id": "48b16dfdc324c8595a63e71ba7b1e01341a39dd0",
          "message": "chore(main): release 7.3.4 (#592)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-03T12:05:37-04:00",
          "tree_id": "a0024253d5638004ee6a3eb5fd020c393c448098",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/48b16dfdc324c8595a63e71ba7b1e01341a39dd0"
        },
        "date": 1788452743922,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5587.36,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16313.82,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4662.96,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2822.66,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4835.17,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2984.65,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5252.32,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3508.07,
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
          "id": "9a4d07d8e412a5ccd310c5b184b073d7e0a93738",
          "message": "chore(main): release 7.4.0 (#596)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-04T12:57:05-04:00",
          "tree_id": "6fd26eac4db86ab5776d0329a02be55cc56cf0f8",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9a4d07d8e412a5ccd310c5b184b073d7e0a93738"
        },
        "date": 1788541876760,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5684.27,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16370.61,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3991.36,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2519.96,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3857.05,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2498.33,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4271.27,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2971.32,
            "unit": "ms"
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
        "date": 1788775703662,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6366.66,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17641.58,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5527.57,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3351.1,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5549.48,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3404.98,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6061.01,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3979.36,
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
          "id": "5f8d8633ed04c36f24423dee1af12427e7cab8b1",
          "message": "chore(main): release 7.4.1 (#598)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T09:47:37-04:00",
          "tree_id": "d9db1908bbc3c7c52cc0c151cfe0d22124f758e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/5f8d8633ed04c36f24423dee1af12427e7cab8b1"
        },
        "date": 1788875996823,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4481.11,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 13686.61,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3495.27,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2243.98,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3547.18,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2278.25,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3964.39,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2785.82,
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
          "id": "3cc06a1ba59074c6ccce442cd32bac1632ec7475",
          "message": "chore(main): release 7.4.2 (#600)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T10:56:45-04:00",
          "tree_id": "79e7d34ab2c37b739ef6878da42469439bd0e806",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3cc06a1ba59074c6ccce442cd32bac1632ec7475"
        },
        "date": 1788880297346,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5757.41,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16903.65,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4835.46,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2973.89,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4798.29,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3010.85,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5214.38,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3513.01,
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
          "id": "602412fdfcbd401d0548870ca768e605489cc0d0",
          "message": "chore(main): release 7.4.3 (#603)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-09T15:42:53-04:00",
          "tree_id": "38e5f5c17e887c8ecc8802a907fe67b0f75a04df",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/602412fdfcbd401d0548870ca768e605489cc0d0"
        },
        "date": 1788983952887,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 9224.69,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 15031.96,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3449.1,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2273.6,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3421.09,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2293.48,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3727.69,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2572.1,
            "unit": "ms"
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
        "date": 1789382054836,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6226.61,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17518,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5377.68,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3284.15,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5384.08,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3340.15,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5876.33,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3869.57,
            "unit": "ms"
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
        "date": 1789987183857,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6412.88,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17877.21,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5537.7,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3387.43,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5593.84,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3471.18,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6048.98,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4098.77,
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
          "id": "f023202ee6a43bf707dac47d0b560649ae7eee56",
          "message": "chore(main): release 7.5.0 (#605)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-21T09:06:35-04:00",
          "tree_id": "f173c1491ae88ff9cd4d089335b0279665746486",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f023202ee6a43bf707dac47d0b560649ae7eee56"
        },
        "date": 1789996978645,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6405.61,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17677.15,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5560.66,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3334.08,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5558.51,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3447.57,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6041.15,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3997.17,
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
          "id": "249439c67fe626eb158c893764fa2a8bb8a45495",
          "message": "ci(release): poll npm registry before triggering smoke test\n\nnpm publish can return before the registry finishes propagating, causing\nsf plugins install in smoke-test.yml to 404 on the just-published version.\nAdd a wait-for-npm job that polls npm view until the version resolves\n(15s interval, 10min cap) before smoke-test runs.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-21T13:18:29Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/249439c67fe626eb158c893764fa2a8bb8a45495"
        },
        "date": 1790595576434,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 7935.35,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 15300.22,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3451.61,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2247.81,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3550.21,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2256.2,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3759.79,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2606.9,
            "unit": "ms"
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
        "date": 1791202364486,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4017.33,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 10081.49,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3162.34,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2140.51,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3181.24,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2128.26,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3351.44,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2458.77,
            "unit": "ms"
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
        "date": 1791809967860,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4646.28,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 12868.85,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3691.8,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2332.19,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3718.56,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2344.43,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4051.38,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2754.25,
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
          "id": "cba238539e4ec7ec4718371a188e8cd3fbf539fe",
          "message": "chore(main): release 7.5.1 (#609)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-13T10:18:45-04:00",
          "tree_id": "99722c1ede7d6f6e088e7dd9831cfaa9b2d8c6ee",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cba238539e4ec7ec4718371a188e8cd3fbf539fe"
        },
        "date": 1791902267846,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5564.47,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16365.94,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4654.44,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2870.31,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4656.89,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2898.66,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5075.75,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3385.79,
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
          "id": "37fa00c637b6fa6231e4303d3319ab3a7a3241bd",
          "message": "docs: add troubleshooting for removing stale metadata references\n\nExplain how to delete decomposed files for deleted or uninstalled\ncomponents (e.g. managed package namespaces) and recompose, so\npermission sets and profiles deploy without stale references.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-14T12:41:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/37fa00c637b6fa6231e4303d3319ab3a7a3241bd"
        },
        "date": 1792406478585,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4513.81,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 13389.24,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3452.32,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2161.41,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3482.34,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2224.84,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3860.68,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2661.94,
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
          "id": "b8143b042d86301b97542d9978ab884c528fa382",
          "message": "chore(main): release 7.6.0 (#612)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-19T09:16:51-04:00",
          "tree_id": "c9760da29cf1414253ecdb231b3d403930ec6391",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8143b042d86301b97542d9978ab884c528fa382"
        },
        "date": 1792417029328,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6335.33,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17610.5,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5438.16,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3251,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5483.8,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3329.77,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5964.35,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3876.19,
            "unit": "ms"
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
        "date": 1793012293076,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5268.65,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 15595.15,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3852.81,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2454.79,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3831.76,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2460.87,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4289.91,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3003.99,
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
          "id": "a29e6f54a3eccf8b25662dfa848f7ffb5472927d",
          "message": "chore(main): release 7.7.0 (#614)",
          "timestamp": "2026-10-26T10:11:18-04:00",
          "tree_id": "8aaf5baa6831fc1bafce5e61e514e775630a536e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a29e6f54a3eccf8b25662dfa848f7ffb5472927d"
        },
        "date": 1793024867205,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6479.83,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 18016.87,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5549.86,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3323.78,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5548.92,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3370.13,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 6087.62,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4020.3,
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
          "id": "15e6a1a94e35b0a71e74d25811df0b452a3e1906",
          "message": "chore(main): release 7.8.0 (#617)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-31T13:58:00-04:00",
          "tree_id": "63a674d0aa5fe72422127e38a4eb6974a562458b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/15e6a1a94e35b0a71e74d25811df0b452a3e1906"
        },
        "date": 1793470608256,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6304.07,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 18147.3,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5206.59,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3134.58,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5182.51,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3203.51,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5363.35,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4838.4,
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
          "id": "8e99955923cd5f1836f16336816119806e0c1bc9",
          "message": "docs: remove v66 refs",
          "timestamp": "2026-10-31T20:51:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8e99955923cd5f1836f16336816119806e0c1bc9"
        },
        "date": 1793625752382,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5529.42,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16814.81,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4492.28,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2740.12,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 4540.69,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2834.24,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 4786.45,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4132.94,
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
          "id": "26e9f5661de672a15ccc17e67e290f159e1e435f",
          "message": "chore(main): release 7.9.0 (#621)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-02T13:15:19-05:00",
          "tree_id": "69ee026a459d1ff727d99da047355d0338a8650f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e9f5661de672a15ccc17e67e290f159e1e435f"
        },
        "date": 1793644332498,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6015.87,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 17267.28,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4964.64,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 3029.64,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5009.1,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3137.42,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5259.95,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4663.28,
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
          "id": "dc672e911fbe3da815273baec68ef87223f7fff6",
          "message": "chore(main): release 7.10.0 (#624)",
          "timestamp": "2026-11-03T14:41:16-05:00",
          "tree_id": "6321c95b1693ebe2ca92fd3ab4cee94a4cf62019",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/dc672e911fbe3da815273baec68ef87223f7fff6"
        },
        "date": 1793735868592,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5967.92,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 16999.17,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 4969.46,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2947.11,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5017.27,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 3082.2,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5211.94,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4645.23,
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
          "id": "819abc7a90cf7dcb611ad0f7bd50425d3563a995",
          "message": "chore(main): release 7.11.0 (#634)",
          "timestamp": "2026-11-05T19:36:36-05:00",
          "tree_id": "4fdc7e5267da5dcc72925e30d494854e488dc61b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/819abc7a90cf7dcb611ad0f7bd50425d3563a995"
        },
        "date": 1793926178878,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4792.67,
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 12525.97,
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3524.41,
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2136.51,
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3802.91,
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2279.36,
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3707.89,
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3233.65,
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
          "id": "3c00cef771c8147cc73166ddca969c450743d5f3",
          "message": "chore(main): release 7.11.1 (#638)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T12:24:51-05:00",
          "tree_id": "27f64d1a64a9a5f151330bdf83ff02789bc476fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3c00cef771c8147cc73166ddca969c450743d5f3"
        },
        "date": 1793986847419,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 6084.74,
            "range": "6024.86-6228.18ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 6077.72,
            "range": "6020.21-6223.74ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.34,
            "range": "4.44-7.02ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 13578.31,
            "range": "13558.84-15098.26ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 13453.87,
            "range": "13437.51-14977.32ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 121.12,
            "range": "116.66-124.44ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5155.4,
            "range": "5115.38-5282.73ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 5149.98,
            "range": "5110.63-5277.61ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.12,
            "range": "4.75-5.42ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2803.38,
            "range": "2737.39-2844.61ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1986.65,
            "range": "1945.26-2004.63ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 816.73,
            "range": "782.82-844.23ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5229.24,
            "range": "5157.27-5522.9ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 5223.06,
            "range": "5152.34-5517.3ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 5.61,
            "range": "4.92-7.18ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2904.35,
            "range": "2873.24-2940.11ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 2064.53,
            "range": "2035.56-2114.83ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 828.41,
            "range": "819.1-872.35ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5451.19,
            "range": "5419.77-5477.44ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 5446.35,
            "range": "5415.29-5472.48ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 4.96,
            "range": "4.48-5.04ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4000.5,
            "range": "3934.46-4262.7ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 3191.09,
            "range": "3137.73-3421.89ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 802.58,
            "range": "793.08-840.81ms",
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
          "id": "9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c",
          "message": "chore(main): release 7.11.2 (#640)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T16:14:34-05:00",
          "tree_id": "16039113b2a724fa8219102bfe3eb51eea7c11be",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c"
        },
        "date": 1794000478942,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 5682.76,
            "range": "5653.8-5724.67ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 5673.8,
            "range": "5648.79-5720.12ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.37,
            "range": "4.54-8.96ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 4220.28,
            "range": "4153.87-4348.59ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 4105.06,
            "range": "4026.23-4236.7ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 116.59,
            "range": "111.89-127.64ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 5215.51,
            "range": "5189.15-5307.05ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 5209.75,
            "range": "5183.98-5300.08ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.77,
            "range": "5.17-7.42ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2824.93,
            "range": "2743.18-2944.65ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 2007.39,
            "range": "1932.55-2138.23ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 810.63,
            "range": "787.09-831.4ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 5220.55,
            "range": "5193.61-5288.79ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 5215.01,
            "range": "5188.23-5284.12ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 5.38,
            "range": "4.67-5.54ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2839.48,
            "range": "2786.79-3110.16ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 2009.66,
            "range": "2006.25-2287.98ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 799.77,
            "range": "777.13-846.71ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 5495.37,
            "range": "5487.53-5665.07ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 5489.77,
            "range": "5482.05-5658.27ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 5.59,
            "range": "4.99-6.8ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 4028.9,
            "range": "3961.85-5010.12ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 3170.6,
            "range": "3127.01-4181.79ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 834.84,
            "range": "808.13-869.19ms",
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
          "id": "a5c4e943e7e5d3a4cab16041a9758dee6cadabd4",
          "message": "chore(main): release 7.11.3 (#643)",
          "timestamp": "2026-11-06T16:54:52-05:00",
          "tree_id": "24e18592914fd3182e8098ab792a838d97b806fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a5c4e943e7e5d3a4cab16041a9758dee6cadabd4"
        },
        "date": 1794002822857,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 3489.63,
            "range": "3193.72-4154.48ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 3485.21,
            "range": "3189.2-4151.04ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 4.25,
            "range": "3.44-4.52ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 4320.64,
            "range": "3648.93-6008.57ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 4236.48,
            "range": "3561.58-5927.53ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 87.35,
            "range": "81.04-97.04ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 2532.44,
            "range": "2509.22-2664.25ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 2529.23,
            "range": "2505.72-2659.67ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 3.86,
            "range": "3.21-4.58ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 2134.71,
            "range": "2063.88-2237.91ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1579.62,
            "range": "1514.78-1672.63ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 565.28,
            "range": "543.18-627.63ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 2531.69,
            "range": "2506.47-2555.49ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 2528.29,
            "range": "2503.36-2551.64ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 3.62,
            "range": "3.11-3.99ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2161.42,
            "range": "2126.79-2283.99ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1585.91,
            "range": "1560.09-1739.04ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 566.7,
            "range": "519.98-575.93ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 2665.89,
            "range": "2651.48-2738.4ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 2662.15,
            "range": "2648.17-2735.19ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 3.31,
            "range": "3.11-3.76ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2907.72,
            "range": "2852.84-3084.93ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2396.85,
            "range": "2345.62-2639.7ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 500.17,
            "range": "445.23-562.16ms",
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
          "id": "d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3",
          "message": "chore(main): release 7.11.4 (#645)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T15:46:00-05:00",
          "tree_id": "c0fc119c9304e74243a36719665cee32a6aee2d7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3"
        },
        "date": 1794085106989,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 3972.17,
            "range": "3949.08-4171.74ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 3967.45,
            "range": "3944.31-4167.22ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 4.72,
            "range": "4.5-4.81ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3808.01,
            "range": "3687-3826.73ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3688.72,
            "range": "3573-3713.45ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 113.99,
            "range": "109.87-119.29ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3395.26,
            "range": "3362.67-3421.61ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 3390.93,
            "range": "3357.3-3416.71ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 4.9,
            "range": "4.33-5.38ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1994.5,
            "range": "1955.26-2128.38ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1873.21,
            "range": "1818.5-1984.3ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 131.29,
            "range": "80.91-144.08ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3457.77,
            "range": "3451.66-3468.74ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 3452.52,
            "range": "3446.28-3463.13ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 5.25,
            "range": "4.69-6.95ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2052.73,
            "range": "1996.76-2246.41ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1966.91,
            "range": "1919.89-2108.82ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 85.82,
            "range": "72.01-137.59ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3708.57,
            "range": "3619.22-3818.89ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 3703.55,
            "range": "3614.56-3814.2ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 4.96,
            "range": "4.66-5.71ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3143.74,
            "range": "3105.97-3181.74ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 3060.69,
            "range": "3026.64-3128.6ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 53.13,
            "range": "46.93-130.9ms",
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
          "id": "227b33d905d5723c9f9f49968da711f4984ae7da",
          "message": "chore(main): release 7.11.5 (#647)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T16:14:09-05:00",
          "tree_id": "026193b40ada8e1e4e22d9633706ceb392af69e7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/227b33d905d5723c9f9f49968da711f4984ae7da"
        },
        "date": 1794086862937,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 4119.56,
            "range": "4012.58-4316.19ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 4114.28,
            "range": "4007.76-4311.81ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 4.99,
            "range": "4.38-5.53ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 4063.64,
            "range": "3867.11-4231.66ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3938.8,
            "range": "3744.08-4101.67ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 123.03,
            "range": "115.82-129.98ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 3474.42,
            "range": "3426.86-3599.59ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 3469.37,
            "range": "3422.07-3594.74ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.05,
            "range": "4.79-5.72ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1998.26,
            "range": "1942.63-2004.9ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1869.98,
            "range": "1820.71-1925.85ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 130.92,
            "range": "71.25-137.94ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 3484.53,
            "range": "3453.8-3667.3ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 3480.08,
            "range": "3449.17-3660.65ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 4.63,
            "range": "4.45-6.65ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 2065.63,
            "range": "2040.52-2092.71ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1971.95,
            "range": "1932.07-1998.96ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 93.75,
            "range": "68.56-133.56ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 3677.79,
            "range": "3621.04-3715.05ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 3671.74,
            "range": "3615.8-3708.05ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 6.05,
            "range": "5.24-7.05ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3153.68,
            "range": "3116.35-3336.15ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 3108,
            "range": "3070.09-3286.31ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 46.26,
            "range": "42.85-49.84ms",
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
          "id": "75b30c7cbd783394a72bb6970bdfd678179620ad",
          "message": "chore(main): release 7.11.6 (#649)",
          "timestamp": "2026-11-07T17:07:53-05:00",
          "tree_id": "a4a51a792d76a00b3b1080a1c82931a1191af6e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/75b30c7cbd783394a72bb6970bdfd678179620ad"
        },
        "date": 1794089988394,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 2181.06,
            "range": "2132.31-2246.38ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 2171.91,
            "range": "2125.06-2242.01ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.51,
            "range": "4.37-9.15ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3342.31,
            "range": "3270.81-3436.72ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3231.9,
            "range": "3170.27-3321.12ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 110.41,
            "range": "100.37-115.59ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 1235.2,
            "range": "1204.04-1269.89ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 1230.27,
            "range": "1199.46-1264.36ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.53,
            "range": "4.58-6.91ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1729.67,
            "range": "1635.04-1763.64ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1621.38,
            "range": "1560.4-1637.88ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 111.88,
            "range": "74.64-125.77ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 1169.7,
            "range": "1123.61-1252.62ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 1165.11,
            "range": "1118.72-1245.84ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 4.89,
            "range": "4.6-6.78ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1778.48,
            "range": "1744.7-1853.79ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1692.23,
            "range": "1633.26-1738.91ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 111.44,
            "range": "76.25-114.88ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1406.73,
            "range": "1273.5-1463.27ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1402.11,
            "range": "1267.77-1458.43ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 5.47,
            "range": "4.62-7.05ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2698.29,
            "range": "2623.42-2926.9ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2613.48,
            "range": "2512.49-2879.52ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 53.3,
            "range": "47.37-113.21ms",
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
          "id": "ae7a67eceb909494eebfdafe84add98cacbda510",
          "message": "chore(main): release 7.11.7 (#651)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T21:18:41-05:00",
          "tree_id": "b5ccd1be38522c8b0bc6631fc1e720458b521ddc",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/ae7a67eceb909494eebfdafe84add98cacbda510"
        },
        "date": 1794105036387,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 2366.15,
            "range": "2336.6-2419.26ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 2359.12,
            "range": "2330.08-2413.28ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 6.01,
            "range": "5.33-7.02ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3585.59,
            "range": "3530.52-3613.78ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3475.51,
            "range": "3413.15-3491.32ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 119.77,
            "range": "110.08-131.29ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 1325.51,
            "range": "1207.52-1379.17ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 1319.2,
            "range": "1203.09-1374.21ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 4.85,
            "range": "4.43-6.31ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1808.08,
            "range": "1800.23-2138.39ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1713.39,
            "range": "1665.53-2056.66ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 130.56,
            "range": "81.73-142.55ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 1332.27,
            "range": "1283.58-1372.87ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 1327.02,
            "range": "1279.07-1367.52ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 4.77,
            "range": "4.3-5.35ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1905.7,
            "range": "1873.41-1910.5ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1789.48,
            "range": "1777.91-1813.34ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 119.55,
            "range": "78.17-130.58ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1481.59,
            "range": "1360.88-1557.14ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1476.44,
            "range": "1356.09-1552.41ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 4.79,
            "range": "4.74-5.57ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2992.4,
            "range": "2942.29-3373.08ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2900.56,
            "range": "2844.41-3322.15ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 50.93,
            "range": "41.73-130.58ms",
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
          "id": "7a32f40e5591ee7855b76fb817f86232b10465ff",
          "message": "chore(main): release 7.11.8 (#655)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T10:26:33-05:00",
          "tree_id": "e07a7f04aeb37855bbc16ea291befce16d1aa0b5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7a32f40e5591ee7855b76fb817f86232b10465ff"
        },
        "date": 1794152428384,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 2454.08,
            "range": "2313.5-2484.3ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 2442.82,
            "range": "2308.16-2479.17ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.33,
            "range": "5.12-11.26ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3753.26,
            "range": "3544.88-3765.54ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3604.76,
            "range": "3404.55-3635.89ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 140.33,
            "range": "129.65-153.75ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 1252.14,
            "range": "1233.4-1355.89ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 1247.58,
            "range": "1226.91-1350.98ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.03,
            "range": "4.56-6.48ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1834.93,
            "range": "1779.33-1878.53ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1739.56,
            "range": "1682.42-1758.95ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 88.24,
            "range": "84.88-150.19ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 1369.78,
            "range": "1265.26-1405.56ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 1364.48,
            "range": "1258.65-1400.01ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 5.54,
            "range": "4.36-6.61ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1896.21,
            "range": "1857.1-1935.74ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1771.28,
            "range": "1724.22-1804.7ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 132.88,
            "range": "91.27-140.71ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1466.48,
            "range": "1360.3-1547.25ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1461.37,
            "range": "1355.46-1542.31ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 4.95,
            "range": "4.44-5.43ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 2964.23,
            "range": "2934.74-3023.05ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2886.19,
            "range": "2826.23-2920.53ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 53.88,
            "range": "48.71-136.86ms",
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
          "id": "d647f44c7309e3a35f545fc488c30c3b450f43e2",
          "message": "chore(release): publish a manyfiles-overrides perf baseline after each release (#657)\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T15:37:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d647f44c7309e3a35f545fc488c30c3b450f43e2"
        },
        "date": 1794231932535,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 2401.39,
            "range": "2375.5-2577.93ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 2393.17,
            "range": "2370.68-2571.83ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.47,
            "range": "4.68-8.22ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3682.9,
            "range": "3636.05-3847.68ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3563.47,
            "range": "3501.32-3686.3ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 135.55,
            "range": "119.43-161.38ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 1376.94,
            "range": "1275.52-1385.25ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 1370.01,
            "range": "1269.27-1380.38ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.87,
            "range": "4.87-6.93ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1843.33,
            "range": "1821.09-2048.29ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1748.37,
            "range": "1675.28-1920.29ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 128,
            "range": "89.05-145.81ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 1397.85,
            "range": "1265.29-1405.87ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 1391.26,
            "range": "1260.46-1401.19ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 6.07,
            "range": "4.68-6.65ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1931.86,
            "range": "1872.06-2047.96ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1838.99,
            "range": "1782.87-1957.58ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 92.15,
            "range": "89.19-135.96ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1446.99,
            "range": "1388.7-1553.37ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1441.1,
            "range": "1383.59-1548.18ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 5.19,
            "range": "4.71-6.9ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3096.81,
            "range": "3048.81-3310.85ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2965.55,
            "range": "2919.13-3172.29ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 131.26,
            "range": "55.2-138.57ms",
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
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794237816808,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 2433.41,
            "range": "2352.86-2687.29ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 2427.74,
            "range": "2347.84-2682.68ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 5.58,
            "range": "4.61-8.18ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 3694.38,
            "range": "3652.42-3898.5ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 3555.37,
            "range": "3511.64-3731.33ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 146.23,
            "range": "139.01-167.17ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 1352,
            "range": "1340.54-1361.67ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 1345.6,
            "range": "1335.52-1356.02ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 5.65,
            "range": "5.02-6.4ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1864.87,
            "range": "1778.93-1868.7ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1739.8,
            "range": "1695.04-1785.1ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 84.49,
            "range": "83.6-133.49ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 1362.35,
            "range": "1298.7-1418.54ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 1357.94,
            "range": "1293.64-1411.97ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 5.05,
            "range": "4.38-6.57ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1910.21,
            "range": "1870.82-1947.77ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1779.71,
            "range": "1728.17-1818.66ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 136.76,
            "range": "89.51-142.65ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1500.18,
            "range": "1398.03-1574.27ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1495.43,
            "range": "1393.23-1569.42ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 4.8,
            "range": "4.43-6.08ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 3038.34,
            "range": "2989.69-3225.28ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 2903.12,
            "range": "2860.65-3168.35ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 130.96,
            "range": "56.94-135.22ms",
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
          "id": "f98ed3dc03b72519ddab01150d2fd5aef4e827be",
          "message": "chore(main): release 7.12.1 (#661)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T16:00:22-05:00",
          "tree_id": "2345a08abfc18eb6873fd1686d5b216ed0c858ce",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f98ed3dc03b72519ddab01150d2fd5aef4e827be"
        },
        "date": 1794267445227,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 1655.09,
            "range": "1619.26-1776.14ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.crate",
            "value": 1651.56,
            "range": "1614.19-1772.1ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.decompose.wrapper",
            "value": 4.04,
            "range": "3.07-5.07ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 2532.63,
            "range": "2490.55-2625.64ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.crate",
            "value": 2464.8,
            "range": "2418.85-2558.76ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose.wrapper",
            "value": 71.69,
            "range": "64.95-77.73ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 962.28,
            "range": "913.44-1004.62ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.crate",
            "value": 959.4,
            "range": "910.29-1001.77ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose.wrapper",
            "value": 2.84,
            "range": "2.48-3.15ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 1262.19,
            "range": "1211.86-1271.19ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.crate",
            "value": 1191.53,
            "range": "1129.59-1226.42ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose.wrapper",
            "value": 75.22,
            "range": "44.78-82.27ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 968.44,
            "range": "928.68-1110.07ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.crate",
            "value": 965.76,
            "range": "924.98-1107.19ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose.wrapper",
            "value": 3.26,
            "range": "2.69-3.69ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 1270.23,
            "range": "1238.09-1315.14ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.crate",
            "value": 1223.03,
            "range": "1153.17-1278.82ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose.wrapper",
            "value": 43.52,
            "range": "30.22-84.93ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 1033.86,
            "range": "1007.48-1072.77ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.crate",
            "value": 1031.25,
            "range": "1004.21-1070.35ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose.wrapper",
            "value": 2.99,
            "range": "2.42-3.28ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 1699.04,
            "range": "1668.27-1717.85ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.crate",
            "value": 1665.81,
            "range": "1616.23-1681.38ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose.wrapper",
            "value": 36.47,
            "range": "33.22-56.51ms",
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
        "date": 1788382587162,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3299.23,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12686.97,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3173.5,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2334.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3149.35,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2385.8,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3508.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2823.57,
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
          "id": "48b16dfdc324c8595a63e71ba7b1e01341a39dd0",
          "message": "chore(main): release 7.3.4 (#592)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-03T12:05:37-04:00",
          "tree_id": "a0024253d5638004ee6a3eb5fd020c393c448098",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/48b16dfdc324c8595a63e71ba7b1e01341a39dd0"
        },
        "date": 1788453054994,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3687.82,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13770.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3512.12,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2779.46,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3564.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2896,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3908.79,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3280.46,
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
          "id": "9a4d07d8e412a5ccd310c5b184b073d7e0a93738",
          "message": "chore(main): release 7.4.0 (#596)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-04T12:57:05-04:00",
          "tree_id": "6fd26eac4db86ab5776d0329a02be55cc56cf0f8",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9a4d07d8e412a5ccd310c5b184b073d7e0a93738"
        },
        "date": 1788542158491,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3335.94,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12755.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3177.39,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2366.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3287.43,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2504.68,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3598.47,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3034.1,
            "unit": "ms"
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
        "date": 1788775982073,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3375.52,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12882.59,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3270.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2495.83,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3329.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2510.61,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3644.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2945.12,
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
          "id": "5f8d8633ed04c36f24423dee1af12427e7cab8b1",
          "message": "chore(main): release 7.4.1 (#598)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T09:47:37-04:00",
          "tree_id": "d9db1908bbc3c7c52cc0c151cfe0d22124f758e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/5f8d8633ed04c36f24423dee1af12427e7cab8b1"
        },
        "date": 1788876287220,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3356.01,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13166.47,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3237.36,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2410.6,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3280.13,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2483.87,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3709.27,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3040.33,
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
          "id": "3cc06a1ba59074c6ccce442cd32bac1632ec7475",
          "message": "chore(main): release 7.4.2 (#600)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-08T10:56:45-04:00",
          "tree_id": "79e7d34ab2c37b739ef6878da42469439bd0e806",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3cc06a1ba59074c6ccce442cd32bac1632ec7475"
        },
        "date": 1788880605509,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3509.45,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13533.35,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3423.96,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2496.15,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3426.69,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2578.26,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3856.52,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3133.45,
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
          "id": "602412fdfcbd401d0548870ca768e605489cc0d0",
          "message": "chore(main): release 7.4.3 (#603)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-09T15:42:53-04:00",
          "tree_id": "38e5f5c17e887c8ecc8802a907fe67b0f75a04df",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/602412fdfcbd401d0548870ca768e605489cc0d0"
        },
        "date": 1788984259427,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3547.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13603.24,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3445.09,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2655.02,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3361.7,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2607.55,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3891.53,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3331.51,
            "unit": "ms"
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
        "date": 1789382289412,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2654.56,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 11423.61,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2593.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1791.08,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2571.34,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1806.66,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2754.8,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2146.59,
            "unit": "ms"
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
        "date": 1789987388258,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2014.1,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 6732.66,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2072.48,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1736.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1996.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1848.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2133.76,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 1905.67,
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
          "id": "f023202ee6a43bf707dac47d0b560649ae7eee56",
          "message": "chore(main): release 7.5.0 (#605)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-09-21T09:06:35-04:00",
          "tree_id": "f173c1491ae88ff9cd4d089335b0279665746486",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f023202ee6a43bf707dac47d0b560649ae7eee56"
        },
        "date": 1789997206625,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2512.94,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 9746.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2428.82,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1890.54,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2623.88,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2035.28,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2849.11,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2385.8,
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
          "id": "249439c67fe626eb158c893764fa2a8bb8a45495",
          "message": "ci(release): poll npm registry before triggering smoke test\n\nnpm publish can return before the registry finishes propagating, causing\nsf plugins install in smoke-test.yml to 404 on the just-published version.\nAdd a wait-for-npm job that polls npm view until the version resolves\n(15s interval, 10min cap) before smoke-test runs.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-21T13:18:29Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/249439c67fe626eb158c893764fa2a8bb8a45495"
        },
        "date": 1790595870915,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3474.76,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13517.36,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3355.98,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2508.95,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3319.85,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2482.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3703.23,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3030.1,
            "unit": "ms"
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
        "date": 1791202557283,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2178.23,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 7278.82,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2295.37,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1943.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2389.13,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2110.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2539.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2239.52,
            "unit": "ms"
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
        "date": 1791810284155,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3942.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13950.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3643.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2747.98,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3789.16,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2957.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 4244.5,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3518.65,
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
          "id": "cba238539e4ec7ec4718371a188e8cd3fbf539fe",
          "message": "chore(main): release 7.5.1 (#609)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-13T10:18:45-04:00",
          "tree_id": "99722c1ede7d6f6e088e7dd9831cfaa9b2d8c6ee",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/cba238539e4ec7ec4718371a188e8cd3fbf539fe"
        },
        "date": 1791902467519,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2236.48,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 7489.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2144.08,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1825.38,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2271.7,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2020.44,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2434.99,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2286.83,
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
          "id": "37fa00c637b6fa6231e4303d3319ab3a7a3241bd",
          "message": "docs: add troubleshooting for removing stale metadata references\n\nExplain how to delete decomposed files for deleted or uninstalled\ncomponents (e.g. managed package namespaces) and recompose, so\npermission sets and profiles deploy without stale references.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-14T12:41:06Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/37fa00c637b6fa6231e4303d3319ab3a7a3241bd"
        },
        "date": 1792406773281,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3463.32,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13402.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3371.39,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2449.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3376.67,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2530.93,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3781.44,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3058.48,
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
          "id": "b8143b042d86301b97542d9978ab884c528fa382",
          "message": "chore(main): release 7.6.0 (#612)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-19T09:16:51-04:00",
          "tree_id": "c9760da29cf1414253ecdb231b3d403930ec6391",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/b8143b042d86301b97542d9978ab884c528fa382"
        },
        "date": 1792417338998,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3660.79,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13712.49,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3576.83,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2827.31,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3717.29,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2956.77,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 4117.01,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3452.49,
            "unit": "ms"
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
        "date": 1793012471898,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2026.43,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 6807.6,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1886.72,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1587.44,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1953.79,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1677.38,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2084.64,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 1937.65,
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
          "id": "a29e6f54a3eccf8b25662dfa848f7ffb5472927d",
          "message": "chore(main): release 7.7.0 (#614)",
          "timestamp": "2026-10-26T10:11:18-04:00",
          "tree_id": "8aaf5baa6831fc1bafce5e61e514e775630a536e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a29e6f54a3eccf8b25662dfa848f7ffb5472927d"
        },
        "date": 1793025178581,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3634.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13684.45,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3592.34,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2866.81,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3546.22,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2835.78,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3986.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3273.77,
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
          "id": "15e6a1a94e35b0a71e74d25811df0b452a3e1906",
          "message": "chore(main): release 7.8.0 (#617)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-10-31T13:58:00-04:00",
          "tree_id": "63a674d0aa5fe72422127e38a4eb6974a562458b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/15e6a1a94e35b0a71e74d25811df0b452a3e1906"
        },
        "date": 1793470778758,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1947.29,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 6849.94,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1884.45,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1524.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1886.78,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1536.66,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2050.72,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2091.33,
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
          "id": "8e99955923cd5f1836f16336816119806e0c1bc9",
          "message": "docs: remove v66 refs",
          "timestamp": "2026-10-31T20:51:05Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/8e99955923cd5f1836f16336816119806e0c1bc9"
        },
        "date": 1793626060488,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3519.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13254.72,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3702.29,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2687.21,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3699.24,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2812.89,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3858.85,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3713.52,
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
          "id": "26e9f5661de672a15ccc17e67e290f159e1e435f",
          "message": "chore(main): release 7.9.0 (#621)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-02T13:15:19-05:00",
          "tree_id": "69ee026a459d1ff727d99da047355d0338a8650f",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/26e9f5661de672a15ccc17e67e290f159e1e435f"
        },
        "date": 1793644611035,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2978.39,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 12019.71,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2948.11,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2147.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2934.74,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2145.25,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3115.63,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2926.47,
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
          "id": "dc672e911fbe3da815273baec68ef87223f7fff6",
          "message": "chore(main): release 7.10.0 (#624)",
          "timestamp": "2026-11-03T14:41:16-05:00",
          "tree_id": "6321c95b1693ebe2ca92fd3ab4cee94a4cf62019",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/dc672e911fbe3da815273baec68ef87223f7fff6"
        },
        "date": 1793736171444,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 3529.76,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 13615.48,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 3304.58,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2425.31,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 3289.5,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2527.49,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 3642.48,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3876.59,
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
          "id": "819abc7a90cf7dcb611ad0f7bd50425d3563a995",
          "message": "chore(main): release 7.11.0 (#634)",
          "timestamp": "2026-11-05T19:36:36-05:00",
          "tree_id": "4fdc7e5267da5dcc72925e30d494854e488dc61b",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/819abc7a90cf7dcb611ad0f7bd50425d3563a995"
        },
        "date": 1793926418538,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2700.85,
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 9924,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2674.18,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2060.77,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2701.42,
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2145.39,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2877.9,
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3086.67,
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
          "id": "3c00cef771c8147cc73166ddca969c450743d5f3",
          "message": "chore(main): release 7.11.1 (#638)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T12:24:51-05:00",
          "tree_id": "27f64d1a64a9a5f151330bdf83ff02789bc476fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/3c00cef771c8147cc73166ddca969c450743d5f3"
        },
        "date": 1793987047538,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2081.51,
            "range": "2039.46-2176.1ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 2078.85,
            "range": "2036.51-2173.43ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 2.67,
            "range": "2.65-2.95ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 5812.22,
            "range": "5702.48-6266.99ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 5737.37,
            "range": "5634.93-6197.39ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 70.8,
            "range": "67.55-75.81ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1996.43,
            "range": "1947.1-2172.89ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 1993.26,
            "range": "1944.36-2169.56ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 2.74,
            "range": "2.66-3.34ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1387.14,
            "range": "1343.84-1521.63ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1319.04,
            "range": "1260.99-1363.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 77.44,
            "range": "68.1-157.71ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1985.61,
            "range": "1930.76-2572.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 1980.67,
            "range": "1927.57-2568.39ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 3.64,
            "range": "2.62-4.95ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1402.61,
            "range": "1306.69-1498.21ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1327.35,
            "range": "1235.08-1428.76ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 71.61,
            "range": "69.45-75.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2182.36,
            "range": "2166.98-2303.62ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 2179.58,
            "range": "2163.33-2300.82ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 2.96,
            "range": "2.78-5.24ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 1988.56,
            "range": "1865.28-2069.34ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 1909.43,
            "range": "1787.32-1991.52ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 77.95,
            "range": "74.5-80.19ms",
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
          "id": "9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c",
          "message": "chore(main): release 7.11.2 (#640)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-06T16:14:34-05:00",
          "tree_id": "16039113b2a724fa8219102bfe3eb51eea7c11be",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/9e9cb62c932e9da1ec9d01be35c5cf7b93185e3c"
        },
        "date": 1794000674462,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2630.1,
            "range": "2614.19-2661.7ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 2625.13,
            "range": "2609.14-2657.52ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 4.97,
            "range": "4.18-5.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1680.45,
            "range": "1672.67-1709.79ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1579.85,
            "range": "1577.45-1602.74ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 101,
            "range": "95.22-107.05ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2546.81,
            "range": "2459.07-2588.87ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 2542.69,
            "range": "2454.02-2583.72ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 5.04,
            "range": "4.12-5.52ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1520.77,
            "range": "1458.12-1583.48ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1425.22,
            "range": "1364.39-1487.1ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 95.95,
            "range": "88.72-96.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2485.73,
            "range": "2463.88-2577.84ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 2480.51,
            "range": "2459.51-2572.36ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 5.22,
            "range": "4.36-6.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1533.51,
            "range": "1484.53-1591.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1443.25,
            "range": "1385.88-1487.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 98.66,
            "range": "90.26-105.38ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2718.36,
            "range": "2657.7-2874.37ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 2713.21,
            "range": "2653.63-2869.04ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 5.33,
            "range": "4.07-7.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2378.78,
            "range": "2364.33-2396.31ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2279.78,
            "range": "2268.18-2288.79ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 102.68,
            "range": "96.14-111.23ms",
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
          "id": "a5c4e943e7e5d3a4cab16041a9758dee6cadabd4",
          "message": "chore(main): release 7.11.3 (#643)",
          "timestamp": "2026-11-06T16:54:52-05:00",
          "tree_id": "24e18592914fd3182e8098ab792a838d97b806fe",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/a5c4e943e7e5d3a4cab16041a9758dee6cadabd4"
        },
        "date": 1794002972147,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1607.78,
            "range": "1513.29-1831.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 1604.33,
            "range": "1508.5-1828.09ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 3.17,
            "range": "2.89-4.79ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1622.98,
            "range": "1581.75-2700.17ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1547.8,
            "range": "1500-2490.05ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 81.75,
            "range": "75.18-210.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1552.72,
            "range": "1470.16-1604.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 1549.61,
            "range": "1467.26-1601.87ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 3.08,
            "range": "2.9-3.78ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1540.23,
            "range": "1454.53-1661.3ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1466.8,
            "range": "1379.12-1580.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 80.97,
            "range": "73.43-81.5ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1449.9,
            "range": "1400.33-1494.06ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 1447.05,
            "range": "1397.57-1490.17ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 2.82,
            "range": "2.76-3.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1402.92,
            "range": "1324.51-1500.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1326.32,
            "range": "1247.69-1423.06ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 77.27,
            "range": "71.87-123.97ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1538.84,
            "range": "1455.01-1633.61ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1533.9,
            "range": "1451.6-1630.71ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 3.41,
            "range": "2.62-4.94ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 1870.31,
            "range": "1750.58-1930.07ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 1797.03,
            "range": "1675.01-1854.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 75.63,
            "range": "73.28-81.45ms",
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
          "id": "d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3",
          "message": "chore(main): release 7.11.4 (#645)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T15:46:00-05:00",
          "tree_id": "c0fc119c9304e74243a36719665cee32a6aee2d7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d08eaf5f2aca57a0bfb05e0bf645c9face2dd7f3"
        },
        "date": 1794085325751,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 2520.22,
            "range": "2402.87-2642.09ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 2514.8,
            "range": "2394.68-2637.45ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 5.42,
            "range": "4.64-8.19ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 2427.95,
            "range": "2284.29-2558.28ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 2287.32,
            "range": "2157.58-2411.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 131.8,
            "range": "125.59-146.95ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 2330.84,
            "range": "2281.23-2414.59ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 2324.27,
            "range": "2275.55-2409.37ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 5.68,
            "range": "5.18-6.57ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 2073.13,
            "range": "2038.5-2113.96ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1957.74,
            "range": "1914.17-1989.37ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 124.43,
            "range": "114.56-128.7ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 2160.17,
            "range": "2136.02-2258.66ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 2152.24,
            "range": "2131.26-2252.84ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 5.43,
            "range": "4.75-7.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 2055.9,
            "range": "1991.29-2073.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1934.53,
            "range": "1873.17-1954.31ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 118.81,
            "range": "116.73-127.06ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 2351.14,
            "range": "2292.93-2464.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 2345.99,
            "range": "2287.06-2457.65ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 5.87,
            "range": "5.1-7.54ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3240.43,
            "range": "3182.28-3484.23ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 3119.1,
            "range": "3060.67-3358.95ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 121.34,
            "range": "116.42-125.28ms",
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
          "id": "227b33d905d5723c9f9f49968da711f4984ae7da",
          "message": "chore(main): release 7.11.5 (#647)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T16:14:09-05:00",
          "tree_id": "026193b40ada8e1e4e22d9633706ceb392af69e7",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/227b33d905d5723c9f9f49968da711f4984ae7da"
        },
        "date": 1794087033968,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1813.67,
            "range": "1789.47-1956.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 1809.85,
            "range": "1785.89-1952.24ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 3.82,
            "range": "3.58-3.99ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1787.7,
            "range": "1627.69-1871.67ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1699.14,
            "range": "1542.75-1785.39ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 87.45,
            "range": "84.94-91.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1728.31,
            "range": "1648.36-1785.99ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 1724.94,
            "range": "1644.92-1782.22ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 3.77,
            "range": "3.36-5.31ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1677.14,
            "range": "1605.8-1763.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1590.1,
            "range": "1517.55-1675.71ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 88.24,
            "range": "87.04-89.94ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1740.94,
            "range": "1729.38-1773.01ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 1737.28,
            "range": "1724.93-1769.02ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 3.99,
            "range": "3.46-4.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1675.34,
            "range": "1663.31-1720.1ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1582.57,
            "range": "1573.8-1633.56ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 90.77,
            "range": "86.54-92.78ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1826.76,
            "range": "1776.5-1857.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1823.19,
            "range": "1772.58-1853.47ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 3.61,
            "range": "3.46-3.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2432.54,
            "range": "2378.62-2512.01ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2342.17,
            "range": "2292.57-2419.28ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 86.2,
            "range": "84.67-92.73ms",
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
          "id": "75b30c7cbd783394a72bb6970bdfd678179620ad",
          "message": "chore(main): release 7.11.6 (#649)",
          "timestamp": "2026-11-07T17:07:53-05:00",
          "tree_id": "a4a51a792d76a00b3b1080a1c82931a1191af6e3",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/75b30c7cbd783394a72bb6970bdfd678179620ad"
        },
        "date": 1794090139744,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1130.13,
            "range": "1034.51-1286.32ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 1126.12,
            "range": "1031.27-1282.79ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 3.36,
            "range": "3.24-4.01ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1747.97,
            "range": "1648.06-2153.45ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1659.43,
            "range": "1559.16-2049.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 88.9,
            "range": "87.36-104.42ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 983.09,
            "range": "928.99-1216.19ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 979.23,
            "range": "925.55-1212.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 3.87,
            "range": "3.29-4.7ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1605.06,
            "range": "1470.68-1776.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1514.95,
            "range": "1385.04-1688.66ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 90.11,
            "range": "85.64-92.06ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 987.34,
            "range": "948.64-1066.55ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 982.05,
            "range": "944.72-1063.14ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 3.91,
            "range": "3.4-5.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1576.88,
            "range": "1528.39-1623.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1486.54,
            "range": "1442.46-1528.45ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 87.57,
            "range": "83.34-117.97ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1078.93,
            "range": "1018.13-1456.88ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1075.07,
            "range": "1014.12-1453.59ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 3.86,
            "range": "3.29-4.88ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2302.52,
            "range": "2250.14-2452.24ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2218.89,
            "range": "2163.17-2363.58ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 88.66,
            "range": "83.63-89ms",
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
          "id": "ae7a67eceb909494eebfdafe84add98cacbda510",
          "message": "chore(main): release 7.11.7 (#651)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T21:18:41-05:00",
          "tree_id": "b5ccd1be38522c8b0bc6631fc1e720458b521ddc",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/ae7a67eceb909494eebfdafe84add98cacbda510"
        },
        "date": 1794105160818,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 835.62,
            "range": "807.41-1154.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 832.11,
            "range": "803.99-1149.4ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 4.07,
            "range": "3.43-4.63ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1480.55,
            "range": "1423.17-1704.21ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1400.35,
            "range": "1343.5-1530.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 79.67,
            "range": "75.16-174.09ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 762.36,
            "range": "694.54-802.15ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 759.6,
            "range": "691.13-797.67ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 2.84,
            "range": "2.75-4.48ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1359.35,
            "range": "1314.49-1386.67ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1268.74,
            "range": "1243.12-1312.05ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 74.63,
            "range": "71.36-112.63ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 802.39,
            "range": "721.39-838.69ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 799.08,
            "range": "718.68-835.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 3.31,
            "range": "2.71-3.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1415.92,
            "range": "1313.49-1564.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1340.68,
            "range": "1237.81-1497.08ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 75.67,
            "range": "66.96-84.91ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 860.72,
            "range": "844.22-915.75ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 857.53,
            "range": "841.41-912.59ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 3.16,
            "range": "2.74-3.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 1970.17,
            "range": "1887.59-2008.82ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 1886.05,
            "range": "1802.63-1927.18ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 81.64,
            "range": "75.01-84.96ms",
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
          "id": "7a32f40e5591ee7855b76fb817f86232b10465ff",
          "message": "chore(main): release 7.11.8 (#655)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T10:26:33-05:00",
          "tree_id": "e07a7f04aeb37855bbc16ea291befce16d1aa0b5",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7a32f40e5591ee7855b76fb817f86232b10465ff"
        },
        "date": 1794152598576,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1123.89,
            "range": "1116.61-1132.26ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 1119.72,
            "range": "1110.95-1127.49ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 4.76,
            "range": "4.17-5.66ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 2009.5,
            "range": "1967.02-2056.35ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1893.14,
            "range": "1842.9-1934.49ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 121.65,
            "range": "116.36-124.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1048.4,
            "range": "1038.35-1072.2ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 1042.91,
            "range": "1032.81-1067.39ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 4.86,
            "range": "4.75-6.3ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1782.34,
            "range": "1710.87-1833.54ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1660.44,
            "range": "1597.38-1707.07ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 121.9,
            "range": "113.49-131.85ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1049.45,
            "range": "1039.92-1071.97ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 1044.79,
            "range": "1033.02-1067.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 4.84,
            "range": "4.34-6.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1843.71,
            "range": "1795.09-1884.01ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1723.33,
            "range": "1668.64-1773.51ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 120.38,
            "range": "110.5-126.46ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1216.4,
            "range": "1213.03-1245.41ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1211.49,
            "range": "1207.93-1240.34ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 4.91,
            "range": "4.69-5.74ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3068.33,
            "range": "3042.53-3070.74ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2947.35,
            "range": "2934.8-2954.07ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 116.67,
            "range": "106.64-123.19ms",
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
          "id": "d647f44c7309e3a35f545fc488c30c3b450f43e2",
          "message": "chore(release): publish a manyfiles-overrides perf baseline after each release (#657)\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T15:37:15Z",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/d647f44c7309e3a35f545fc488c30c3b450f43e2"
        },
        "date": 1794231945349,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 1167.5,
            "range": "1150.4-1171.27ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 1161.85,
            "range": "1145.35-1166.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 5.16,
            "range": "4.82-5.65ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 2142.49,
            "range": "2075.06-2193.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 2026.62,
            "range": "1958.13-2080.96ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 115.87,
            "range": "112.07-119.58ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1068.81,
            "range": "1058.15-1090.48ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 1063.27,
            "range": "1053.35-1085.78ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 4.97,
            "range": "4.7-5.54ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1830.85,
            "range": "1793.34-1873.82ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1716.2,
            "range": "1676.85-1759.54ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 115.91,
            "range": "114.29-120.53ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 1067.63,
            "range": "1048.89-1099.88ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 1062.98,
            "range": "1041.54-1093.07ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 6.24,
            "range": "4.14-7.35ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1906.24,
            "range": "1863.86-1976.76ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1790.58,
            "range": "1737.9-1862.17ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 115.65,
            "range": "112.11-135.5ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1239.52,
            "range": "1228.85-1256.86ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1235.07,
            "range": "1223.32-1250.04ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 5.53,
            "range": "4.45-6.97ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 3119.86,
            "range": "3017.27-3357.42ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 3002.36,
            "range": "2901.46-3239.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 117.5,
            "range": "115.81-122.08ms",
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
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794237958428,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 992.01,
            "range": "961.29-1002.27ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 988.63,
            "range": "957.37-998.73ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 3.61,
            "range": "3.38-3.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1686.68,
            "range": "1654.26-1708.52ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1589.03,
            "range": "1572.84-1616.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 89.1,
            "range": "78.48-97.65ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 904.39,
            "range": "870.76-933.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 900.82,
            "range": "867.07-929.65ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 3.69,
            "range": "3.57-4.28ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1538.77,
            "range": "1513.35-1615.58ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1445.96,
            "range": "1423.6-1516.33ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 92.13,
            "range": "83.73-99.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 892.1,
            "range": "859.62-934.23ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 888.18,
            "range": "856.16-930.01ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 3.93,
            "range": "3.46-4.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1569.69,
            "range": "1526.69-1608.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1485.26,
            "range": "1433.56-1505.59ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 93.13,
            "range": "78.5-102.85ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1026.28,
            "range": "998.97-1091.47ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1021.88,
            "range": "995.33-1087.9ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 3.64,
            "range": "3.48-4.4ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2323.93,
            "range": "2294.91-2338.92ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2223.2,
            "range": "2213.9-2245.27ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 87.09,
            "range": "81.01-100.73ms",
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
          "id": "f98ed3dc03b72519ddab01150d2fd5aef4e827be",
          "message": "chore(main): release 7.12.1 (#661)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T16:00:22-05:00",
          "tree_id": "2345a08abfc18eb6873fd1686d5b216ed0c858ce",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/f98ed3dc03b72519ddab01150d2fd5aef4e827be"
        },
        "date": 1794267596161,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles.xml.decompose",
            "value": 957.39,
            "range": "924.38-989.13ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.crate",
            "value": 953.67,
            "range": "919.77-984.84ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.decompose.wrapper",
            "value": 4.03,
            "range": "3.72-4.61ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose",
            "value": 1855.76,
            "range": "1807.92-1877.72ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.crate",
            "value": 1686.23,
            "range": "1637.78-1787.29ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.xml.recompose.wrapper",
            "value": 165.78,
            "range": "90.43-198.03ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose",
            "value": 1078.06,
            "range": "971-1302.06ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.crate",
            "value": 976.28,
            "range": "942.91-1208.77ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.decompose.wrapper",
            "value": 4.92,
            "range": "3.8-359.15ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose",
            "value": 1899.11,
            "range": "1680.32-2020.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.crate",
            "value": 1808.35,
            "range": "1573.83-1934.99ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json.recompose.wrapper",
            "value": 93.5,
            "range": "85.45-106.49ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose",
            "value": 887.05,
            "range": "886.57-1018.05ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.crate",
            "value": 882.71,
            "range": "882.55-1011.8ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.decompose.wrapper",
            "value": 4.34,
            "range": "3.87-6.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose",
            "value": 1740.92,
            "range": "1675.29-1820.21ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.crate",
            "value": 1618.62,
            "range": "1547.61-1683.24ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.json5.recompose.wrapper",
            "value": 91.25,
            "range": "87.39-193.32ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose",
            "value": 1084.83,
            "range": "978.97-1116.35ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.crate",
            "value": 1079.58,
            "range": "974.89-1112.04ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.decompose.wrapper",
            "value": 4.31,
            "range": "3.68-5.25ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose",
            "value": 2565.21,
            "range": "2303.38-2668.81ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.crate",
            "value": 2337.25,
            "range": "2138.38-2571.84ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles.yaml.recompose.wrapper",
            "value": 99.23,
            "range": "86.14-251.1ms",
            "unit": "ms"
          }
        ]
      }
    ],
    "Decompose Runtime (manyfiles-overrides)": [
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
        "date": 1794231959434,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles-overrides.xml.decompose",
            "value": 1202.69,
            "range": "1189.07-1214.16ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.decompose.crate",
            "value": 1196.14,
            "range": "1183.17-1206.8ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.decompose.wrapper",
            "value": 6.55,
            "range": "5.9-7.36ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose",
            "value": 2143.29,
            "range": "2098.32-2158.8ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose.crate",
            "value": 2036.92,
            "range": "1980.62-2037.75ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose.wrapper",
            "value": 111.81,
            "range": "106.12-121.04ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose",
            "value": 1138.77,
            "range": "1106.53-1393.42ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose.crate",
            "value": 1132.07,
            "range": "1098.34-1385.57ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose.wrapper",
            "value": 6.7,
            "range": "5.76-8.2ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose",
            "value": 1892.39,
            "range": "1864.45-1958.98ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose.crate",
            "value": 1774.88,
            "range": "1736.78-1853.15ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose.wrapper",
            "value": 116.29,
            "range": "105.83-127.67ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose",
            "value": 1143.9,
            "range": "1122.73-1155.49ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose.crate",
            "value": 1137.79,
            "range": "1116.92-1149.42ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose.wrapper",
            "value": 5.82,
            "range": "5.52-6.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose",
            "value": 1917.32,
            "range": "1862.61-1974.24ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose.crate",
            "value": 1801,
            "range": "1742.97-1863.84ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose.wrapper",
            "value": 116.32,
            "range": "110.4-121.27ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose",
            "value": 1302.68,
            "range": "1271.88-1325.14ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose.crate",
            "value": 1296.52,
            "range": "1265.25-1319.72ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose.wrapper",
            "value": 6.16,
            "range": "5.42-8.56ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose",
            "value": 3102.19,
            "range": "3079.93-3387.75ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose.crate",
            "value": 2982.8,
            "range": "2965.45-3266.21ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose.wrapper",
            "value": 119.39,
            "range": "114.48-129.33ms",
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
          "id": "7b7f97a27a5a0722c88957eb7cd9163aae826636",
          "message": "chore(main): release 7.12.0 (#659)\n\nCo-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T10:09:59-05:00",
          "tree_id": "10b633324d50ffb636bec423577a2917fb1d0c5e",
          "url": "https://github.com/mcarvin8/sf-decomposer/commit/7b7f97a27a5a0722c88957eb7cd9163aae826636"
        },
        "date": 1794238110653,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "manyfiles-overrides.xml.decompose",
            "value": 1153.72,
            "range": "1037.96-1160.35ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.decompose.crate",
            "value": 1147.73,
            "range": "1033.21-1155.3ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.decompose.wrapper",
            "value": 4.85,
            "range": "4.26-6.93ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose",
            "value": 1777.67,
            "range": "1737.09-1822.42ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose.crate",
            "value": 1675.68,
            "range": "1641.7-1733.59ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.xml.recompose.wrapper",
            "value": 95.38,
            "range": "88.84-110.36ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose",
            "value": 1026.29,
            "range": "957.78-1047.75ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose.crate",
            "value": 1019.76,
            "range": "952.19-1043.09ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.decompose.wrapper",
            "value": 5.24,
            "range": "4.66-6.53ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose",
            "value": 1637.51,
            "range": "1596.21-1668.07ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose.crate",
            "value": 1542.75,
            "range": "1496.1-1580.2ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json.recompose.wrapper",
            "value": 94.76,
            "range": "87.87-100.11ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose",
            "value": 1035.48,
            "range": "955.12-1121.86ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose.crate",
            "value": 1030.72,
            "range": "946-1116.18ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.decompose.wrapper",
            "value": 5.68,
            "range": "4.76-9.12ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose",
            "value": 1666.54,
            "range": "1629.1-1771.82ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose.crate",
            "value": 1569.21,
            "range": "1487.86-1677.67ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.json5.recompose.wrapper",
            "value": 94.15,
            "range": "82.1-161.66ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose",
            "value": 1211.91,
            "range": "1108.85-1462.19ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose.crate",
            "value": 1207.03,
            "range": "1101.72-1456.44ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.decompose.wrapper",
            "value": 5.75,
            "range": "4.89-7.13ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose",
            "value": 2513.89,
            "range": "2450.14-2524.78ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose.crate",
            "value": 2403.2,
            "range": "2292.99-2425.82ms",
            "unit": "ms"
          },
          {
            "name": "manyfiles-overrides.yaml.recompose.wrapper",
            "value": 110.69,
            "range": "98.96-157.15ms",
            "unit": "ms"
          }
        ]
      }
    ]
  }
}