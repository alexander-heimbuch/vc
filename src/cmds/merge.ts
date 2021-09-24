import { Result } from '@nozzlegear/railway';
import { Options } from 'ora';
import { SimpleGit } from 'simple-git';
import { prop } from 'ramda';

import { mergeInProgress } from '../git/merge';
import { stashChanges } from '../git/stash';
import { selectBranch, branchList } from '../git/branch';
import spinner from '../io/spinner';
import { MERGE_SUCCESSFULL, APPLY_CHANGES, NO_CURRENT_BRANCH, NO_VALID_BRANCH_SELECTED, MERGE_IN_PROGRESS } from '../io/messages';

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  let stash;

  try {
    const currentBranch: string = await spinner(git.status().then(prop('current')), 'get current branch');

    if (!currentBranch) {
      return Result.ofError(NO_CURRENT_BRANCH());
    }

    if (await mergeInProgress()) {
      return Result.ofError(MERGE_IN_PROGRESS());
    }

    stash = await stashChanges(git);

    const branches = await branchList(git);

    const branch = await selectBranch('branch', branches.filter(branch => branch !== currentBranch), { fallback: args });

    if (!branches.includes(branch) || branch === currentBranch) {
      return Result.ofError(NO_VALID_BRANCH_SELECTED());
    }

    await spinner(git.merge([branch]), `merging ${branch} → ${currentBranch}`);

    if (stash) {
      // TODO: reapply stash
      await spinner(git.stash(['pop']), `applying stash ${stash}`)
      console.log(APPLY_CHANGES(currentBranch));
    }

    return Result.ofValue(MERGE_SUCCESSFULL(currentBranch, branch));
  } catch (err) {
    return Result.ofError(err)
  }
}
