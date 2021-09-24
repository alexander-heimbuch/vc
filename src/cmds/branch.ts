import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';

import spinner from '../io/spinner';
import { Options } from '../types/command.types';
import { CHECKOUT_BRANCH, SWITCH_BRANCH } from '../io/messages';
import { selectBranch, branchList } from '../git/branch';
import { stashChanges } from '../git/stash';

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  try {
    await stashChanges(git);
    await spinner(git.fetch(), 'fetching remotes');
    const branches = await branchList(git);
    const branch = await selectBranch('branch', branches, { fallback: args });

    if (branches.includes(branch)) {
      await spinner(git.checkout([branch]), `switching to branch ${branch}`);
      return SWITCH_BRANCH(branch);
    }

    const remote = await selectBranch('remote', branches, { fallback: options.remote });

    if (remote) {
      await spinner(git.checkout(['-b', branch, '--track', remote]), `checkout branch ${branch}`);
    } else {
      await spinner(git.checkout(['-b', branch]), `checkout branch ${branch}`);
    }

    return CHECKOUT_BRANCH(branch, remote);
  } catch (err) {
    return Promise.resolve(Result.ofError(err));
  }
}
