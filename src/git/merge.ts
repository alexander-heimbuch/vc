import { exists, readFile } from 'fs-extra';
import { resolve } from 'path';

export const mergeHead = async () => {
  const file = process.env.VC_GIT_DIR ? resolve(process.env.VC_GIT_DIR, '.git', 'MERGE_HEAD') : resolve('.git', 'MERGE_HEAD');

  if (!(await exists(file))) {
    return null;
  }

  return await readFile(file, 'utf8');
};

export const mergeInProgress = async (): Promise<boolean> => {
  const mergeHash = await mergeHead();

  return !!mergeHash;
};
