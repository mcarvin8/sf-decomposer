window.BENCHMARK_DATA = {
  "lastUpdate": 1783545019258,
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
      }
    ]
  }
}