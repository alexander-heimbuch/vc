import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';

import spinner from '../io/spinner';
import { Options } from '../types/command.types';
import { CHECKOUT_BRANCH, NO_BRANCH_SELECTED, SWITCH_BRANCH } from '../io/messages';
import { selectBranch, branchList } from '../git/branch';
import { stashChanges } from '../git/stash';
import { fetch } from '../git/fetch';

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  await stashChanges(git);
  await spinner(fetch(git), 'fetching remotes');
  const branches = await branchList(git);

  const localBranches = branches.filter((branch) => !branch.startsWith('remote'));
  const remoteBranches = branches.filter((branch) => branch.startsWith('remote')).map((branch) => branch.replace('remotes/', ''));

  const branch = await selectBranch('branch', localBranches, { fallback: args });

  if (!branch) {
    return NO_BRANCH_SELECTED();
  }

  if (localBranches.includes(branch)) {
    await spinner(git.checkout([branch]), `switching to branch ${branch}`);
    return SWITCH_BRANCH(branch);
  }

  const remote = await selectBranch('remote', remoteBranches, { fallback: options.remote, allowEmpty: true });

  if (remote) {
    await spinner(git.checkout(['-b', branch, '--track', remote]), `checkout branch ${branch}`);
  } else {
    await spinner(git.checkout(['-b', branch]), `checkout branch ${branch}`);
  }

  return CHECKOUT_BRANCH(branch, remote);
}
