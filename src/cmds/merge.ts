import { Result } from '@nozzlegear/railway';
import { Options } from 'ora';
import { SimpleGit } from 'simple-git';

import { mergeInProgress, mergeHead } from '../git/merge';
import { stashChanges } from '../git/stash';
import { selectBranch, branchList } from '../git/branch';
import spinner from '../io/spinner';
import { MERGE_SUCCESSFULL, APPLY_CHANGES } from '../io/messages';

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  const currentBranch = await spinner(git.status().then(({ current }) => current), 'get current branch');
  let stash;

  try {
    await mergeInProgress(git);
    stash = await stashChanges(git);

    const branches = await branchList(git);
    const branch = await selectBranch('branch', branches, { fallback: args });

    await spinner(git.checkout([currentBranch]), `switching to ${currentBranch}`);
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
