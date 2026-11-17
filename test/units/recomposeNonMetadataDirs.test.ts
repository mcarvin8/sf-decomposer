'use strict';

import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// A metadata directory can hold folders that aren't metadata, e.g. UTAM page objects in
// `flexipages/__utam__/`. Recompose used to rebuild every subfolder as `<dir>.<suffix>-meta.xml`,
// turning `__utam__/` into `__utam__.flexipage-meta.xml` and then deleting it with --postpurge.
const FLEXIPAGE = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>sidebar</name>
        <type>Region</type>
    </flexiPageRegions>
    <masterLabel>Home</masterLabel>
    <type>AppPage</type>
</FlexiPage>
`;
const UTAM = { 'productExplorerPage.utam.json': '{ "root": true, "selector": { "css": "c-product" } }\n' };

async function listFiles(dir: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const walk = async (d: string): Promise<void> => {
    for (const entry of await readdir(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) await walk(full);
      else out[relative(dir, full).split('\\').join('/')] = await readFile(full, 'utf-8');
    }
  };
  await walk(dir);
  return out;
}

describe('recompose leaves folders that are not decomposed metadata alone', () => {
  let projectDir: string;
  let defaultDir: string;
  const log = vi.fn();

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'recompose-non-metadata-'));
    defaultDir = join(projectDir, 'force-app', 'main', 'default');
    await mkdir(join(defaultDir, 'flexipages', '__utam__'), { recursive: true });
    await writeFile(join(defaultDir, 'flexipages', 'Home.flexipage-meta.xml'), FLEXIPAGE);
    for (const [name, content] of Object.entries(UTAM)) {
      await writeFile(join(defaultDir, 'flexipages', '__utam__', name), content);
    }
    await cp(resolve('fixtures/package-dir-2/bots'), join(defaultDir, 'bots'), { recursive: true });
    await writeFile(
      join(projectDir, SFDX_CONFIG_FILE),
      JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }], sourceApiVersion: '68.0' }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it.each(['unique-id', 'grouped-by-tag'])(
    'round-trips flexipages and bots without touching non-metadata folders (%s)',
    async (strategy) => {
      const before = await listFiles(defaultDir);
      const options = { metadataTypes: ['flexipage', 'bot'], format: 'xml', ignoreDirs: undefined, log };

      await decomposeMetadataTypes({
        ...options,
        prepurge: true,
        postpurge: true,
        strategy,
        decomposeNestedPerms: false,
      });
      await recomposeMetadataTypes({ ...options, postpurge: true });

      expect(await listFiles(defaultDir)).toEqual(before);
    },
  );
});
