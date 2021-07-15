import path from 'path';
import { ensureFile, writeFile } from 'fs-extra';
import gitP, { SimpleGit } from 'simple-git/promise';
import tmp, { DirectoryResult } from 'tmp-promise';

interface TestEnv { dir: DirectoryResult, git: SimpleGit }
interface TestFile { path: string, content: string }

export async function init(): Promise<TestEnv> {
  const dir = await tmp.dir();
  const git: SimpleGit = gitP(dir.path);

  await git.addConfig('user.name', 'Integration Test')
  await git.addConfig('user.mail', 'integration@test')

  return { dir, git }
}

export async function file(env: TestEnv, file: TestFile) {
  const filePath = path.resolve(env.dir.path, file.path)
  await ensureFile(filePath);
  await writeFile(filePath, file.content);
}
