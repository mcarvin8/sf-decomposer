'use strict';
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

export async function getRepoRoot(): Promise<string> {
  const gitOptions: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: true,
  };

  const git: SimpleGit = simpleGit(gitOptions);
  const repoRoot = (await git.revparse('--show-toplevel')).trim();
  return repoRoot;
}
