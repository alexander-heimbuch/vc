import * as path from 'path'
import { stat } from 'fs-extra'
import { SimpleGit } from 'simple-git';
import { workingDir } from '../helper/env'

export async function fetch(git: SimpleGit) {
  const fetchFile = path.resolve(workingDir, '.git', 'FETCH_HEAD')

  const { mtimeMs } = await stat(fetchFile);

  if (Date.now() - mtimeMs < 5 * 1000 * 60) {
    return
  }

  await git.fetch();
}
