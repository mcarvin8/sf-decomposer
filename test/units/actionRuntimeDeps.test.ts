'use strict';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// docker/action-runtime-package.json pins the *only* two packages the GitHub Action's runtime
// image installs (see Dockerfile) -- deliberately not the repo's own package.json, which also
// lists the sf CLI plugin's @oclif/@salesforce dependencies. If those two versions drift from
// what the repo actually depends on, the Action would silently ship a stale/mismatched
// config-disassembler or @actions/core.

const rootPackageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
const runtimePackageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), 'docker/action-runtime-package.json'), 'utf-8'),
) as { dependencies: Record<string, string> };

describe('docker/action-runtime-package.json', () => {
  it('pins config-disassembler to the same version as the repo dependency', () => {
    expect(runtimePackageJson.dependencies['config-disassembler']).toBe(
      rootPackageJson.dependencies['config-disassembler'],
    );
  });

  it('pins @actions/core to the same version as the repo devDependency', () => {
    expect(runtimePackageJson.dependencies['@actions/core']).toBe(rootPackageJson.devDependencies['@actions/core']);
  });

  it('declares no dependencies beyond config-disassembler and @actions/core', () => {
    expect(Object.keys(runtimePackageJson.dependencies).sort()).toEqual(['@actions/core', 'config-disassembler']);
  });
});
