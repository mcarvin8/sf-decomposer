'use strict';
import { promises as fsPromises, readFile, stat, readdir } from 'node:fs';
import git from 'isomorphic-git';

export async function getRepoRoot(): Promise<string> {
  const fs = { promises: fsPromises, readFile, stat, readdir };
  const repoRoot = await git.findRoot({
    fs,
    filepath: process.cwd(),
  });
  return repoRoot;
}
