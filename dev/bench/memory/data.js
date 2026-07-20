window.BENCHMARK_DATA = {
  "lastUpdate": 1784571443225,
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
      }
    ]
  }
}