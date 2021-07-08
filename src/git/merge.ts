import { SimpleGit } from 'simple-git';
import { exists, readFile } from 'fs-extra';
import { resolve } from 'path'

const { Select } = require('enquirer');

import stage from './stage';

export const mergeHead = async () => {
  const file = process.env.TEST_DIR ? resolve(process.env.TEST_DIR, '.git', 'MERGE_HEAD') : resolve('.git', 'MERGE_HEAD')

  if (!await exists(file)) {
    return null;
  }

  return await readFile(file, 'utf8')
}

export const mergeInProgress = async (git: SimpleGit): Promise<void> => {
  const mergeHash = await mergeHead()

  if (!mergeHash) {
    return;
  }

  const prompt = new Select({
    name: 'color',
    message: 'merge already in progress',
    choices: [
      {
        name: 'continue',
        message: 'continue merge',
      },
      { name: 'abort', message: 'abort merge' },
      { name: 'cancel', message: 'cancel' },
    ],
  });

  switch (await prompt.run()) {
    case 'abort':
      await git.merge(['--abort']);
    case 'continue':
      await stage(git);
      await git.merge(['--continue']);
    case 'cancel':
      throw new Error('merge aborted');
  }
};
