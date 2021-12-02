import path from 'path';
import { ensureFile, writeFile } from 'fs-extra';
import gitP, { SimpleGit } from 'simple-git/promise';
import tmp, { DirectoryResult } from 'tmp-promise';
import { DefaultLogFields, LogResult } from 'simple-git';

interface TestEnv { dir: DirectoryResult, git: SimpleGit }
interface TestFile { path: string, content: string }

export async function init(): Promise<TestEnv> {
  const dir = await tmp.dir({ unsafeCleanup: true });
  const git: SimpleGit = gitP(dir.path);

  await git.init(['-b', 'main']);
  await git.addConfig('user.name', 'Integration Test')
  await git.addConfig('user.mail', 'integration@test')

  const testEnv = { dir, git }

  await file(testEnv, {
    path: 'README.md',
    content: `
      # TEST REPO
    `
  })

  await commit(testEnv, 'initial commit')

  return { dir, git };
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
  const branches = await (await env.git.branch());

  if (branches.all.some(branch => branch === branchName)) {
    await env.git.checkout([branchName]);
  } else {
    await env.git.checkout(['-b', branchName]);
  }

  return env;
}

export async function add(env: TestEnv, files: string | string[]): Promise<TestEnv> {
  await env.git.add(files)

  return env
}

export async function history(env: TestEnv): Promise<LogResult<DefaultLogFields>> {
  return await env.git.log()
}
