import path from 'path';
import { ensureFile, writeFile } from 'fs-extra';
import gitP, { SimpleGit } from 'simple-git/promise';
import tmp, { DirectoryResult } from 'tmp-promise';

interface TestEnv { dir: DirectoryResult, git: SimpleGit }
interface TestFile { path: string, content: string }

export async function init(): Promise<TestEnv> {
  const dir = await tmp.dir({ unsafeCleanup: true });
  const git: SimpleGit = gitP(dir.path);

  await git.init();
  await git.addConfig('user.name', 'Integration Test')
  await git.addConfig('user.mail', 'integration@test')

  return { dir, git }
}

export async function file(env: TestEnv, file: TestFile): Promise<TestEnv> {
  const filePath = path.resolve(env.dir.path, file.path)
  await ensureFile(filePath);
  await writeFile(filePath, file.content);

  return env;
}

export async function commit(env: TestEnv, message: string): Promise<TestEnv> {
  await env.git.add('*');
  await env.git.commit(message);

  return env;
}

export async function branch(env: TestEnv, branchName: string): Promise<TestEnv> {
  await env.git.checkout(['-b', branchName]);

  return env;
}
