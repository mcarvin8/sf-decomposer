window.BENCHMARK_DATA = {
  "lastUpdate": 1783931206588,
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
      }
    ]
  }
}