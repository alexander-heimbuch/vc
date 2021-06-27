import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';
const { Confirm } = require('enquirer');

import spinner from '../io/spinner';
import { Options } from '../types/command.types';
import { CHECKOUT_BRANCH, SWITCH_BRANCH } from '../io/messages';
import { selectBranch } from '../git/branch';

const stashChanges = async (git: SimpleGit): Promise<void> => {
  const status = await spinner(git.diffSummary(), 'checking repository state');

  if (status.files.length === 0) {
    return Promise.resolve();
  }

  const prompt = new Confirm({
    name: 'stash',
    message: 'Stash changes?',
    initial: true,
  });

  const stash = await prompt.run();

  if (!stash) {
    return Promise.reject(`You have unsaved changes, cant switch branch`);
  }

  await spinner(git.stash(), 'stashing changes');
};

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  try {
    await stashChanges(git);
    await spinner(git.fetch(), 'fetching remotes');
    const branchList = await spinner(git.branch(), 'fetching branches').then(({ all }) =>
      all.map((branch) => branch.replace('remotes/', ''))
    );

    const branch = await selectBranch('branch', branchList, { fallback: args });

    if (branchList.includes(branch)) {
      await spinner(git.checkout([branch]), `switching to branch ${branch}`);
      return SWITCH_BRANCH(branch);
    }

    const remote = await selectBranch('remote', branchList, { fallback: options.remote });

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
