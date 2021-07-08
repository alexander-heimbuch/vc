import { SimpleGit } from 'simple-git';
const { Confirm } = require('enquirer');
import spinner from '../io/spinner';
import { STASH_CHANGES } from '../io/messages';

export const stashChanges = async (git: SimpleGit): Promise<string> => {
  const status = await spinner(git.diffSummary(), 'checking repository state');

  if (status.files.length === 0) {
    return Promise.resolve(null);
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

  return await spinner(git.stash(), 'stashing changes').then((stash) => {
    console.log(STASH_CHANGES());
    return stash;
  });
};
