window.BENCHMARK_DATA = {
  "lastUpdate": 1784571742413,
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
      }
    ]
  }
}