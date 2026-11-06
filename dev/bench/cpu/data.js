window.BENCHMARK_DATA = {
  "lastUpdate": 1793986849434,
  "repoUrl": "https://github.com/mcarvin8/sf-decomposer",
  "entries": {
    "Decompose CPU (large)": [
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
        "date": 1793986849386,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "large.xml.decompose",
            "value": 14987.12,
            "range": "14980.08-15199.26ms",
            "unit": "ms"
          },
          {
            "name": "large.xml.recompose",
            "value": 45688.39,
            "range": "45514.52-47597.72ms",
            "unit": "ms"
          },
          {
            "name": "large.json.decompose",
            "value": 12153.45,
            "range": "12000.66-12192.48ms",
            "unit": "ms"
          },
          {
            "name": "large.json.recompose",
            "value": 7633.9,
            "range": "7409.98-7699.15ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.decompose",
            "value": 12153.38,
            "range": "12052.93-12248.84ms",
            "unit": "ms"
          },
          {
            "name": "large.json5.recompose",
            "value": 7855.85,
            "range": "7710.53-8043.86ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.decompose",
            "value": 12869.82,
            "range": "12763.49-12907.79ms",
            "unit": "ms"
          },
          {
            "name": "large.yaml.recompose",
            "value": 11975.51,
            "range": "11910.87-12304.81ms",
            "unit": "ms"
          }
        ]
      }
    ]
  }
}