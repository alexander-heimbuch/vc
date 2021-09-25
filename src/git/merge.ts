import { exists, readFile } from 'fs-extra';
import { resolve } from 'path';
import { workingDir } from '../helper/env';

export const mergeHead = async () => {
  const file = resolve(workingDir, '.git', 'MERGE_HEAD');

  if (!(await exists(file))) {
    return null;
  }

  return await readFile(file, 'utf8');
};

export const mergeInProgress = async (): Promise<boolean> => {
  const mergeHash = await mergeHead();

  return !!mergeHash;
};
