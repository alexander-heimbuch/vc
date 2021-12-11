import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git';
import { PUSH_FAILED, PUSH_SUCCESSFULL } from '../io/messages';
import { selectBranch } from '../git/branch';
import { fetch } from '../git/fetch';

import spinner from '../io/spinner';
import { Options } from '../types/command.types';

export default async function (git: SimpleGit, remote: string, options: Options): Promise<Result<any>> {
  let branch = options.branch;
  const force = options.force ? ['--force-with-lease'] : [];

  try {
    const { tracking, current } = await git.status();
    // vcs push
    if (!remote && !options.branch && tracking) {
      await git.push();
      return Result.ofValue(PUSH_SUCCESSFULL(current, tracking));
    }

    // vcs push [remote]
    await spinner(fetch(git), 'fetching remotes');
    const remoteName = remote || 'origin';
    const branchList = await spinner(git.branch(), 'fetching branches').then(({ all }) =>
      all
        .map((branchName) => branchName.replace('remotes/', ''))
        .filter((branchName) => branchName.startsWith(remoteName))
        .map((branchName) => branchName.replace(remoteName + '/', ''))
    );

    const branchName = await selectBranch('remote branch', branchList, { fallback: branch, initial: current });

    // new branch
    if (!branchList.includes(branchName)) {
      console.log('call!')
      await git.push([...force, '--set-upstream', remoteName, branchName]);
    } else {
      await git.push([...force, remoteName, branchName]);
    }

    return Result.ofValue(PUSH_SUCCESSFULL(current, `${remoteName}/${branchName}`));
  } catch (err) {
    return Result.ofError(PUSH_FAILED(err));
  }
}
