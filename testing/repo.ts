
import gitP, { SimpleGit } from 'simple-git/promise';
import tmp, { DirectoryResult } from 'tmp-promise';

export async function init(): Promise<{ dir: DirectoryResult, git: SimpleGit }> {
  const dir = await tmp.dir();
  const git: SimpleGit = gitP(dir.path);

  return { dir, git }
}
