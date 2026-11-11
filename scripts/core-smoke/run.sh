#!/usr/bin/env bash
# End-to-end smoke test for the standalone `sf-decomposer` command in sf-decomposer-core,
# run the way users run it: installed from a tarball or the npm registry, with no Salesforce
# CLI on the machine. Builds a scratch Salesforce DX project from the repo fixtures, then
# checks verify passes, decompose splits files, and decompose + recompose --postpurge gives
# back byte-identical metadata.
#
# Usage: scripts/core-smoke/run.sh <package spec>
#   <package spec>  a path to an `npm pack` tarball, or sf-decomposer-core@<version>
set -euo pipefail

SPEC="${1:?usage: run.sh <tarball path or sf-decomposer-core@version>}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Types in fixtures/ that cover the main shapes: flat (labels), unique-id children
# (permissionset, profile), workflows, multi-level (bot, loyaltyProgramSetup), and a
# sidecar extraction (externalServiceRegistration).
TYPES=(labels permissionset profile workflow flow bot loyaltyProgramSetup mutingpermissionset externalServiceRegistration)
TYPE_ARGS=()
for type in "${TYPES[@]}"; do TYPE_ARGS+=(-m "$type"); done

echo "Installing $SPEC"
mkdir -p "$WORK/tool"
npm install --prefix "$WORK/tool" --no-audit --no-fund --loglevel=error "$SPEC"
BIN="$WORK/tool/node_modules/.bin/sf-decomposer"

PROJECT="$WORK/project"
mkdir -p "$PROJECT"
cp -R "$REPO_ROOT/fixtures/package-dir-1" "$PROJECT/force-app"
cp -R "$REPO_ROOT/fixtures/package-dir-2" "$PROJECT/package"
cat > "$PROJECT/sfdx-project.json" <<'JSON'
{
  "packageDirectories": [{ "path": "force-app", "default": true }, { "path": "package" }],
  "sourceApiVersion": "58.0"
}
JSON
cp -R "$PROJECT/force-app" "$WORK/original-force-app"
cp -R "$PROJECT/package" "$WORK/original-package"
cd "$PROJECT"

if command -v sf >/dev/null 2>&1; then
  echo "Note: the Salesforce CLI is on PATH, but this test never calls it."
fi

echo "sf-decomposer $("$BIN" --version)"

echo "--- verify"
RUST_LOG=off "$BIN" verify "${TYPE_ARGS[@]}"

echo "--- decompose"
"$BIN" decompose "${TYPE_ARGS[@]}"
if [ ! -d force-app/permissionsets/HR_Admin ]; then
  echo "FAIL: decompose did not create force-app/permissionsets/HR_Admin"
  exit 1
fi

echo "--- recompose --postpurge"
"$BIN" recompose "${TYPE_ARGS[@]}" --postpurge

echo "--- compare with the original files"
diff -r "$WORK/original-force-app" force-app
diff -r "$WORK/original-package" package

echo "--- usage errors exit 1"
if "$BIN" decompose >/dev/null 2>&1; then
  echo "FAIL: decompose without -m, -x or -c should exit 1"
  exit 1
fi

echo "OK: round trip byte-identical for ${TYPES[*]}"
